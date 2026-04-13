<?php

namespace App\Http\Controllers\API;

use App\Exports\ProductExcelExport;
use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductCollection;
use App\Http\Resources\ProductResource;
use App\Imports\ProductImport;
use App\Models\MainProduct;
use App\Models\ManageStock;
use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\SaleItem;
use App\Models\VariationProduct;
use App\Repositories\ProductRepository;
use App\Support\VariationSku;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ProductAPIController extends AppBaseController
{
    /** @var ProductRepository */
    private $productRepository;

    public function __construct(ProductRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public function nextVariationSkuCodes(Request $request): JsonResponse
    {
        $request->validate([
            'product_name' => 'nullable|string',
            'variation_type_names' => 'required|array',
            'variation_type_names.*' => 'nullable|string',
            'brand_id' => 'nullable|integer|exists:brands,id',
        ]);

        $brandId = $request->filled('brand_id') ? (int) $request->brand_id : null;

        [$codes, $component] = VariationSku::nextCodesForLabels(
            (string) $request->input('product_name', ''),
            $request->input('variation_type_names', []),
            $brandId
        );

        return $this->sendResponse([
            'codes' => $codes,
            'component' => $component,
        ], 'OK');
    }

    public function index(Request $request): ProductCollection
    {
        $perPage = getPageSize($request);
        $products = $this->productRepository;

        if ($request->get('product_unit')) {
            $products->where('product_unit', $request->get('product_unit'));
        }

        if ($request->get('warehouse_id') && $request->get('warehouse_id') != 'null') {
            $warehouseId = $request->get('warehouse_id');
            $products->whereHas('stock', function ($q) use ($warehouseId) {
                $q->where('manage_stocks.warehouse_id', $warehouseId);
            })->with([
                'stock' => function (HasOne $query) use ($warehouseId) {
                    $query->where('manage_stocks.warehouse_id', $warehouseId);
                },
            ]);
        }

        if (isset($request->filter['search'])) {
            $search = $request->filter['search'];
            $products->whereHas('mainProduct', function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            });
        }

        $products = $products->paginate($perPage);
        ProductResource::usingWithCollection();

        return new ProductCollection($products);
    }

    /**
     * @return ProductResource|JsonResponse
     */
    public function store(CreateProductRequest $request)
    {
        $input = $request->all();

        if ($input['main_product_id']) {
            $mainProduct = MainProduct::find($input['main_product_id']);
            if ($mainProduct->product_type == MainProduct::SINGLE_PRODUCT) {
                return $this->sendError('You can add variations for single type product');
            }
        }

        if ($input['barcode_symbol'] == Product::EAN8 && strlen($input['code']) != 7) {
            return $this->sendError('Please enter 7 digit code');
        }

        if ($input['barcode_symbol'] == Product::UPC && strlen($input['code']) != 11) {
            return $this->sendError(' Please enter 11 digit code');
        }

        $product = $this->productRepository->storeProduct($input);

        VariationProduct::create([
            'product_id' => $product->id,
            'variation_id' => $input['variation_id'],
            'variation_type_id' => $input['variation_type'],
            'main_product_id' => $input['main_product_id'],
        ]);

        return new ProductResource($product);
    }

    public function show($id): ProductResource
    {
        $product = $this->productRepository->find($id);

        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, $id): ProductResource
    {
        $input = $request->all();

        $product = $this->productRepository->updateProduct($input, $id);

        if ($product->mainProduct && $product->mainProduct->product_type == MainProduct::SINGLE_PRODUCT) {
            $product->mainProduct->code = $product->code;
            $product->mainProduct->save();
        }

        return new ProductResource($product);
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $purchaseItemModels = [
                PurchaseItem::class,
            ];
            $saleItemModels = [
                SaleItem::class,
            ];
            $purchaseResult = canDelete($purchaseItemModels, 'product_id', $id);
            $saleResult = canDelete($saleItemModels, 'product_id', $id);
            if ($purchaseResult || $saleResult) {
                // Log conciso do motivo do bloqueio
                $blockedBy = [];
                if ($purchaseResult) {
                    $purchaseCount = PurchaseItem::where('product_id', $id)->count();
                    $blockedBy[] = "compras:{$purchaseCount}";
                }
                if ($saleResult) {
                    $saleCount = SaleItem::where('product_id', $id)->count();
                    $blockedBy[] = "vendas:{$saleCount}";
                }
                Log::warning("Produto #{$id} não pode ser excluído", [
                    'product_id' => $id,
                    'bloqueado_por_detalhes' => implode(', ', $blockedBy)
                ]);
                
                DB::rollBack();
                
                // Mensagem específica baseada no motivo do bloqueio
                if ($purchaseResult && $saleResult) {
                    return $this->sendError(__('messages.error.product_cant_deleted_has_purchases_and_sales'));
                } elseif ($purchaseResult) {
                    return $this->sendError(__('messages.error.product_cant_deleted_has_purchases'));
                } else {
                    return $this->sendError(__('messages.error.product_cant_deleted_has_sales'));
                }
            }

            $product = $this->productRepository->find($id);
            if (!$product) {
                DB::rollBack();
                return $this->sendError('Product not found');
            }

            $mainProduct = MainProduct::withCount('products')->find($product->main_product_id);
            if ($mainProduct && $mainProduct->product_type == MainProduct::VARIATION_PRODUCT && $mainProduct->products_count <= 1) {
                DB::rollBack();
                return $this->sendError('You can not delete last variation product');
            }

            // Excluir todos os estoques relacionados ao produto ANTES de excluir o produto
            ManageStock::where('product_id', $id)->delete();

            // Excluir variação do produto
            VariationProduct::where('product_id', $id)->delete();

            // Excluir o produto
            $this->productRepository->delete($id);

            // Excluir arquivo de código de barras (fora da transação, pois é arquivo)
            if (File::exists(Storage::path('product_barcode/barcode-PR_' . $id . '.png'))) {
                File::delete(Storage::path('product_barcode/barcode-PR_' . $id . '.png'));
            }

            DB::commit();

            return $this->sendSuccess('Product deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao excluir produto #{$id}: " . $e->getMessage(), [
                'product_id' => $id,
                'error' => $e->getTraceAsString(),
            ]);
            return $this->sendError('Error deleting product: ' . $e->getMessage(), 500);
        }
    }

    public function productImageDelete($mediaId): JsonResponse
    {
        $media = Media::where('id', $mediaId)->firstOrFail();
        $media->delete();

        return $this->sendSuccess('Product image deleted successfully');
    }

    public function importProducts(Request $request): JsonResponse
    {
        Excel::import(new ProductImport, request()->file('file'));

        return $this->sendSuccess('Products imported successfully');
    }

    public function getProductExportExcel(Request $request): JsonResponse
    {
        if (Storage::exists('excel/product-excel-export.xlsx')) {
            Storage::delete('excel/product-excel-export.xlsx');
        }
        Excel::store(new ProductExcelExport, 'excel/product-excel-export.xlsx');

        $data['product_excel_url'] = Storage::url('excel/product-excel-export.xlsx');

        return $this->sendResponse($data, 'Product retrieved successfully');
    }

    public function getAllProducts()
    {
        $products = Product::all();
        $data = [];

        foreach ($products as $product) {
            $data[] = [
                'id' => $product->id,
                'name' => $product->name,
            ];
        }

        return $this->sendResponse($data, 'Products retrieve successfully.');
    }

    public function generateStandaloneBarcode(Request $request)
    {
        $barcode =  $this->productRepository->generateBarcodeBase64($request->code);
        return $this->sendResponse($barcode, 'Barcode generated successfully.');
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $input = $request->all();

        if (!isset($input['product_ids']) || !is_array($input['product_ids']) || empty($input['product_ids'])) {
            return $this->sendError('Product IDs are required');
        }

        $updateData = [];
        
        if (isset($input['product_cost'])) {
            $updateData['product_cost'] = $input['product_cost'];
        }
        
        if (isset($input['product_price'])) {
            $updateData['product_price'] = $input['product_price'];
        }
        
        if (isset($input['stock_alert'])) {
            $updateData['stock_alert'] = $input['stock_alert'];
        }

        if (empty($updateData)) {
            return $this->sendError('At least one field must be provided for update');
        }

        try {
            DB::beginTransaction();
            
            foreach ($input['product_ids'] as $productId) {
                $product = Product::find($productId);
                
                if (!$product) {
                    continue;
                }

                $this->productRepository->update($updateData, $product->id);
            }
            
            DB::commit();
            
            return $this->sendSuccess('Products updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage());
        }
    }
}

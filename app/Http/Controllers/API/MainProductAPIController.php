<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateMainProductRequest;
use App\Http\Requests\UpdateMainProductRequest;
use App\Http\Resources\MainProductCollection;
use App\Http\Resources\MainProductResource;
use App\Models\MainProduct;
use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\SaleItem;
use App\Models\VariationProduct;
use App\Repositories\MainProductRepository;
use App\Repositories\ProductRepository;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class MainProductAPIController extends AppBaseController
{
    /** @var MainProductRepository */
    private $mainProductRepository;

    public function __construct(MainProductRepository $mainProductRepository)
    {
        $this->mainProductRepository = $mainProductRepository;
    }


    public function index(Request $request)
    {
        $perPage = getPageSize($request);
        $products = $this->mainProductRepository;

        if ($request->get('product_unit')) {
            $products->where('product_unit', $request->get('product_unit'));
        }

        if ($request->get('brand_id')) {
            $products->whereHas('products.brand', function ($q) use ($request) {
                $q->where('brands.id', $request->get('brand_id'));
            });
        }

        if ($request->get('product_category_id')) {
            $products->whereHas('products.productCategory', function ($q) use ($request) {
                $q->where('product_categories.id', $request->get('product_category_id'));
            });
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

        $products = $products->paginate($perPage);
        MainProductResource::usingWithCollection();

        return new MainProductCollection($products);
    }

    public function show($id): MainProductResource
    {
        /** @var MainProduct $mainProduct */
        $mainProduct = $this->mainProductRepository->find($id);

        return new MainProductResource($mainProduct);
    }

    public function store(CreateMainProductRequest $request)
    {
        $input = $request->all();

        try {
            DB::beginTransaction();

            $productRepo = app(ProductRepository::class);
            $mainProduct = MainProduct::create([
                'name' => $input['name'],
                'code' => $input['product_code'],
                'product_unit' => $input['product_unit'],
                'product_type' => $input['product_type'],
            ]);

            if (isset($input['images']) && !empty($input['images'])) {
                foreach ($input['images'] as $image) {
                    $product['image_url'] = $mainProduct->addMedia($image)->toMediaCollection(
                        MainProduct::PATH,
                        config('app.media_disc')
                    );
                }
            }

            $input['main_product_id'] = $mainProduct->id;
            if ($input['product_type'] == 2) {
                $commonProductInput = Arr::except($input, 'variation_data');

                $variationData = $input['variation_data'];
                foreach ($variationData as $key => $variation) {
                    $variation = array_merge($variation, $commonProductInput);
                    $product = $productRepo->storeProduct($variation);

                    VariationProduct::create([
                        'product_id' => $product->id,
                        'variation_id' => $variation['variation_id'],
                        'variation_type_id' => $variation['variation_type_id'],
                        'main_product_id' => $mainProduct->id,
                    ]);
                }
            } else {
                $product = $productRepo->storeProduct($input);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }

        return new MainProductResource($product);
    }

    public function update(UpdateMainProductRequest $request, $id): MainProductResource
    {
        $input = $request->all();
        $mainProduct = MainProduct::find($id);

        if ($mainProduct->product_type == MainProduct::SINGLE_PRODUCT && Product::where('code', $input['product_code'])->whereNot('main_product_id', $mainProduct->id)->exists()) {
            throw new UnprocessableEntityHttpException(__('validation.unique', ['attribute' => __('messages.pdf.product_code')]));
        }

        $mainProduct->update([
            'name' => $input['name'],
            'code' => $input['product_code'],
            'product_unit' => $input['product_unit'],
        ]);


        if (isset($input['images']) && !empty($input['images'])) {
            foreach ($input['images'] as $image) {
                $product['image_url'] = $mainProduct->addMedia($image)->toMediaCollection(
                    MainProduct::PATH,
                    config('app.media_disc')
                );
            }
        }

        $products = Product::with('variationType')->where('main_product_id', $id)->get();

        foreach ($products as $product) {
            if ($mainProduct->product_type == MainProduct::VARIATION_PRODUCT) {
                $input['code'] = $product->code ?? $input['product_code'];
            } else {
                $input['code'] = $input['product_code'];
            }
            $productRepo = app(ProductRepository::class);
            $product = $productRepo->updateProduct($input, $product->id);
        }

        return new MainProductResource($product);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $input = $request->all();

        if (!isset($input['product_ids']) || !is_array($input['product_ids']) || empty($input['product_ids'])) {
            return $this->sendError('Product IDs are required');
        }

        $updateData = [];
        
        if (isset($input['sale_unit'])) {
            $updateData['sale_unit'] = $input['sale_unit'];
        }
        
        if (isset($input['brand_id'])) {
            $updateData['brand_id'] = $input['brand_id'];
        }
        
        if (isset($input['product_category_id'])) {
            $updateData['product_category_id'] = $input['product_category_id'];
        }

        if (empty($updateData)) {
            return $this->sendError('At least one field must be provided for update');
        }

        try {
            DB::beginTransaction();
            
            $productRepo = app(ProductRepository::class);
            
            foreach ($input['product_ids'] as $mainProductId) {
                $mainProduct = MainProduct::find($mainProductId);
                
                if (!$mainProduct) {
                    continue;
                }

                // Atualizar produtos relacionados ao main_product
                $products = Product::where('main_product_id', $mainProductId)->get();
                
                foreach ($products as $product) {
                    $productUpdateData = $updateData;
                    $productRepo->update($productUpdateData, $product->id);
                }
            }
            
            DB::commit();
            
            return $this->sendSuccess('Products updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage());
        }
    }

    public function bulkDuplicate(Request $request): JsonResponse
    {
        $input = $request->all();

        if (!isset($input['product_ids']) || !is_array($input['product_ids']) || empty($input['product_ids'])) {
            return $this->sendError('Product IDs are required');
        }

        try {
            DB::beginTransaction();
            
            $productRepo = app(ProductRepository::class);
            
            // Buscar o maior código numérico existente para gerar sequência
            $lastCodeNumber = 0;
            
            // Buscar em Products - pegar todos e filtrar localmente
            $products = Product::whereNotNull('code')->get();
            
            foreach ($products as $product) {
                // Extrair número do código (ex: PRD000123 -> 123, ou apenas números)
                if (preg_match('/(\d+)$/', $product->code, $matches)) {
                    $codeNum = (int) $matches[1];
                    if ($codeNum > $lastCodeNumber) {
                        $lastCodeNumber = $codeNum;
                    }
                }
            }
            
            // Buscar em MainProducts também
            $mainProducts = MainProduct::whereNotNull('code')->get();
            
            foreach ($mainProducts as $mainProduct) {
                if (preg_match('/(\d+)$/', $mainProduct->code, $matches)) {
                    $codeNum = (int) $matches[1];
                    if ($codeNum > $lastCodeNumber) {
                        $lastCodeNumber = $codeNum;
                    }
                }
            }
            
            $currentCodeNumber = $lastCodeNumber;
            
            foreach ($input['product_ids'] as $mainProductId) {
                $mainProduct = MainProduct::with('products')->find($mainProductId);
                
                if (!$mainProduct) {
                    continue;
                }

                // Gerar novo código sequencial
                $currentCodeNumber++;
                $newCode = 'PRD' . str_pad($currentCodeNumber, 6, '0', STR_PAD_LEFT);
                
                // Verificar se o código já existe, se sim, incrementar
                while (Product::where('code', $newCode)->exists() || MainProduct::where('code', $newCode)->exists()) {
                    $currentCodeNumber++;
                    $newCode = 'PRD' . str_pad($currentCodeNumber, 6, '0', STR_PAD_LEFT);
                }

                // Criar novo MainProduct
                $newMainProduct = MainProduct::create([
                    'name' => $mainProduct->name . ' (Cópia)',
                    'code' => $newCode,
                    'product_unit' => $mainProduct->product_unit,
                    'product_type' => $mainProduct->product_type,
                ]);

                // Copiar imagens do MainProduct
                if ($mainProduct->hasMedia(MainProduct::PATH)) {
                    $mediaItems = $mainProduct->getMedia(MainProduct::PATH);
                    foreach ($mediaItems as $mediaItem) {
                        $newMainProduct->addMediaFromUrl($mediaItem->getUrl())
                            ->toMediaCollection(MainProduct::PATH, config('app.media_disc'));
                    }
                }

                // Duplicar produtos relacionados
                $products = Product::where('main_product_id', $mainProductId)->get();
                
                foreach ($products as $product) {
                    // Gerar código único para cada produto
                    $currentCodeNumber++;
                    $productCode = 'PRD' . str_pad($currentCodeNumber, 6, '0', STR_PAD_LEFT);
                    
                    while (Product::where('code', $productCode)->exists()) {
                        $currentCodeNumber++;
                        $productCode = 'PRD' . str_pad($currentCodeNumber, 6, '0', STR_PAD_LEFT);
                    }

                    $productData = [
                        'name' => $product->name,
                        'code' => $productCode,
                        'product_code' => $productCode,
                        'main_product_id' => $newMainProduct->id,
                        'product_category_id' => $product->product_category_id,
                        'brand_id' => $product->brand_id,
                        'product_cost' => $product->product_cost,
                        'product_price' => $product->product_price,
                        'product_unit' => $product->product_unit,
                        'sale_unit' => $product->sale_unit,
                        'purchase_unit' => $product->purchase_unit,
                        'stock_alert' => $product->stock_alert,
                        'quantity_limit' => $product->quantity_limit,
                        'order_tax' => $product->order_tax,
                        'tax_type' => $product->tax_type,
                        'notes' => $product->notes,
                        'barcode_symbol' => $product->barcode_symbol,
                        'expiry_date' => $product->expiry_date,
                    ];

                    $newProduct = $productRepo->storeProduct($productData);

                    // Copiar variações se houver
                    if ($product->variationProduct) {
                        VariationProduct::create([
                            'product_id' => $newProduct->id,
                            'variation_id' => $product->variationProduct->variation_id,
                            'variation_type_id' => $product->variationProduct->variation_type_id,
                            'main_product_id' => $newMainProduct->id,
                        ]);
                    }
                }
            }
            
            DB::commit();
            
            return $this->sendSuccess('Products duplicated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage());
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();
            $products = Product::where('main_product_id', $id)->get();

            foreach ($products as $product) {

                $saleItemModels = [
                    SaleItem::class,
                ];

                // Excluir PurchaseItem relacionados ao produto
                PurchaseItem::where('product_id', $product->id)->delete();

                $saleResult = canDelete($saleItemModels, 'product_id', $product->id);

                if ($saleResult) {
                    return $this->sendError(__('messages.error.product_cant_deleted'));
                }

                if (File::exists(Storage::path('product_barcode/barcode-PR_' . $product->id . '.png'))) {
                    File::delete(Storage::path('product_barcode/barcode-PR_' . $product->id . '.png'));
                }
                $product->delete();
            }

            VariationProduct::where('main_product_id', $id)->delete();

            $this->mainProductRepository->delete($id);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage());
        }

        return $this->sendSuccess('Product deleted successfully');
    }
}

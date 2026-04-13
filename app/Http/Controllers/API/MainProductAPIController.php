<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateMainProductRequest;
use App\Http\Requests\UpdateMainProductRequest;
use App\Http\Resources\MainProductCollection;
use App\Http\Resources\MainProductResource;
use App\Models\MainProduct;
use App\Models\Product;
use App\Models\Purchase;
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
use Illuminate\Support\Str;
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
            // Se mudar a unidade de venda, também muda a unidade de compra para a mesma
            $updateData['purchase_unit'] = $input['sale_unit'];
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
        // Debug: retornar os dados recebidos diretamente na resposta para ver o que está chegando
        $debugInfo = [
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method(),
            'all_data' => $request->all(),
            'json_data' => $request->json() ? $request->json()->all() : null,
            'raw_content' => $request->getContent(),
            'is_json' => $request->isJson(),
        ];
        
        // Tentar escrever em múltiplos lugares
        try {
            \Log::info('=== bulkDuplicate CALLED ===', $debugInfo);
        } catch (\Exception $e) {
            // Ignorar erro de log
        }
        
        try {
            $logFile = storage_path('logs/bulk-debug.txt');
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - bulkDuplicate called\n" . print_r($debugInfo, true) . "\n\n", FILE_APPEND | LOCK_EX);
        } catch (\Exception $e) {
            // Ignorar erro de arquivo
        }
        \Log::info('Content-Type: ' . $request->header('Content-Type'));
        \Log::info('Method: ' . $request->method());
        \Log::info('URL: ' . $request->fullUrl());
        \Log::info('Raw Content: ' . $request->getContent());
        
        try {
            // Obter dados da requisição - tentar JSON primeiro, depois all()
            $input = [];
            
            \Log::info('isJson(): ' . ($request->isJson() ? 'true' : 'false'));
            
            if ($request->isJson() && $request->json()) {
                $input = $request->json()->all();
                \Log::info('Got from json(): ' . json_encode($input));
            } else {
                $input = $request->all();
                \Log::info('Got from all(): ' . json_encode($input));
            }
            
            // Se ainda estiver vazio, tentar ler o conteúdo bruto
            if (empty($input)) {
                $rawContent = $request->getContent();
                \Log::info('Input empty, raw content: ' . $rawContent);
                if (!empty($rawContent)) {
                    $decoded = json_decode($rawContent, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $input = $decoded;
                        \Log::info('Decoded from raw: ' . json_encode($input));
                    } else {
                        \Log::error('JSON decode error: ' . json_last_error_msg());
                    }
                }
            }

            \Log::info('Final input: ' . json_encode($input));

            // Validar se product_ids existe e é um array não vazio
            if (!isset($input['product_ids']) || !is_array($input['product_ids']) || empty($input['product_ids'])) {
                // Retornar erro com debug completo para ver o que está chegando
                return response()->json([
                    'success' => false,
                    'message' => 'Product IDs are required',
                    'debug' => [
                        'input' => $input,
                        'content_type' => $request->header('Content-Type'),
                        'is_json' => $request->isJson(),
                        'all_data' => $request->all(),
                        'json_data' => $request->json() ? $request->json()->all() : null,
                        'raw_content' => $request->getContent(),
                    ]
                ], 422);
            }
            
            \Log::info('Validation passed, product_ids: ' . json_encode($input['product_ids']));
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Se houver uma ValidationException, retornar erro específico
            \Log::error('ValidationException caught: ' . $e->getMessage());
            \Log::error('Validation errors: ' . json_encode($e->errors()));
            $errors = $e->errors();
            $firstError = collect($errors)->first();
            return $this->sendError($firstError[0] ?? 'Validation failed');
        } catch (\Exception $e) {
            \Log::error('Exception in bulkDuplicate: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return $this->sendError('Error processing request: ' . $e->getMessage());
        }

        // Validar que todos os IDs são inteiros válidos
        foreach ($input['product_ids'] as $id) {
            if (!is_numeric($id) || (int)$id <= 0) {
                return $this->sendError('Invalid product ID: ' . $id);
            }
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
                        try {
                            // Copiar o arquivo diretamente do disco em vez de baixar da URL
                            $mediaItem->copy($newMainProduct, MainProduct::PATH);
                        } catch (\Exception $e) {
                            // Se falhar, tentar copiar o arquivo manualmente
                            try {
                                $sourcePath = $mediaItem->getPath();
                                if (file_exists($sourcePath)) {
                                    $newMainProduct->addMedia($sourcePath)
                                        ->toMediaCollection(MainProduct::PATH, config('app.media_disc'));
                                }
                            } catch (\Exception $e2) {
                                // Ignorar erro de cópia de imagem e continuar
                                \Log::warning('Failed to copy image for product ' . $newMainProduct->id . ': ' . $e2->getMessage());
                            }
                        }
                    }
                }

                // Duplicar produtos relacionados
                $products = Product::with('variationProduct.variation', 'variationProduct.variationType')
                    ->where('main_product_id', $mainProductId)
                    ->get();

                foreach ($products as $product) {
                    $productCode = $this->generateVariationDuplicateCode($product);

                    if ($productCode === null) {
                        // Produto sem variação (tipo único): manter código sequencial PRD
                        $currentCodeNumber++;
                        $productCode = 'PRD' . str_pad($currentCodeNumber, 6, '0', STR_PAD_LEFT);
                        while (Product::where('code', $productCode)->exists()) {
                            $currentCodeNumber++;
                            $productCode = 'PRD' . str_pad($currentCodeNumber, 6, '0', STR_PAD_LEFT);
                        }
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
                    
                    // Copiar PurchaseItems relacionados ao produto original
                    // Usar selectRaw para pegar valores diretos do banco, evitando accessors
                    $purchaseItems = DB::table('purchase_items')
                        ->where('product_id', $product->id)
                        ->get();
                    
                    foreach ($purchaseItems as $purchaseItem) {
                        // Buscar o warehouse_id da compra
                        $purchase = Purchase::find($purchaseItem->purchase_id);
                        $warehouseId = $purchase ? $purchase->warehouse_id : null;
                        
                        // Usar valores diretos do banco sem passar pelos accessors do modelo
                        PurchaseItem::create([
                            'purchase_id' => $purchaseItem->purchase_id,
                            'product_id' => $newProduct->id,
                            'product_cost' => $purchaseItem->product_cost,
                            'net_unit_cost' => $purchaseItem->net_unit_cost,
                            'tax_type' => $purchaseItem->tax_type,
                            'tax_value' => $purchaseItem->tax_value,
                            'tax_amount' => $purchaseItem->tax_amount,
                            'discount_type' => $purchaseItem->discount_type,
                            'discount_value' => $purchaseItem->discount_value,
                            'discount_amount' => $purchaseItem->discount_amount,
                            'purchase_unit' => $purchaseItem->purchase_unit, // Valor direto do banco
                            'quantity' => $purchaseItem->quantity,
                            'sub_total' => $purchaseItem->sub_total,
                        ]);
                        
                        // Adicionar quantidade ao estoque do novo produto
                        if ($warehouseId) {
                            manageStock($warehouseId, $newProduct->id, $purchaseItem->quantity);
                        }
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

    private function generateVariationDuplicateCode(Product $product): ?string
    {
        try {
            if (!$product->variationProduct || !$product->variationProduct->variationType) {
                return null;
            }

            $variationValue = trim((string) $product->variationProduct->variationType->name);
            $component = $this->extractVariationMeasureComponent($product->name);

            if ($variationValue === '' || $component === null) {
                return null;
            }

            $prefix = Str::upper($variationValue) . ' ' . $component;
            $existingCodes = Product::where('code', 'like', $prefix . ' %.0')->pluck('code');
            $maxIndex = 0;
            $pattern = '/^' . preg_quote($prefix, '/') . '\s+(\d+)\.0$/u';

            foreach ($existingCodes as $code) {
                if (preg_match($pattern, (string) $code, $matches)) {
                    $maxIndex = max($maxIndex, (int) $matches[1]);
                }
            }

            $nextIndex = $maxIndex + 1;
            $candidateCode = $prefix . ' ' . $nextIndex . '.0';

            while (Product::where('code', $candidateCode)->exists()) {
                $nextIndex++;
                $candidateCode = $prefix . ' ' . $nextIndex . '.0';
            }

            return $candidateCode;
        } catch (\Throwable $e) {
            \Log::warning('Failed to generate variation duplicate code for product ' . $product->id . ': ' . $e->getMessage());
            return null;
        }
    }

    private function extractVariationMeasureComponent(?string $productName): ?string
    {
        if (empty($productName)) {
            return null;
        }

        $normalizedName = Str::upper($productName);

        if (!preg_match('/(\d+(?:[.,]\d+)?)\s*MM\b/u', $normalizedName, $measureMatch)) {
            return null;
        }

        $measure = str_replace(',', '.', $measureMatch[1]) . 'MM';
        $meter = null;

        if (preg_match('/\(?\s*(\d+(?:[.,]\d+)?)\s*M\s*\)?(?!M)/u', $normalizedName, $meterMatch)) {
            $meter = str_replace(',', '.', $meterMatch[1]) . 'M';
        }

        return $meter ? $meter . ' ' . $measure : $measure;
    }
}

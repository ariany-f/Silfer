<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Sale;
use App\Models\SaleInvoice;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NFeIoService
{
    protected string $baseUrl = 'https://api.nfse.io/v2';

    public function getConfig(): array
    {
        $keys = ['nfe_io_enabled', 'nfe_io_api_key', 'nfe_io_company_id', 'nfe_io_state_tax_id'];
        $settings = Setting::whereIn('key', $keys)->pluck('value', 'key')->toArray();

        return [
            'nfe_io_enabled' => filter_var($settings['nfe_io_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'nfe_io_api_key' => $settings['nfe_io_api_key'] ?? '',
            'nfe_io_company_id' => $settings['nfe_io_company_id'] ?? '',
            'nfe_io_state_tax_id' => $settings['nfe_io_state_tax_id'] ?? '',
        ];
    }

    public function isConfigured(): bool
    {
        $config = $this->getConfig();
        return $config['nfe_io_enabled']
            && !empty($config['nfe_io_api_key'])
            && !empty($config['nfe_io_company_id'])
            && !empty($config['nfe_io_state_tax_id']);
    }

    /**
     * Envia a venda para a NFe.io e cria o registro local.
     */
    public function issueInvoiceForSale(Sale $sale): SaleInvoice
    {
        $sale->load(['customer', 'saleItems.product', 'warehouse']);

        $existing = SaleInvoice::where('sale_id', $sale->id)->whereIn('status', [
            SaleInvoice::STATUS_PENDING,
            SaleInvoice::STATUS_PROCESSING,
            SaleInvoice::STATUS_AUTHORIZED,
        ])->first();

        if ($existing) {
            return $existing;
        }

        $invoice = SaleInvoice::create([
            'sale_id' => $sale->id,
            'status' => SaleInvoice::STATUS_PENDING,
            'requested_at' => now(),
        ]);

        try {
            $payload = $this->buildInvoicePayload($sale);
            $config = $this->getConfig();

            $url = sprintf(
                '%s/companies/%s/statetaxes/%s/productinvoices',
                $this->baseUrl,
                $config['nfe_io_company_id'],
                $config['nfe_io_state_tax_id']
            );

            // Envia como JSON puro para garantir que a API receba o buyer corretamente
            $jsonBody = json_encode($payload);

            $response = Http::withHeaders([
                'Authorization' => trim($config['nfe_io_api_key']),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->withBody($jsonBody, 'application/json')->post($url);

            // Se retornar 400 com "buyer cannot be null", tentar body com buyer na raiz (alguns endpoints)
            if (!$response->successful() && $response->status() === 400) {
                $body = $response->body();
                if (str_contains($body, 'buyer cannot be null')) {
                    $flatPayload = [
                        'buyer' => $payload['productInvoice']['buyer'],
                        'issueDate' => $payload['productInvoice']['issueDate'],
                        'items' => $payload['productInvoice']['items'],
                        'reference' => $payload['productInvoice']['reference'],
                    ];
                    $jsonBody = json_encode($flatPayload);
                    $response = Http::withHeaders([
                        'Authorization' => trim($config['nfe_io_api_key']),
                        'Content-Type' => 'application/json',
                        'Accept' => 'application/json',
                    ])->withBody($jsonBody, 'application/json')->post($url);
                }
            }

            if ($response->successful()) {
                $data = $response->json();
                $nfeId = $data['id'] ?? $data['productInvoice']['id'] ?? null;
                $invoice->update([
                    'nfe_io_id' => $nfeId,
                    'status' => SaleInvoice::STATUS_PROCESSING,
                ]);
                return $invoice;
            }

            $invoice->update([
                'status' => SaleInvoice::STATUS_ERROR,
                'error_message' => $response->json('message') ?? $response->body() ?? 'Erro ao enfileirar NF-e',
            ]);
        } catch (\Throwable $e) {
            Log::error('NFe.io issue error: ' . $e->getMessage(), ['sale_id' => $sale->id]);
            $invoice->update([
                'status' => SaleInvoice::STATUS_ERROR,
                'error_message' => $e->getMessage(),
            ]);
        }

        return $invoice;
    }

    /**
     * Retorna o payload que seria enviado para a NFe.io (para debug/teste no Postman).
     */
    public function getPayloadForSale(Sale $sale): array
    {
        $sale->load(['customer', 'saleItems.product', 'warehouse']);
        return $this->buildInvoicePayload($sale);
    }

    /**
     * Monta o payload no formato esperado pela NFe.io.
     * Documentação: https://nfe.io/docs/desenvolvedores/rest-api/nota-fiscal-de-produto-v2/
     */
    protected function buildInvoicePayload(Sale $sale): array
    {
        /** @var Customer $customer */
        $customer = $sale->customer;
        if (!$customer) {
            throw new \InvalidArgumentException('Venda sem cliente vinculado.');
        }

        $taxId = preg_replace('/\D/', '', $customer->tax_id ?? $customer->phone ?? '');
        if (strlen($taxId) < 11) {
            $taxId = str_pad($taxId, 11, '0', STR_PAD_LEFT);
        }
        if (strlen($taxId) > 14) {
            $taxId = substr($taxId, 0, 14);
        }
        if ((int) $taxId === 0) {
            $taxId = '11111111111'; // CPF genérico para consumidor final quando não informado
        }
        // NFe.io pode esperar como número (integer) ou string; enviar como número
        $federalTaxNumber = (int) $taxId;

        $cityName = $customer->city ?? 'Não informado';
        $cityCode = '3550308'; // São Paulo IBGE

        $buyer = [
            'name' => trim((string) ($customer->name ?? '')) ?: 'Consumidor',
            'federalTaxNumber' => $federalTaxNumber,
            'email' => trim((string) ($customer->email ?? '')) ?: 'nfe@email.com',
            'address' => [
                'postalCode' => preg_replace('/\D/', '', (string) ($sale->warehouse->zip_code ?? '00000000')) ?: '01310100',
                'street' => trim((string) ($customer->address ?? '')) ?: 'Não informado',
                'number' => 'S/N',
                'district' => trim((string) ($customer->city ?? '')) ?: 'Centro',
                'city' => [
                    'name' => trim((string) $cityName) ?: 'São Paulo',
                    'code' => $cityCode,
                ],
                'state' => $this->getStateCode($customer->country),
                'country' => 'BRA',
            ],
        ];

        $items = [];
        foreach ($sale->saleItems as $item) {
            $product = $item->product;
            $quantity = (float) $item->quantity;
            $subTotal = (float) $item->sub_total;
            $unitPrice = (float) ($item->net_unit_price ?? $item->product_price);
            if ($unitPrice <= 0 && $quantity > 0 && $subTotal > 0) {
                $unitPrice = round($subTotal / $quantity, 4);
            }
            if ($unitPrice <= 0) {
                $unitPrice = 0.01;
            }
            $items[] = [
                'code' => $product->code ?? ('ITEM-' . $item->id),
                'description' => $product->name ?? 'Produto',
                'quantity' => $quantity,
                'unitPrice' => $unitPrice,
                'unitAmount' => $unitPrice,
                'total' => $subTotal,
                'ncm' => $product->ncm ?? '00000000',
                'cfop' => $product->cfop ?? '5102',
                'tax' => $this->buildItemTax($item),
            ];
        }

// API NFe.io documentada usa wrapper productInvoice
        return [
            'productInvoice' => [
                'buyer' => $buyer,
                'issueDate' => $sale->date->format('Y-m-d'),
                'items' => $items,
                'reference' => $sale->reference_code,
            ],
        ];
    }

    private function getStateCode(?string $stateName): string
    {
        if (!$stateName || strlen($stateName) === 2) {
            return strtoupper(substr($stateName ?? 'SP', 0, 2));
        }
        $states = [
            'São Paulo' => 'SP', 'Rio de Janeiro' => 'RJ', 'Minas Gerais' => 'MG',
            'Espírito Santo' => 'ES', 'Bahia' => 'BA', 'Paraná' => 'PR', 'Rio Grande do Sul' => 'RS',
            'Santa Catarina' => 'SC', 'Goiás' => 'GO', 'Distrito Federal' => 'DF', 'Pernambuco' => 'PE',
            'Ceará' => 'CE', 'Pará' => 'PA', 'Amazonas' => 'AM', 'Mato Grosso' => 'MT', 'Mato Grosso do Sul' => 'MS',
        ];
        return $states[$stateName] ?? 'SP';
    }

    /**
     * Estrutura mínima de impostos por item (ICMS, PIS, COFINS) para a API NFe.io.
     */
    private function buildItemTax($saleItem): array
    {
        $subTotal = (float) ($saleItem->sub_total ?? 0);
        $taxAmount = (float) ($saleItem->tax_amount ?? 0);
        return [
            'icms' => [
                'origin' => 0,
                'cst' => '00',
                'baseCalculationModality' => '0',
                'aliquot' => 0,
                'value' => 0,
            ],
            'pis' => [
                'cst' => '01',
                'baseCalculationModality' => '0',
                'aliquot' => 0,
                'value' => 0,
            ],
            'cofins' => [
                'cst' => '01',
                'baseCalculationModality' => '0',
                'aliquot' => 0,
                'value' => 0,
            ],
        ];
    }

    /**
     * Atualiza o status local consultando a NFe.io (opcional).
     */
    public function syncInvoiceStatus(SaleInvoice $invoice): void
    {
        if (!$invoice->nfe_io_id || !$this->isConfigured()) {
            return;
        }

        $config = $this->getConfig();
        $url = sprintf(
            '%s/companies/%s/productinvoices/%s',
            $this->baseUrl,
            $config['nfe_io_company_id'],
            $invoice->nfe_io_id
        );

        $response = Http::withHeaders([
            'Authorization' => $config['nfe_io_api_key'],
        ])->get($url);

        if ($response->successful()) {
            $data = $response->json();
            $status = $data['status'] ?? $data['productInvoice']['status'] ?? null;
            $update = [];
            if ($status === 'Authorized' || $status === 'authorized') {
                $update['status'] = SaleInvoice::STATUS_AUTHORIZED;
                $update['authorized_at'] = now();
                $update['invoice_number'] = $data['number'] ?? $data['productInvoice']['number'] ?? null;
                $update['invoice_key'] = $data['key'] ?? $data['productInvoice']['key'] ?? null;
            } elseif (in_array($status, ['Rejected', 'rejected', 'Error', 'error'], true)) {
                $update['status'] = SaleInvoice::STATUS_ERROR;
                $update['error_message'] = $data['message'] ?? $data['productInvoice']['message'] ?? 'Rejeitada';
            }
            if (!empty($update)) {
                $invoice->update($update);
            }
        }
    }
}

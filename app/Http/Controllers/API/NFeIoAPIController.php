<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Models\Sale;
use App\Models\SaleInvoice;
use App\Services\NFeIoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NFeIoAPIController extends AppBaseController
{
    public function __construct(
        protected NFeIoService $nfeService
    ) {
    }

    /**
     * Retorna a configuração da integração NFe.io (sem expor a API key completa no front).
     */
    public function getConfig(): JsonResponse
    {
        $config = $this->nfeService->getConfig();
        $config['nfe_io_api_key'] = $config['nfe_io_api_key'] ? '••••••••' . substr($config['nfe_io_api_key'], -4) : '';
        $config['is_configured'] = $this->nfeService->isConfigured();
        return $this->sendResponse($config, 'Configuração NFe.io obtida com sucesso.');
    }

    /**
     * Atualiza a configuração da integração NFe.io.
     */
    public function updateConfig(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nfe_io_enabled' => 'nullable|boolean',
            'nfe_io_api_key' => 'nullable|string|max:255',
            'nfe_io_company_id' => 'nullable|string|max:100',
            'nfe_io_state_tax_id' => 'nullable|string|max:100',
        ]);

        $repo = app(\App\Repositories\SettingRepository::class);
        $repo->updateNfeIoConfig($validated);

        return $this->sendSuccess(__('messages.success.nfe_config_updated'));
    }

    /**
     * Lista as notas fiscais (vinculadas às vendas do tenant).
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) ($request->get('per_page', 15));
        $invoices = SaleInvoice::with('sale:id,reference_code,date,grand_total,customer_id')
            ->with('sale.customer:id,name')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $items = $invoices->getCollection()->map(function (SaleInvoice $inv) {
            return [
                'id' => $inv->id,
                'sale_id' => $inv->sale_id,
                'reference_code' => $inv->sale?->reference_code,
                'customer_name' => $inv->sale?->customer?->name,
                'grand_total' => $inv->sale?->grand_total,
                'date' => $inv->sale?->date?->format('Y-m-d'),
                'status' => $inv->status,
                'invoice_number' => $inv->invoice_number,
                'invoice_key' => $inv->invoice_key,
                'pdf_url' => $inv->pdf_url,
                'xml_url' => $inv->xml_url,
                'error_message' => $inv->error_message,
                'requested_at' => $inv->requested_at?->toIso8601String(),
                'authorized_at' => $inv->authorized_at?->toIso8601String(),
                'created_at' => $inv->created_at?->toIso8601String(),
            ];
        });

        return $this->sendResponse([
            'data' => $items,
            'total' => $invoices->total(),
            'current_page' => $invoices->currentPage(),
            'per_page' => $invoices->perPage(),
        ], 'Lista de notas fiscais.');
    }

    /**
     * Gera nota fiscal para uma venda (apenas se paga e integração configurada).
     */
    public function generateForSale(Sale $sale): JsonResponse
    {
        if ($sale->payment_status !== Sale::PAID) {
            return $this->sendError('A venda precisa estar paga para gerar a nota fiscal.', 422);
        }

        if (!$this->nfeService->isConfigured()) {
            return $this->sendError('Configure a integração NFe.io nas configurações antes de emitir notas.', 422);
        }

        $invoice = $this->nfeService->issueInvoiceForSale($sale);

        return $this->sendResponse([
            'sale_invoice_id' => $invoice->id,
            'status' => $invoice->status,
            'message' => $invoice->status === SaleInvoice::STATUS_ERROR
                ? 'Erro ao enfileirar: ' . ($invoice->error_message ?? 'Verifique os dados da venda e do cliente.')
                : 'Nota fiscal enfileirada para emissão. O status será atualizado pela SEFAZ.',
        ], 'Solicitação processada.');
    }

    /**
     * Debug: retorna o payload JSON que seria enviado à NFe.io (para testar no Postman).
     */
    public function previewPayload(Sale $sale): JsonResponse
    {
        $sale->load(['customer', 'saleItems.product', 'warehouse']);
        $payload = $this->nfeService->getPayloadForSale($sale);
        $config = $this->nfeService->getConfig();
        $url = sprintf(
            'POST https://api.nfse.io/v2/companies/%s/statetaxes/%s/productinvoices',
            $config['nfe_io_company_id'],
            $config['nfe_io_state_tax_id']
        );
        return $this->sendResponse([
            'url' => $url,
            'payload' => $payload,
            'payload_json' => json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        ], 'Preview do payload (use no Postman para testar a NFe.io).');
    }

    /**
     * Sincroniza o status de uma nota com a NFe.io.
     */
    public function syncStatus(SaleInvoice $saleInvoice): JsonResponse
    {
        $this->nfeService->syncInvoiceStatus($saleInvoice);
        $saleInvoice->refresh();
        return $this->sendResponse([
            'id' => $saleInvoice->id,
            'status' => $saleInvoice->status,
            'invoice_number' => $saleInvoice->invoice_number,
            'invoice_key' => $saleInvoice->invoice_key,
        ], 'Status atualizado.');
    }
}

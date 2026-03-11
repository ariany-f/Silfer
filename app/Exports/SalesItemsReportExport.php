<?php

namespace App\Exports;

use App\Models\SaleItem;
use Maatwebsite\Excel\Concerns\FromView;

class SalesItemsReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $startDate = request()->get('start_date');
        $endDate = request()->get('end_date');

        $query = SaleItem::with([
            'sale.customer',
            'sale.warehouse',
            'product.brand',
            'product.productCategory',
            'product.mainProduct',
            'product.variationProduct.variation',
            'product.variationProduct.variationType',
        ])->whereHas('sale');

        if ($startDate && $endDate && $startDate !== 'null' && $endDate !== 'null') {
            $query->whereHas('sale', function ($q) use ($startDate, $endDate) {
                $q->whereDate('created_at', '>=', $startDate)
                    ->whereDate('created_at', '<=', $endDate);
            });
        }

        $saleItems = $query->orderBy('sale_id')->orderBy('id')->get();

        // Agrupar por sale_id para subtotal e separação
        $groupedBySale = $saleItems->groupBy('sale_id');

        return view('excel.sales-items-report-excel', ['groupedBySale' => $groupedBySale]);
    }
}

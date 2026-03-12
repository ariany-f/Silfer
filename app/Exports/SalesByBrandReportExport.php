<?php

namespace App\Exports;

use App\Models\Brand;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromView;

class SalesByBrandReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $query = Brand::withoutGlobalScope('tenant')
            ->where('brands.tenant_id', Auth::user()->tenant_id)
            ->leftJoin('products', 'brands.id', '=', 'products.brand_id')
            ->leftJoin('sale_items', 'products.id', '=', 'sale_items.product_id');

        if (request()->get('start_date') && request()->get('start_date') !== 'null') {
            $startDate = Carbon::parse(request()->get('start_date'))->startOfDay()->toDateTimeString();
            $endDate = Carbon::parse(request()->get('end_date'))->endOfDay()->toDateTimeString();
            $query->whereBetween('sale_items.created_at', [$startDate, $endDate]);
        }

        $salesByBrand = $query
            ->selectRaw('brands.id, brands.name, COALESCE(SUM(sale_items.sub_total), 0) as grand_total')
            ->selectRaw('COALESCE(SUM(sale_items.quantity), 0) as total_quantity')
            ->groupBy('brands.id', 'brands.name')
            ->orderByDesc('grand_total')
            ->get();

        $data = $salesByBrand->map(function ($row) {
            return [
                'id' => $row->id,
                'name' => $row->name,
                'grand_total' => (float) $row->grand_total,
                'total_quantity' => (float) $row->total_quantity,
            ];
        })->values()->all();

        return view('excel.sales-by-brand-report-excel', ['salesByBrand' => $data]);
    }
}

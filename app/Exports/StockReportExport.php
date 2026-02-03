<?php

namespace App\Exports;

use App\Models\ManageStock;
use Maatwebsite\Excel\Concerns\FromView;

class StockReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id');

        $query = ManageStock::with(['product', 'warehouse'])
            ->whereHas('product')
            ->whereHas('warehouse');
        
        if (isset($warehouseId) && $warehouseId != 'null' && $warehouseId != '') {
            $query->whereWarehouseId($warehouseId);
        }

        $stocks = $query->get();

        return view('excel.stock-report-excel', ['stocks' => $stocks]);
    }
}

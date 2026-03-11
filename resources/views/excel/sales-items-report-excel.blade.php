<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.sale_report_items') ?? 'Relatório de Vendas por Itens' }}</title>
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/favicon.ico') }}">
    <link href="{{ asset('assets/css/bootstrap.min.css') }}" rel="stylesheet" type="text/css"/>
</head>
<body>
<table width="100%" cellspacing="0" cellpadding="8" style="margin-top: 20px; font-size: 11px;">
    <thead>
    <tr style="background-color: #4682B4; color: white;">
        <th style="width: 80px;">{{ __('messages.pdf.date') ?? 'Data' }}</th>
        <th style="width: 100px;">{{ __('messages.pdf.reference') ?? 'Pedido' }}</th>
        <th style="width: 150px;">{{ __('messages.pdf.customer') ?? 'Cliente' }}</th>
        <th style="width: 100px;">{{ __('messages.pdf.warehouse') ?? 'Armazém' }}</th>
        <th style="width: 150px;">{{ __('messages.pdf.product') ?? 'Produto' }}</th>
        <th style="width: 80px;">{{ __('messages.pdf.variation') ?? 'Variação' }}</th>
        <th style="width: 100px;">{{ __('messages.pdf.brand') ?? 'Marca' }}</th>
        <th style="width: 100px;">{{ __('messages.pdf.category') ?? 'Categoria' }}</th>
        <th style="width: 80px;">{{ __('messages.pdf.sku') ?? 'SKU' }}</th>
        <th style="width: 60px;">{{ __('messages.pdf.quantity') ?? 'Qtd' }}</th>
        <th style="width: 80px;">{{ __('messages.pdf.unit_price') ?? 'Preço Unit.' }}</th>
        <th style="width: 70px;">{{ __('messages.pdf.discount') ?? 'Desconto' }}</th>
        <th style="width: 60px;">{{ __('messages.pdf.tax') ?? 'Taxa' }}</th>
        <th style="width: 90px;">{{ __('messages.pdf.sub_total') ?? 'Subtotal' }}</th>
    </tr>
    </thead>
    <tbody>
    @foreach($saleItems as $item)
        @php
            $sale = $item->sale;
            $product = $item->product;
            $variationName = '-';
            if ($product && $product->variationProduct) {
                $vp = $product->variationProduct;
                $varName = $vp->variation?->name ?? '';
                $varType = $vp->variationType?->name ?? '';
                $variationName = trim($varName . ($varType ? ' - ' . $varType : '')) ?: '-';
            }
        @endphp
        <tr>
            <td>{{ $sale ? $sale->date?->format('d/m/Y') : '-' }}</td>
            <td>{{ $sale ? $sale->reference_code : '-' }}</td>
            <td>{{ $sale && $sale->customer ? $sale->customer->name : '-' }}</td>
            <td>{{ $sale && $sale->warehouse ? $sale->warehouse->name : '-' }}</td>
            <td>{{ $product ? $product->name : '-' }}</td>
            <td>{{ $variationName }}</td>
            <td>{{ $product && $product->brand ? $product->brand->name : '-' }}</td>
            <td>{{ $product && $product->productCategory ? $product->productCategory->name : '-' }}</td>
            <td>{{ $product ? $product->code : '-' }}</td>
            <td style="text-align: right;">{{ number_format((float) $item->quantity, 2, ',', '.') }}</td>
            <td style="text-align: right;">{{ number_format((float) $item->net_unit_price, 2, ',', '.') }}</td>
            <td style="text-align: right;">{{ number_format((float) ($item->discount_amount ?? 0), 2, ',', '.') }}</td>
            <td style="text-align: right;">{{ number_format((float) ($item->tax_amount ?? 0), 2, ',', '.') }}</td>
            <td style="text-align: right;">{{ number_format((float) $item->sub_total, 2, ',', '.') }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
</body>
</html>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.sales_by_brand_report') }}</title>
    <style>
        body { font-family: 'Arial-unicode-ms'; font-size: 14px; color: #333; margin: 0px; }
        .text-center { text-align: center; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { border-bottom: 1px solid #ccc; border-top: 1px solid #ccc; padding: 8px; vertical-align: top; }
        .table th { background: #f3f4f6; }
        .number-align { text-align: right; }
        .icon-style { font-family: DejaVu Sans, sans-serif !important; }
    </style>
</head>

<body>
    <div>
        <table width="100%">
            <tr>
                <td></td>
                <td align="center" style="vertical-align: top;">
                    <h2 style="color: darkred; margin:0; padding:0; line-height:1.2;">
                        {{ __('messages.pdf.sales_by_brand_report') }}
                    </h2>
                </td>
                <td></td>
            </tr>
        </table>

        <table class="table" style="width:100%; margin-top: 40px;">
            <thead>
                <tr>
                    <th style="text-align: left">{{ __('messages.pdf.brand') }}</th>
                    <th style="width:15%" class="text-center">{{ __('messages.pdf.quantity') }}</th>
                    <th style="width:15%" class="text-center">{{ __('messages.pdf.total_amount') }}</th>
                    <th style="width:12%" class="text-center">{{ __('messages.pdf.paid_quantity') }}</th>
                    <th style="width:15%" class="text-center">{{ __('messages.pdf.total_paid') }}</th>
                </tr>
            </thead>
            <tbody>
                @if (isset($salesByBrand))
                    @foreach ($salesByBrand as $row)
                        <tr>
                            <td>{{ $row['name'] }}</td>
                            <td class="text-center">{{ formatMoneyAmount($row['total_quantity'], 2) }}</td>
                            <td class="icon-style text-center number-align">{{ currencyAlignment(formatMoneyAmount($row['grand_total'], 2)) }}</td>
                            <td class="text-center">{{ formatMoneyAmount(($row['paid_quantity'] ?? 0), 2) }}</td>
                            <td class="icon-style text-center number-align">{{ currencyAlignment(formatMoneyAmount(($row['paid_total'] ?? 0), 2)) }}</td>
                        </tr>
                    @endforeach
                @endif
            </tbody>
        </table>
    </div>
</body>

</html>

<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <meta charset="UTF-8">
    <title>{{ __('messages.pdf.sales_by_brand_report') }}</title>
    <style>
        body { font-family: 'XBRiyaz', sans-serif; font-size: 14px; color: #333; margin: 0; direction: rtl; text-align: right; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; text-align: right; }
        .table th, .table td { border: 1px solid #ccc; padding: 8px; vertical-align: middle; }
        .table th { background: #f3f4f6; }
        .text-center { text-align: center; }
        .icon-style { font-family: DejaVu Sans, sans-serif !important; }
        .number-align { text-align: right; }
    </style>
</head>

<body>
    <table width="100%">
        <tr>
            <td></td>
            <td style="text-align:center; vertical-align:middle;">
                <h2 style="color: darkred; margin:0; padding:0; font-size: 20px;">
                    {{ __('messages.pdf.sales_by_brand_report') }}
                </h2>
            </td>
            <td></td>
        </tr>
    </table>

    <table class="table" style="margin-top:40px;">
        <thead>
            <tr>
                <th>{{ __('messages.pdf.brand') }}</th>
                <th class="text-center">{{ __('messages.pdf.quantity') }}</th>
                <th class="text-center">{{ __('messages.pdf.total_amount') }}</th>
                <th class="text-center">{{ __('messages.pdf.paid_quantity') }}</th>
                <th class="text-center">{{ __('messages.pdf.total_paid') }}</th>
            </tr>
        </thead>
        <tbody>
            @if (isset($salesByBrand))
                @foreach ($salesByBrand as $row)
                    <tr>
                        <td>{{ $row['name'] }}</td>
                        <td class="text-center">{{ formatMoneyAmount($row['total_quantity'], 2) }}</td>
                        <td class="text-center icon-style number-align">{{ currencyAlignment(formatMoneyAmount($row['grand_total'], 2)) }}</td>
                        <td class="text-center">{{ formatMoneyAmount(($row['paid_quantity'] ?? 0), 2) }}</td>
                        <td class="text-center icon-style number-align">{{ currencyAlignment(formatMoneyAmount(($row['paid_total'] ?? 0), 2)) }}</td>
                    </tr>
                @endforeach
            @endif
        </tbody>
    </table>
</body>

</html>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.sales_by_brand_report') }}</title>
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/favicon.ico') }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link href="{{ asset('assets/css/bootstrap.min.css') }}" rel="stylesheet" type="text/css"/>
</head>
<body>
<table width="100%" cellspacing="0" cellpadding="10" style="margin-top: 40px;">
    <thead>
    <tr style="background-color: dodgerblue;">
        <th style="width: 30%">{{ __('messages.pdf.brand') }}</th>
        <th style="width: 20%">{{ __('messages.pdf.quantity') }}</th>
        <th style="width: 20%">{{ __('messages.pdf.total_amount') }}</th>
        <th style="width: 15%">{{ __('messages.pdf.paid_quantity') }}</th>
        <th style="width: 20%">{{ __('messages.pdf.total_paid') }}</th>
    </tr>
    </thead>
    <tbody>
    @foreach($salesByBrand ?? [] as $row)
        <tr align="center">
            <td>{{ $row['name'] }}</td>
            <td>{{ number_format((float) $row['total_quantity'], 2) }}</td>
            <td>{{ number_format((float) $row['grand_total'], 2) }}</td>
            <td>{{ number_format((float) ($row['paid_quantity'] ?? 0), 2) }}</td>
            <td>{{ number_format((float) ($row['paid_total'] ?? 0), 2) }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
</body>
</html>

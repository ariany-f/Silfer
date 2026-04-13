<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.customer_payments_pdf') }}</title>
    <style>
        body {
            font-family: 'Arial-unicode-ms';
            font-size: 14px;
            color: #333;
            margin: 0px;
        }

        .icon-style {
            font-family: DejaVu Sans, sans-serif !important;
        }

        .text-center {
            text-align: center;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .table th,
        .table td {
            border-bottom: 1px solid #ccc;
            border-top: 1px solid #ccc;
            border-left: none;
            border-right: none;
            padding: 10px 8px;
            vertical-align: middle;
        }

        .table th {
            background: #f3f4f6;
        }

        .logo img {
            max-width: 120px;
            max-height: 70px;
        }

        .mt-20 {
            margin-top: 20px;
        }

        .number-align {
            text-align: right;
        }

        .align-right {
            text-align: right;
        }
    </style>
</head>

<body>
    <div>

        <table width="100%">
            <tr>
                <td></td>
                <td align="center" style="vertical-align: top;">
                    <h2 style="color: darkred; margin:0; padding:0; line-height:1.2;">
                        {{ __('messages.pdf.client') }} : {{ $customer->name }}
                    </h2>
                    <h3 style="color: darkred; margin:10px 0 0 0; padding:0; line-height:1.2;">
                        {{ __('messages.pdf.standalone_payments') }}
                    </h3>
                </td>
                <td></td>
            </tr>
        </table>

        <!-- Customer Info -->
        <table style="width:100%; margin-top:20px; border-collapse: collapse;">
            <tr>
                <td style="width:48%; vertical-align: top;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>{{ __('messages.pdf.customer_info') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <b>{{ __('messages.pdf.name') }}:</b> {{ $customer->name ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.phone') }}:</b> {{ $customer->phone ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.address') }}:</b>
                                    {{ $customer->address ?? '' }}
                                    {{ $customer->city ?? '' }}
                                    {{ $customer->country ?? '' }}<br>
                                    <b>{{ __('messages.pdf.email') }}:</b> {{ $customer->email ?? '' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>

                <td style="width:4%"></td>

                <td style="width:48%; vertical-align: top;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>{{ __('messages.pdf.company_info') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <b>{{ getActiveStoreName() }}</b><br>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Payments Table -->
        <table class="table" style="width:100%; margin-top: 40px;">
            <thead>
                <tr>
                    <th style="text-align: left">{{ __('messages.pdf.date') }}</th>
                    <th class="text-center">{{ __('messages.pdf.reference') }}</th>
                    <th class="text-center">{{ __('messages.pdf.amount') }}</th>
                    <th class="text-center">{{ __('messages.pdf.status') }}</th>
                    <th class="text-center">{{ __('messages.pdf.due_date') }}</th>
                </tr>
            </thead>
            <tbody>
                @if (count($customer->customerPayments) > 0)
                    @foreach ($customer->customerPayments as $payment)
                        <tr>
                            <td class="text-center">{{ $payment->payment_date ? $payment->payment_date->format('d/m/Y') : 'N/A' }}</td>
                            <td class="text-center">{{ $payment->reference_code }}</td>
                            <td class="icon-style text-center">
                                {{ currencyAlignment(formatMoneyAmount($payment->amount, 2)) }}
                            </td>
                            <td class="text-center">
                                @if ($payment->status == \App\Models\CustomerPayment::STATUS_COMPLETED)
                                    {{ __('messages.pdf.completed') }}
                                @else
                                    {{ __('messages.pdf.pending') }}
                                @endif
                            </td>
                            <td class="text-center">{{ $payment->due_date ? $payment->due_date->format('d/m/Y') : 'N/A' }}</td>
                        </tr>
                    @endforeach
                @else
                    <tr>
                        <td colspan="5" class="text-center">{{ __('messages.pdf.no_payments_available') }}</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <!-- Summary -->
        @if (count($customer->customerPayments) > 0)
            <table class="table" style="width: 40%;float:right; margin-top: 20px;">
                <tbody>
                    <tr class="border">
                        <td class="border" style="padding: 10px 8px;"><strong>{{ __('messages.pdf.standalone_payments') }}:</strong></td>
                        <td class="number-align icon-style border" style="padding: 10px 8px;">
                            {{ currencyAlignment(formatMoneyAmount($customer->customerPayments->sum('amount'), 2)) }}
                        </td>
                    </tr>
                    <tr class="border">
                        <td class="border" style="padding: 10px 8px;"><strong>{{ __('messages.pdf.concluded_payments') }}:</strong></td>
                        <td class="number-align icon-style border" style="padding: 10px 8px;">
                            {{ currencyAlignment(formatMoneyAmount($customer->customerPayments->where('status', \App\Models\CustomerPayment::STATUS_COMPLETED)->sum('amount'), 2)) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        @endif

        <div style="clear: both;"></div>
    </div>
</body>

</html>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "//www.w3.org/TR/html4/strict.dtd">
<html lang="en">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <title>{{ __('messages.pdf.payment_receipt') }}</title>
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
            padding: 8px;
            vertical-align: top;
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

        .border {
            border: 0px solid black !important;
        }

        .text-success {
            color: green;
        }

        .text-danger {
            color: red;
        }

        .text-warning {
            color: purple;
        }
    </style>
</head>

<body>
    <div>

        <table width="100%">
            <tr>
                <td width="35%" style="line-height: 1; vertical-align: top; padding: 0px;margin: 0px;">
                    <img src="{{ $companyLogo }}" alt="Company Logo" width="80px" style="margin: 0px;padding: 0px;">
                </td>
                <td align="center" style="vertical-align: top;">
                    <h2 style="color: darkred; margin:0; padding:0; line-height:1.2;">
                        {{ __('messages.pdf.payment_receipt') }}
                    </h2>
                </td>
                <td width="35%" style="line-height: 1; vertical-align: top;">
                    <table style="width: 100%; border-spacing: 0; border-collapse: collapse;">
                        <tr>
                            <td class="fw-bold vi-bold-text" style="font-weight: bold; padding: 0px;">
                                {{ __('messages.pdf.date') }}:
                            </td>
                            <td class="fw-light vi-light-text" style="padding: 0px;">
                                {{ $customerPayment->payment_date ? \Carbon\Carbon::parse($customerPayment->payment_date)->format('d/m/Y') : 'N/A' }}
                            </td>
                        </tr>
                        <tr>
                            <td class="fw-bold vi-bold-text" style="font-weight: bold; padding:0px;">
                                {{ __('messages.pdf.reference') }}:
                            </td>
                            <td class="fw-light vi-light-text" style="padding: 0px;">
                                {{ $customerPayment->reference_code }}
                            </td>
                        </tr>
                        <tr>
                            <td class="fw-bold vi-bold-text" style="font-weight: bold; padding:0px;">
                                {{ __('messages.pdf.status') }}:
                            </td>
                            <td class="fw-light vi-light-text 
                                {{ $customerPayment->status == 'completed' ? 'text-success' : 'text-warning' }}"
                                style="padding: 0px;">
                                {{ $customerPayment->status == 'completed' ? __('messages.pdf.completed') : __('messages.pdf.pending') }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Customer Info -->
        <table style="width:100%; margin-top:20px; border-collapse: collapse;">
            <tr>
                <!-- Customer Info -->
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
                                    <b>{{ __('messages.pdf.name') }}:</b> {{ $customerPayment->customer->name ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.phone') }}:</b> {{ $customerPayment->customer->phone ?? 'N/A' }}<br>
                                    <b>{{ __('messages.pdf.address') }}:</b>
                                    {{ $customerPayment->customer->address ?? '' }}
                                    {{ $customerPayment->customer->city ?? '' }}
                                    {{ $customerPayment->customer->country ?? '' }}<br>
                                    <b>{{ __('messages.pdf.email') }}:</b> {{ $customerPayment->customer->email ?? '' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>

                <td style="width:4%"></td> <!-- gap -->

                <!-- Company Info -->
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
                                    <b>{{ getActiveStoreName() }}</b>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Payment Details -->
        <table class="table" style="width:100%; margin-top: 40px;">
            <thead>
                <tr>
                    <th style="text-align: left">{{ __('messages.pdf.payment_date') }}</th>
                    <th style="text-align: left">{{ __('messages.pdf.due_date') }}</th>
                    <th style="text-align: center">{{ __('messages.pdf.amount') }}</th>
                    <th style="text-align: center">{{ __('messages.pdf.status') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ $customerPayment->payment_date ? \Carbon\Carbon::parse($customerPayment->payment_date)->format('d/m/Y') : 'N/A' }}</td>
                    <td>{{ $customerPayment->due_date ? \Carbon\Carbon::parse($customerPayment->due_date)->format('d/m/Y') : 'N/A' }}</td>
                    <td class="icon-style text-center">
                        <b>{{ currencyAlignment(formatMoneyAmount($customerPayment->amount, 2)) }}</b>
                    </td>
                    <td class="text-center">
                        <span class="{{ $customerPayment->status == 'completed' ? 'text-success' : 'text-warning' }}">
                            {{ $customerPayment->status == 'completed' ? __('messages.pdf.completed') : __('messages.pdf.pending') }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Summary -->
        <table class="table" style="width: 40%;float:right; margin-top: 20px;">
            <tbody>
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.payment_date') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ $customerPayment->payment_date ? \Carbon\Carbon::parse($customerPayment->payment_date)->format('d/m/Y') : 'N/A' }}
                    </td>
                </tr>
                @if($customerPayment->due_date)
                <tr class="border">
                    <td class="border"><strong>{{ __('messages.pdf.due_date') }}:</strong></td>
                    <td class="number-align icon-style border">
                        {{ \Carbon\Carbon::parse($customerPayment->due_date)->format('d/m/Y') }}
                    </td>
                </tr>
                @endif
                <tr>
                    <td><strong>{{ __('messages.pdf.total_amount') }}:</strong></td>
                    <td class="number-align icon-style">
                        <b>{{ currencyAlignment(formatMoneyAmount($customerPayment->amount, 2)) }}</b>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Notes -->
        @if ($customerPayment->notes)
        <div
            style="clear: both; margin-top: 30px; padding: 10px 20px; border-left: 3px solid darkred; background: #f8f8f8;">
            <b>{{ __('messages.pdf.notes') }}:</b><br>
            {{ $customerPayment->notes }}
        </div>
        @endif

        <div style="clear: both;"></div>
    </div>
</body>

</html>

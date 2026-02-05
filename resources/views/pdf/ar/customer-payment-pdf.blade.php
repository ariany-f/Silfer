<html lang="ar" dir="rtl">

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <meta charset="UTF-8">
    <title>{{ __('messages.pdf.payment_receipt') }}</title>
    <style>
        body {
            font-family: 'XBRiyaz', sans-serif;
            font-size: 14px;
            color: #333;
            margin: 0px;
            direction: rtl;
            text-align: right;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            text-align: right;
        }

        .table th,
        .table td {
            border-bottom: 1px solid #ccc;
            border-top: 1px solid #ccc;
            padding: 8px;
            vertical-align: top;
        }

        .table th {
            background: #f3f4f6;
        }

        .number-align {
            text-align: left;
            /* keep numbers on left in RTL */
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
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

        .logo img {
            max-width: 120px;
            max-height: 70px;
        }

        .icon-style {
            font-family: DejaVu Sans, sans-serif !important;
        }
    </style>
</head>

<body>
    <!-- Header -->
    <table width="100%">
        <tr>
            <!-- Logo (right in RTL) -->
            <td width="30%" style="text-align: right;">
                <img src="{{ $companyLogo }}" alt="Company Logo" width="100px">
            </td>

            <!-- Title Center -->
            <td width="40%" style="text-align: center; vertical-align: middle;">
                <h2 style="color: darkred; margin:0; padding:0; font-size: 20px;">
                    {{ __('messages.pdf.payment_receipt') }}
                </h2>
            </td>

            <!-- Payment Info (left in RTL) -->
            <td width="30%" style="text-align: right;">
                <table style="width:100%; border-collapse: collapse;">
                    <tr>
                        <td><b>{{ __('messages.pdf.date') }}</b> :
                            {{ $customerPayment->payment_date ? \Carbon\Carbon::parse($customerPayment->payment_date)->format('d/m/Y') : 'N/A' }}
                        </td>
                    </tr>
                    <tr>
                        <td><b>{{ __('messages.pdf.reference') }}</b> : {{ $customerPayment->reference_code }}</td>
                    </tr>
                    <tr>
                        <td><b>{{ __('messages.pdf.status') }}</b> :
                            <span
                                class="{{ $customerPayment->status == 'completed' ? 'text-success' : 'text-warning' }}">
                                {{ $customerPayment->status == 'completed' ? __('messages.pdf.completed') : __('messages.pdf.pending') }}
                            </span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Company & Customer Info -->
    <table style="width:100%; margin-top:20px; border-collapse: collapse;">
        <tr>
            <!-- Company Info -->
            <td style="width:48%; vertical-align: top;">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="text-align:right;">{{ __('messages.pdf.company_info') }}</th>
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

            <td style="width:4%"></td>

            <!-- Customer Info -->
            <td style="width:48%; vertical-align: top;">
                <table class="table">
                    <thead>
                        <tr>
                            <th style="text-align:right;">{{ __('messages.pdf.customer_info') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <b>{{ __('messages.pdf.name') }}</b> : {{ $customerPayment->customer->name ?? 'N/A' }} <br>
                                <b>{{ __('messages.pdf.phone') }}</b> : {{ $customerPayment->customer->phone ?? 'N/A' }} <br>
                                <b>{{ __('messages.pdf.address') }}</b> :
                                {{ $customerPayment->customer->address ?? '' }}
                                {{ $customerPayment->customer->city ?? '' }}
                                {{ $customerPayment->customer->country ?? '' }} <br>
                                <b>{{ __('messages.pdf.email') }}</b> : {{ $customerPayment->customer->email ?? 'N/A' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </table>

    <!-- Payment Details Table -->
    <table class="table" style="margin-top: 40px;">
        <thead>
            <tr>
                <th style="text-align: right;">{{ __('messages.pdf.payment_date') }}</th>
                <th style="text-align: right;">{{ __('messages.pdf.due_date') }}</th>
                <th class="text-center">{{ __('messages.pdf.amount') }}</th>
                <th class="text-center">{{ __('messages.pdf.status') }}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: right;">{{ $customerPayment->payment_date ? \Carbon\Carbon::parse($customerPayment->payment_date)->format('d/m/Y') : 'N/A' }}</td>
                <td style="text-align: right;">{{ $customerPayment->due_date ? \Carbon\Carbon::parse($customerPayment->due_date)->format('d/m/Y') : 'N/A' }}</td>
                <td class="text-center icon-style">
                    <b>{{ currencyAlignment(number_format((float) $customerPayment->amount, 2)) }}</b>
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
    <table class="table" style="width:40%; margin-top: 20px; float: left;">
        <tbody>
            <tr>
                <td><strong>{{ __('messages.pdf.payment_date') }}</strong> :</td>
                <td class="number-align icon-style">
                    {{ $customerPayment->payment_date ? \Carbon\Carbon::parse($customerPayment->payment_date)->format('d/m/Y') : 'N/A' }}</td>
            </tr>
            @if($customerPayment->due_date)
            <tr>
                <td><strong>{{ __('messages.pdf.due_date') }}</strong> :</td>
                <td class="number-align icon-style">
                    {{ \Carbon\Carbon::parse($customerPayment->due_date)->format('d/m/Y') }}
                </td>
            </tr>
            @endif
            <tr>
                <td><strong>{{ __('messages.pdf.total_amount') }}</strong> :</td>
                <td class="number-align icon-style">
                    <b>{{ currencyAlignment(number_format((float) $customerPayment->amount, 2)) }}</b>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Notes -->
    @if ($customerPayment->notes)
        <div
            style="text-align: right; clear: both; margin-top: 30px; padding: 10px 20px;
                   border-right: 3px solid darkred; background: #f8f8f8;">
            <b>{{ __('messages.pdf.notes') }}:</b><br>
            {{ $customerPayment->notes }}
        </div>
    @endif
</body>

</html>

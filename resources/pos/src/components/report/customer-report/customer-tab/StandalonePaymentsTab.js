import React, { useEffect } from "react";
import moment from "moment";
import { connect } from "react-redux";
import ReactDataTable from "../../../../shared/table/ReactDataTable";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
} from "../../../../shared/sharedMethod";
import { fetchCustomerPaymentsByCustomer } from "../../../../store/action/customerPaymentAction";
import { customerPaymentPdfAction } from "../../../../store/action/customerPaymentAction";
import { customerStandalonePaymentsReportPDF } from "../../../../store/action/customerReportAction";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const StandalonePaymentsTab = (props) => {
    const {
        customerPayments,
        fetchCustomerPaymentsByCustomer,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        customerId,
        customerPaymentPdfAction,
        customerStandalonePaymentsReportPDF,
    } = props;

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    useEffect(() => {
        if (customerId) {
            fetchCustomerPaymentsByCustomer(customerId, {}, true);
        }
    }, [customerId, fetchCustomerPaymentsByCustomer]);

    // fetch all standalone payments
    const onChange = (filter) => {
        fetchCustomerPaymentsByCustomer(customerId, filter, true);
    };

    // onClick pdf function
    const onPdfClick = (item) => {
        if (item && item.id) {
            customerPaymentPdfAction(item.id);
        }
    };

    // onClick report pdf function
    const onReportPdfClick = (id) => {
        customerStandalonePaymentsReportPDF(id);
    };

    const itemsValue =
        currencySymbol &&
        customerPayments &&
        customerPayments.length >= 0 &&
        customerPayments.map((payment) => {
            const attributes = payment.attributes || payment;
            return {
                id: payment.id,
                reference_code: attributes.reference_code,
                payment_date: attributes.payment_date,
                due_date: attributes.due_date,
                amount: attributes.amount,
                status: attributes.status,
                notes: attributes.notes,
                created_at: attributes.created_at,
                currency: currencySymbol,
            };
        });

    const columns = [
        {
            name: getFormattedMessage("globally.react-table.column.reference.label"),
            selector: (row) => row.reference_code,
            sortField: "reference_code",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-danger">
                        <span>{row.reference_code}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("globally.react-table.column.payment-date.label"),
            selector: (row) => row.payment_date ? getFormattedDate(row.payment_date, allConfigData) : '-',
            sortField: "payment_date",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.react-table.column.due-date.label"),
            selector: (row) => row.due_date ? getFormattedDate(row.due_date, allConfigData) : '-',
            sortField: "due_date",
            sortable: false,
        },
        {
            name: getFormattedMessage("amount.title"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.amount
                ),
            sortField: "amount",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.react-table.column.status.label"),
            selector: (row) => row.status,
            sortField: "status",
            sortable: false,
            cell: (row) => {
                return (
                    <span className={`badge ${row.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                        {row.status === 'completed' ? getFormattedMessage("globally.status.completed") : getFormattedMessage("globally.status.pending")}
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("globally.react-table.column.created-at.label"),
            selector: (row) => getFormattedDate(row.created_at, allConfigData),
            sortField: "created_at",
            sortable: true,
            cell: (row) => {
                const time = moment(row.created_at).format("LT");
                const date = getFormattedDate(row.created_at, allConfigData);
                return (
                    <span className="badge bg-light-info">
                        <div className="mb-1">{time}</div>
                        <div>{date}</div>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "100px",
            cell: (row) => (
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onPdfClick(row)}
                    title={getFormattedMessage("globally.pdf.download")}
                >
                    <FontAwesomeIcon icon={faFilePdf} />
                </button>
            ),
        },
    ];

    return (
        <ReactDataTable
            columns={columns}
            items={itemsValue || []}
            onChange={onChange}
            totalRows={totalRecord}
            isLoading={isLoading}
            isReportPdf={customerPayments && customerPayments.length > 0 ? true : false}
            customerId={customerId}
            onReportPdfClick={() => onReportPdfClick(customerId)}
        />
    );
};

const mapStateToProps = (state) => {
    const {
        customerPayments,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    } = state;
    return {
        customerPayments,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchCustomerPaymentsByCustomer,
    customerPaymentPdfAction,
    customerStandalonePaymentsReportPDF,
})(StandalonePaymentsTab);

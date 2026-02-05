import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import HeaderTitle from "../header/HeaderTitle";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
    getFormattedDate,
} from "../../shared/sharedMethod";
import ReactDataTable from "../../shared/table/ReactDataTable";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import {
    fetchCustomerPaymentsByCustomer,
    deleteCustomerPayment,
    customerPaymentPdfAction,
} from "../../store/action/customerPaymentAction";
import { fetchCustomer } from "../../store/action/customerAction";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ActionButton from "../../shared/action-buttons/ActionButton";
import moment from "moment";

const CustomerPayments = (props) => {
    const {
        isLoading,
        totalRecord,
        frontSetting,
        customerPayments,
        fetchCustomerPaymentsByCustomer,
        deleteCustomerPayment,
        customerPaymentPdfAction,
        allConfigData,
        customers,
        fetchCustomer,
    } = props;
    const { customerId } = useParams();
    const navigate = useNavigate();
    const intl = useIntl();
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    useEffect(() => {
        if (customerId) {
            fetchCustomerPaymentsByCustomer(customerId, {}, true);
            fetchCustomer(customerId, false);
        }
    }, [customerId, fetchCustomerPaymentsByCustomer, fetchCustomer]);

    // Extrair nome do cliente
    let customerName = '';
    if (customers && customers.length > 0) {
        const customer = customers[0];
        customerName = customer.attributes?.name || customer.name || '';
    }

    const itemsValue =
        customerPayments && customerPayments.length > 0
            ? customerPayments.map((payment) => {
                const attributes = payment.attributes || payment;
                return {
                    id: payment.id,
                    customer_name: attributes.customer?.name || '',
                    amount: attributes.amount,
                    payment_date: attributes.payment_date,
                    due_date: attributes.due_date,
                    status: attributes.status,
                    notes: attributes.notes,
                    reference_code: attributes.reference_code,
                    created_at: attributes.created_at,
                    currency: currencySymbol || '',
                };
            })
            : [];

    const onChange = (filter) => {
        fetchCustomerPaymentsByCustomer(customerId, filter, true);
    };

    const onPdfClick = (item) => {
        if (item && item.id) {
            customerPaymentPdfAction(item.id);
        }
    };

    const goToEditPayment = (item) => {
        navigate(`/app/user/customers/${customerId}/payments/edit/${item.id}`);
    };

    const onClickDeleteModel = (item) => {
        if (item && item.id) {
            deleteCustomerPayment(item.id);
        }
    };

    const columns = [
        {
            name: getFormattedMessage("globally.react-table.column.reference.label"),
            selector: (row) => row.reference_code,
            sortField: "reference_code",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.react-table.column.created-at.label"),
            selector: (row) => getFormattedDate(row.created_at, allConfigData),
            sortField: "created_at",
            sortable: true,
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
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "150px",
            cell: (row) => (
                <>
                    <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => onPdfClick(row)}
                        title={getFormattedMessage("globally.pdf.download")}
                    >
                        <FontAwesomeIcon icon={faFilePdf} />
                    </button>
                    <ActionButton
                        item={row}
                        goToEditProduct={goToEditPayment}
                        isEditMode={true}
                        onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={true}
                    />
                </>
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("customer.payments.title")} />
            <HeaderTitle 
                title={`${intl.formatMessage({ id: "customer.payments.title" })}${customerName ? ` - ${customerName}` : ''}`} 
                to="/app/user/customers"
            />
            <div className="pt-md-7">
                <ReactDataTable
                    columns={columns}
                    items={itemsValue}
                    onChange={onChange}
                    isLoading={isLoading}
                    totalRows={totalRecord}
                    AddButton={
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/app/user/customers/${customerId}/payments/create`)}
                        >
                            {getFormattedMessage("customer.payment.create.title")}
                        </button>
                    }
                />
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        isLoading,
        totalRecord,
        frontSetting,
        customerPayments,
        allConfigData,
        customers,
    } = state;
    return {
        isLoading,
        totalRecord,
        frontSetting,
        customerPayments,
        allConfigData,
        customers,
    };
};

export default connect(mapStateToProps, {
    fetchCustomerPaymentsByCustomer,
    deleteCustomerPayment,
    customerPaymentPdfAction,
    fetchCustomer,
})(CustomerPayments);

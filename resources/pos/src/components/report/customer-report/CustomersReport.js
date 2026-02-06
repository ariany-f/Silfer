import React, { useEffect } from "react";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { connect } from "react-redux";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
    fetchCustomersReport,
    customerPdfAction,
} from "../../../store/action/customerReportAction";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";

const SuppliersReport = (props) => {
    const {
        isLoading,
        totalRecord,
        frontSetting,
        allCustomerReport,
        fetchCustomersReport,
        customerPdfAction,
        allConfigData,
    } = props;
    const navigate = useNavigate();
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const itemsValue =
        currencySymbol &&
        allCustomerReport.length >= 0 &&
        allCustomerReport.map((report) => ({
            name: report.name,
            phone: report.phone,
            total_sale: report.sales_count,
            total_amount: report.total_grand_amount,
            total_paid_amount: report.total_paid_amount,
            total_due_amount: report.total_due_amount,
            total_payments_amount: report.total_payments_amount || 0,
            total_payments_concluded_amount: report.total_payments_concluded_amount || 0,
            total_due_amount_after_payments: report.total_due_amount_after_payments || 0,
            id: report.id,
            currency: currencySymbol,
        }));

    // featch all
    const onChange = (filter) => {
        fetchCustomersReport(filter, true);
    };

    // get customer report deatils page
    const onReportsClick = (item) => {
        const id = item.id;
        navigate("/app/user/report/customers/details/" + id);
    };

    //onClick pdf function
    const onPdfClick = (item) => {
        const id = item.id;
        customerPdfAction(id);
    };

    const columns = [
        {
            name: getFormattedMessage("customer.title"),
            sortField: "name",
            sortable: true,
            width: "400px",
            cell: (row) => {
                return (
                    <span className="badge bg-light-danger">
                        <span>{row.name}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("globally.input.phone-number.label"),
            selector: (row) => row.phone,
            sortField: "phone",
            sortable: false,
        },
        {
            name: getFormattedMessage("total.sales.title"),
            selector: (row) => row.total_sale,
            sortField: "total_sale",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="text-center w-50">{row.total_sale}</span>
                );
            }
        },
        {
            name: getFormattedMessage("amount.title"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_amount
                ),
            sortField: "total_amount",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.detail.paid"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_paid_amount
                ),
            sortField: "total_paid_amount",
            sortable: false,
            cell: (row) => {
                const amount = parseFloat(row.total_paid_amount) || 0;
                const colorClass = amount > 0 ? "text-success" : "";
                return (
                    <span className={colorClass}>
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.total_paid_amount
                        )}
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("globally.detail.due"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_due_amount
                ),
            sortField: "total_due_amount",
            sortable: false,
        },
        {
            name: getFormattedMessage("customer.report.standalone.payments.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_payments_amount
                ),
            sortField: "total_payments_amount",
            sortable: false,
        },
        {
            name: getFormattedMessage("customer.report.concluded.payments.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_payments_concluded_amount
                ),
            sortField: "total_payments_concluded_amount",
            sortable: false,
            cell: (row) => {
                const amount = parseFloat(row.total_payments_concluded_amount) || 0;
                const colorClass = amount > 0 ? "text-success" : "";
                return (
                    <span className={colorClass}>
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.total_payments_concluded_amount
                        )}
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("customer.report.final.due.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_due_amount_after_payments
                ),
            sortField: "total_due_amount_after_payments",
            sortable: false,
            cell: (row) => {
                const amount = parseFloat(row.total_due_amount_after_payments) || 0;
                let colorClass = "";
                if (amount > 0) {
                    colorClass = "text-danger"; // Vermelho se positivo
                } else if (amount < 0) {
                    colorClass = "text-success"; // Verde se negativo (saldo positivo)
                }
                return (
                    <span className={colorClass}>
                        {currencySymbolHandling(
                            allConfigData,
                            row.currency,
                            row.total_due_amount_after_payments
                        )}
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
            style: {
                justifyContent: "start",
            },
            cell: (row) => 
                (row.total_sale > 0 || (row.total_payments_concluded_amount && row.total_payments_concluded_amount > 0)) ? (
                    <>
                        <button
                            className="btn btn-sm btn-primary me-3"
                            onClick={() => onPdfClick(row)}
                        >
                            <FontAwesomeIcon icon={faFilePdf} />
                        </button>
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onReportsClick(row)}
                        >
                            {getFormattedMessage("reports.title")}
                        </button>
                    </>
                ) : (
                    <span className="text-center w-50">-</span>
                ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("customer.report.title")} />
            <div className="pt-md-7">
                <div style={{ overflowX: 'auto' }}>
                    <ReactDataTable
                        columns={columns}
                        items={itemsValue}
                        onChange={onChange}
                        isLoading={isLoading}
                        totalRows={totalRecord}
                    />
                </div>
            </div>
        </MasterLayout>
    );
};
const mapStateToProps = (state) => {
    const {
        isLoading,
        totalRecord,
        frontSetting,
        allCustomerReport,
        allConfigData,
    } = state;
    return {
        isLoading,
        totalRecord,
        frontSetting,
        allCustomerReport,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchCustomersReport,
    customerPdfAction,
})(SuppliersReport);

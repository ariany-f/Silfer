import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import { fetchSalesByBrandReport, salesByBrandReportExcel, salesByBrandReportPdf } from "../../../store/action/salesByBrandAction";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import MasterLayout from "../../MasterLayout";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";

const SalesByBrandReport = (props) => {
    const {
        isLoading,
        fetchSalesByBrandReport,
        frontSetting,
        salesByBrand,
        dates,
        allConfigData,
        salesByBrandReportExcel,
        salesByBrandReportPdf,
    } = props;
    const [isExcelValue, setIsExcelValue] = useState(false);
    const [isPdfValue, setIsPdfValue] = useState(false);
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    useEffect(() => {
        fetchSalesByBrandReport(dates || {}, true);
    }, []);

    useEffect(() => {
        if (isExcelValue === true) {
            salesByBrandReportExcel(dates, setIsExcelValue);
        }
    }, [isExcelValue]);

    useEffect(() => {
        if (isPdfValue === true) {
            salesByBrandReportPdf(dates, setIsPdfValue);
        }
    }, [isPdfValue]);

    const itemsValue =
        currencySymbol &&
        salesByBrand &&
        salesByBrand.length >= 0 &&
        salesByBrand.map((row) => ({
            id: row.id,
            name: row.name,
            total_quantity: row.total_quantity,
            grand_total: row.grand_total,
            paid_quantity: row.paid_quantity ?? 0,
            paid_total: row.paid_total ?? 0,
            currency: currencySymbol,
        }));

    const columns = [
        {
            name: getFormattedMessage("brands.title"),
            selector: (row) => row.name,
            sortField: "name",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.detail.quantity"),
            selector: (row) => row.total_quantity,
            sortField: "total_quantity",
            sortable: true,
            cell: (row) => (
                <span className="badge bg-light-primary">
                    {Number(row.total_quantity).toFixed(2)}
                </span>
            ),
        },
        {
            name: getFormattedMessage("globally.detail.grand.total"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.grand_total
                ),
            sortField: "grand_total",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.detail.paid.quantity"),
            selector: (row) => row.paid_quantity,
            sortField: "paid_quantity",
            sortable: true,
            cell: (row) => (
                <span className="badge bg-light-success">
                    {Number(row.paid_quantity).toFixed(2)}
                </span>
            ),
        },
        {
            name: getFormattedMessage("globally.detail.paid.total"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.paid_total
                ),
            sortField: "paid_total",
            sortable: true,
        },
    ];

    const onChange = (filter) => {
        const datesFilter = filter?.start_date && filter?.end_date
            ? { start_date: filter.start_date, end_date: filter.end_date }
            : {};
        fetchSalesByBrandReport(datesFilter, true);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle
                title={placeholderText("sales-by-brand.reports.title")}
            />
            <ReactDataTable
                columns={columns}
                items={itemsValue || []}
                isShowDateRangeField
                onChange={onChange}
                isLoading={isLoading}
                totalRows={itemsValue?.length || 0}
                isEXCEL={itemsValue && itemsValue.length >= 0}
                onExcelClick={() => setIsExcelValue(true)}
                isReportPdf={true}
                onReportPdfClick={() => setIsPdfValue(true)}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        isLoading,
        frontSetting,
        dates,
        salesByBrand,
        allConfigData,
    } = state;
    return {
        isLoading,
        frontSetting,
        dates,
        salesByBrand: salesByBrand || [],
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchSalesByBrandReport,
    salesByBrandReportExcel,
    salesByBrandReportPdf,
})(SalesByBrandReport);

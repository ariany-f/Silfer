import React, { useEffect } from "react";
import { connect } from "react-redux";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import { fetchSalesByBrandReport } from "../../../store/action/salesByBrandAction";
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
    } = props;
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    useEffect(() => {
        fetchSalesByBrandReport(dates || {}, true);
    }, []);

    const itemsValue =
        currencySymbol &&
        salesByBrand &&
        salesByBrand.length >= 0 &&
        salesByBrand.map((row) => ({
            id: row.id,
            name: row.name,
            total_quantity: row.total_quantity,
            grand_total: row.grand_total,
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
})(SalesByBrandReport);

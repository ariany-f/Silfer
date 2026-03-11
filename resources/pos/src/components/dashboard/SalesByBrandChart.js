import React, { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Card } from "react-bootstrap";
import {
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
    getPermission,
} from "../../shared/sharedMethod";
import { connect } from "react-redux";
import { fetchSalesByBrand } from "../../store/action/salesByBrandAction";
import moment from "moment";
import { Permissions } from "../../constants";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const SalesByBrandChart = (props) => {
    const {
        frontSetting,
        salesByBrand,
        fetchSalesByBrand,
        allConfigData,
    } = props;

    useEffect(() => {
        if (getPermission(allConfigData?.permissions, Permissions.MANAGE_SALE)) {
            fetchSalesByBrand();
        }
    }, [allConfigData?.permissions]);

    const currency = frontSetting?.value?.currency_symbol || "$";

    const valueFormatter = (tooltipItems) => {
        const value = tooltipItems.dataset.data[tooltipItems.dataIndex];
        const label = tooltipItems.dataset.label;
        const currencySymbol = currency || "";
        return (
            label +
            " : " +
            currencySymbolHandling(allConfigData, currencySymbol, value, true)
        );
    };

    const yFormatter = (yValue) => {
        const currencySymbol = currency || "";
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            yValue,
            true
        );
    };

    const options = {
        responsive: true,
        animation: {
            duration: 1200,
            easing: "easeOutQuart",
        },
        hover: {
            mode: "nearest",
            intersect: true,
        },
        plugins: {
            tooltip: {
                backgroundColor: "rgba(0,0,0,0.7)",
                titleColor: "#fff",
                bodyColor: "#fff",
                callbacks: {
                    label: (tooltipItems) => valueFormatter(tooltipItems),
                },
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: (value) => yFormatter(value),
                },
                title: {
                    display: true,
                    text: placeholderText("amount.title"),
                    align: "center",
                },
                beginAtZero: true,
                grid: {
                    color: "rgba(200,200,200,0.2)",
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    const labels = salesByBrand?.map((item) => item.name) || [];
    const salesData = salesByBrand?.map((item) => item.grand_total) || [];

    const data = {
        labels,
        datasets: [
            {
                label: placeholderText("sales.title"),
                data: salesData,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return "rgba(91, 134, 229, 0.6)";

                    const gradientNormal = ctx.createLinearGradient(
                        0,
                        chartArea.top,
                        0,
                        chartArea.bottom
                    );
                    gradientNormal.addColorStop(0, "rgba(54, 209, 220, 0.3)");
                    gradientNormal.addColorStop(1, "rgba(91, 134, 229, 0.9)");

                    const gradientHover = ctx.createLinearGradient(
                        0,
                        chartArea.top,
                        0,
                        chartArea.bottom
                    );
                    gradientHover.addColorStop(0, "rgba(255, 175, 189, 0.3)");
                    gradientHover.addColorStop(1, "rgba(255, 105, 180, 0.9)");

                    return context.active ? gradientHover : gradientNormal;
                },
                borderColor: (context) =>
                    context.active
                        ? "rgba(255, 105, 180, 0.9)"
                        : "rgba(91, 134, 229, 0.8)",
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    };

    if (!getPermission(allConfigData?.permissions, Permissions.MANAGE_SALE)) {
        return null;
    }

    return (
        <div className="col-12 col-xxl-6">
            <Card>
                <Card.Header className="pb-0 px-10">
                    <h5 className="mb-0">
                        {getFormattedMessage("dashboard.SalesByBrand.title")}{" "}
                        ({moment().format("MMMM YYYY")})
                    </h5>
                </Card.Header>
                <Card.Body>
                    {labels.length > 0 && currency && (
                        <Bar
                            options={options}
                            data={data}
                            height={100}
                        />
                    )}
                    {labels.length === 0 && (
                        <p className="text-muted mb-0">
                            {getFormattedMessage(
                                "react-data-table.no-record-found.label"
                            )}
                        </p>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

const mapStateToProps = (state) => {
    const { salesByBrand, allConfigData } = state;
    return { salesByBrand, allConfigData };
};

export default connect(mapStateToProps, {
    fetchSalesByBrand,
})(SalesByBrandChart);

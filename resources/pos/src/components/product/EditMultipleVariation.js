import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap-v5";
import { connect } from "react-redux";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { updateMultipleVariations, fetchMainProduct } from "../../store/action/productAction";
import { setSavingButton } from "../../store/action/saveButtonAction";

const EditMultipleVariation = (props) => {
    const {
        show,
        handleClose,
        selectedVariationIds,
        selectedVariationProducts,
        updateMultipleVariations,
        fetchMainProduct,
        setSavingButton,
        isSaving,
        mainProductId
    } = props;

    const [formData, setFormData] = useState({
        product_cost: '',
        product_price: '',
        stock_alert: '',
    });

    const [errors, setErrors] = useState({});

    const toStringValue = (value) => (value === null || value === undefined ? "" : String(value));

    const extractNumericValue = (value) => {
        if (value === null || value === undefined || value === "") {
            return null;
        }

        if (typeof value === "number") {
            return Number.isFinite(value) ? value : null;
        }

        if (typeof value === "object") {
            const objectCandidate = value?.value ?? value?.amount ?? value?.raw ?? value?.number ?? value?.price ?? value?.cost;
            return extractNumericValue(objectCandidate);
        }

        if (typeof value === "string") {
            const normalized = value.trim().replace(",", ".");
            const parsed = Number.parseFloat(normalized);
            return Number.isFinite(parsed) ? parsed : null;
        }

        return null;
    };

    const formatCurrencyDefault = (value) => {
        if (value === null || value === undefined) {
            return "0,00";
        }

        return Number(value).toFixed(2).replace(".", ",");
    };

    const formatStockDefault = (value) => {
        if (value === null || value === undefined) {
            return "10";
        }

        const parsed = Number.parseFloat(String(value));
        if (!Number.isFinite(parsed)) {
            return "10";
        }

        return Number.isInteger(parsed) ? String(parsed) : String(parsed).replace(".", ",");
    };

    const parseCurrencyInput = (value) => {
        const parsed = extractNumericValue(value);
        return parsed === null ? null : parsed;
    };

    useEffect(() => {
        if (!show) {
            return;
        }

        const selectedItems = Array.isArray(selectedVariationProducts) ? selectedVariationProducts : [];

        if (!selectedItems.length) {
            setFormData({
                product_cost: "0,00",
                product_price: "0,00",
                stock_alert: "10",
            });
            return;
        }

        const costs = selectedItems.map((item) => extractNumericValue(item?.product_cost));
        const prices = selectedItems.map((item) => extractNumericValue(item?.product_price));
        const alerts = selectedItems.map((item) => extractNumericValue(item?.stock_alert));

        const firstCost = costs[0];
        const firstPrice = prices[0];
        const firstAlert = alerts[0];

        const sameCost = costs.every((value) => value === firstCost && value !== null);
        const samePrice = prices.every((value) => value === firstPrice && value !== null);
        const sameAlert = alerts.every((value) => value === firstAlert && value !== null);

        setFormData({
            product_cost: sameCost ? formatCurrencyDefault(firstCost) : "0,00",
            product_price: samePrice ? formatCurrencyDefault(firstPrice) : "0,00",
            stock_alert: sameAlert ? formatStockDefault(firstAlert) : "10",
        });
        setErrors({});
    }, [show, selectedVariationProducts]);

    const handleCostChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, product_cost: value });
        setErrors({ ...errors, product_cost: null });
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, product_price: value });
        setErrors({ ...errors, product_price: null });
    };

    const handleStockAlertChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, stock_alert: value });
        setErrors({ ...errors, stock_alert: null });
    };

    const handleSubmit = () => {
        const updateData = {};

        const parsedCost = parseCurrencyInput(formData.product_cost);
        const parsedPrice = parseCurrencyInput(formData.product_price);
        const parsedStockAlert = parseCurrencyInput(formData.stock_alert);

        if (toStringValue(formData.product_cost).trim() !== '' && parsedCost !== null) {
            updateData.product_cost = parsedCost;
        }
        if (toStringValue(formData.product_price).trim() !== '' && parsedPrice !== null) {
            updateData.product_price = parsedPrice;
        }
        if (toStringValue(formData.stock_alert).trim() !== '' && parsedStockAlert !== null) {
            updateData.stock_alert = parsedStockAlert;
        }

        if (Object.keys(updateData).length === 0) {
            setErrors({ general: getFormattedMessage("product.select.at.least.one.field.message") });
            return;
        }

        updateMultipleVariations(selectedVariationIds, updateData, () => {
            handleModalClose();
            if (mainProductId) {
                fetchMainProduct(mainProductId);
            }
        });
    };

    const handleModalClose = () => {
        setFormData({
            product_cost: '0,00',
            product_price: '0,00',
            stock_alert: '10',
        });
        setErrors({});
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleModalClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {getFormattedMessage("product.edit.multiple.variation.modal.title")} ({selectedVariationIds.length})
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errors.general && (
                    <div className="alert alert-danger" role="alert">
                        {errors.general}
                    </div>
                )}
                <Form>
                    <div className="row">
                        <div className="col-md-12 mb-3">
                            <Form.Group>
                                <Form.Label>
                                    {getFormattedMessage("product.product-details.cost.label")}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={getFormattedMessage("product.input.product-cost.placeholder.label")}
                                    value={formData.product_cost}
                                    onChange={handleCostChange}
                                    isInvalid={!!errors.product_cost}
                                />
                                {errors.product_cost && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.product_cost}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </div>
                        <div className="col-md-12 mb-3">
                            <Form.Group>
                                <Form.Label>
                                    {getFormattedMessage("price.title")}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={getFormattedMessage("product.input.product-price.placeholder.label")}
                                    value={formData.product_price}
                                    onChange={handlePriceChange}
                                    isInvalid={!!errors.product_price}
                                />
                                {errors.product_price && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.product_price}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </div>
                        <div className="col-md-12 mb-3">
                            <Form.Group>
                                <Form.Label>
                                    {getFormattedMessage("dashboard.stockAlert.title")}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={getFormattedMessage("product.input.stock-alert.placeholder.label")}
                                    value={formData.stock_alert}
                                    onChange={handleStockAlertChange}
                                    isInvalid={!!errors.stock_alert}
                                />
                                {errors.stock_alert && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.stock_alert}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </div>
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleModalClose}>
                    {getFormattedMessage("globally.cancel-btn")}
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={isSaving}
                >
                    {isSaving 
                        ? getFormattedMessage("globally.saving-btn") 
                        : getFormattedMessage("globally.save-btn")
                    }
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const mapStateToProps = (state) => {
    const { isSaving } = state;
    return { isSaving };
};

export default connect(mapStateToProps, {
    updateMultipleVariations,
    fetchMainProduct,
    setSavingButton,
})(EditMultipleVariation);

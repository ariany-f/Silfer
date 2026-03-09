import React, { useState } from "react";
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
        
        if (formData.product_cost !== '') {
            updateData.product_cost = parseFloat(formData.product_cost);
        }
        if (formData.product_price !== '') {
            updateData.product_price = parseFloat(formData.product_price);
        }
        if (formData.stock_alert !== '') {
            updateData.stock_alert = parseFloat(formData.stock_alert);
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
            product_cost: '',
            product_price: '',
            stock_alert: '',
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
                                    type="number"
                                    step="0.01"
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
                                    type="number"
                                    step="0.01"
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
                                    type="number"
                                    step="0.01"
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

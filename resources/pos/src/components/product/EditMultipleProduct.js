import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap-v5";
import { connect } from "react-redux";
import { getFormattedMessage, placeholderText } from "../../shared/sharedMethod";
import ReactSelect from "../../shared/select/reactSelect";
import { updateMultipleProducts, fetchAllMainProducts } from "../../store/action/productAction";
import { setSavingButton } from "../../store/action/saveButtonAction";

const EditMultipleProduct = (props) => {
    const {
        show,
        handleClose,
        selectedProductIds,
        brands,
        productCategories,
        units,
        updateMultipleProducts,
        fetchAllMainProducts,
        setSavingButton,
        isSaving
    } = props;

    const [formData, setFormData] = useState({
        sale_unit: null,
        brand_id: null,
        product_category_id: null,
    });

    const [errors, setErrors] = useState({});

    const handleSaleUnitChange = (obj) => {
        setFormData({ ...formData, sale_unit: obj });
        setErrors({ ...errors, sale_unit: null });
    };

    const handleBrandChange = (obj) => {
        setFormData({ ...formData, brand_id: obj });
        setErrors({ ...errors, brand_id: null });
    };

    const handleProductCategoryChange = (obj) => {
        setFormData({ ...formData, product_category_id: obj });
        setErrors({ ...errors, product_category_id: null });
    };

    const handleSubmit = () => {
        const updateData = {};
        
        if (formData.sale_unit) {
            updateData.sale_unit = formData.sale_unit.value;
        }
        if (formData.brand_id) {
            updateData.brand_id = formData.brand_id.value;
        }
        if (formData.product_category_id) {
            updateData.product_category_id = formData.product_category_id.value;
        }

        if (Object.keys(updateData).length === 0) {
            setErrors({ general: getFormattedMessage("product.select.at.least.one.field.message") });
            return;
        }

        updateMultipleProducts(selectedProductIds, updateData, () => {
            handleModalClose();
            fetchAllMainProducts({}, true);
        });
    };

    const handleModalClose = () => {
        setFormData({
            sale_unit: null,
            brand_id: null,
            product_category_id: null,
        });
        setErrors({});
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleModalClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {getFormattedMessage("product.edit.multiple.modal.title")} ({selectedProductIds.length})
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
                            <ReactSelect
                                title={getFormattedMessage("product.input.sale-unit.label")}
                                placeholder={placeholderText("product.input.sale-unit.placeholder.label")}
                                data={units || []}
                                onChange={handleSaleUnitChange}
                                value={formData.sale_unit}
                                errors={errors["sale_unit"]}
                            />
                        </div>
                        <div className="col-md-12 mb-3">
                            <ReactSelect
                                title={getFormattedMessage("brand.title")}
                                placeholder={placeholderText("product.input.brand.placeholder.label")}
                                data={brands || []}
                                onChange={handleBrandChange}
                                value={formData.brand_id}
                                errors={errors["brand_id"]}
                            />
                        </div>
                        <div className="col-md-12 mb-3">
                            <ReactSelect
                                title={getFormattedMessage("product-category.title")}
                                placeholder={placeholderText("product.input.product-category.placeholder.label")}
                                data={productCategories || []}
                                onChange={handleProductCategoryChange}
                                value={formData.product_category_id}
                                errors={errors["product_category_id"]}
                            />
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
    updateMultipleProducts,
    fetchAllMainProducts,
    setSavingButton,
})(EditMultipleProduct);

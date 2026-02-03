import React, { useEffect, useState } from "react";
import { InputGroup, Modal } from "react-bootstrap-v5";
import { decimalValidate, generateBarCode, getFormattedMessage, getFormattedOptions, placeholderText } from "../../shared/sharedMethod";
import { useDispatch, useSelector } from "react-redux";
import { taxMethodOptions, purchaseStatusOptions } from "../../constants";
import Form from "react-bootstrap/Form";
import ReactSelect from "../../shared/select/reactSelect";
import { editProduct } from "../../store/action/productAction";
import { useNavigate } from "react-router";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchAllWarehouses } from "../../store/action/warehouseAction";
import { fetchAllSuppliers } from "../../store/action/supplierAction";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";
import moment from "moment";

const EditSubProductModal = (props) => {

    const { show, productData, setShow } = props;
    const { frontSetting, warehouses, suppliers } = useSelector((state) => state);
    const [product, setProduct] = useState({});
    const [formInput, setFormInput] = useState({
        product_price: "",
        product_cost: "",
        order_tax: "",
        stock_alert: "",
        tax_type: "",
        code: "",
        add_stock: "",
        warehouse_id: "",
        supplier_id: "",
        purchase_date: new Date(),
        status_id: {
            label: getFormattedMessage("status.filter.received.label"),
            value: 1,
        },
    });
    const [errors, setErrors] = useState({});
    const taxTypeFilterOptions = getFormattedOptions(taxMethodOptions);
    const statusFilterOptions = getFormattedOptions(purchaseStatusOptions);
    const statusDefaultValue = statusFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (show) {
            dispatch(fetchAllWarehouses());
            dispatch(fetchAllSuppliers());
            setProduct(productData);
            setFormInput((prev) => ({
                ...prev,
                product_price: productData.product_price,
                product_cost: productData.product_cost,
                order_tax: productData.order_tax ? productData.order_tax : "",
                stock_alert: productData.stock_alert,
                tax_type: productData.tax_type,
                code: productData.code,
                add_stock: "",
                warehouse_id: "",
                supplier_id: "",
                purchase_date: new Date(),
                status_id: {
                    label: getFormattedMessage("status.filter.received.label"),
                    value: 1,
                },
            }));
        } else {
            setProduct({});
            setFormInput({
                product_price: "",
                product_cost: "",
                order_tax: "",
                stock_alert: "",
                tax_type: "",
                code: "",
                add_stock: "",
                warehouse_id: "",
                supplier_id: "",
                purchase_date: new Date(),
                status_id: {
                    label: getFormattedMessage("status.filter.received.label"),
                    value: 1,
                },
            });
            setErrors({});
        }
    }, [show]);

    const onProductDataChange = (e) => {
        setFormInput((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setErrors({});
    };

    const generateCode = () => {
        setFormInput((inputs) => ({
            ...inputs,
            code: generateBarCode(),
        }));
        setErrors({});
    };

    const onTaxTypeChange = (obj) => {
        setFormInput((prev) => ({
            ...prev,
            tax_type: obj,
        }));
        setErrors({});
    };

    const onWarehouseChange = (obj) => {
        setFormInput((prev) => ({
            ...prev,
            warehouse_id: obj,
        }));
        setErrors({});
    };

    const onSupplierChange = (obj) => {
        setFormInput((prev) => ({
            ...prev,
            supplier_id: obj,
        }));
        setErrors({});
    };

    const onStatusChange = (obj) => {
        setFormInput((prev) => ({
            ...prev,
            status_id: obj,
        }));
        setErrors({});
    };

    const handleDateCallback = (date) => {
        setFormInput((prev) => ({
            ...prev,
            purchase_date: date,
        }));
        setErrors({});
    };

    const handleValidation = () => {
        let validationErrors = {};
        let isValid = false;
        if (formInput['product_cost'] == '') {
            validationErrors['product_cost'] = getFormattedMessage('product.input.product-cost.validate.label');
        } else if (formInput['product_price'] == '') {
            validationErrors['product_price'] = getFormattedMessage('product.input.product-price.validate.label');
        } else if (formInput['code'] == '') {
            validationErrors['code'] = getFormattedMessage('product.input.code.validate.label');
        } else if (formInput['order_tax'] > 100) {
            validationErrors["order_tax"] = getFormattedMessage('globally.tax-length.validate.label');
        } else if (formInput['add_stock'] && formInput['add_stock'] !== "" && !formInput['warehouse_id']) {
            validationErrors["warehouse_id"] = getFormattedMessage('product.input.warehouse.validate.label');
        } else if (formInput['add_stock'] && formInput['add_stock'] !== "" && !formInput['supplier_id']) {
            validationErrors["supplier_id"] = getFormattedMessage('purchase.select.supplier.validate.label');
        } else if (formInput['add_stock'] && formInput['add_stock'] !== "" && !formInput['status_id']) {
            validationErrors["status_id"] = getFormattedMessage('globally.status.validate.label');
        } else {
            isValid = true;
        }

        setErrors(validationErrors);
        return isValid;
    };


    const onSubmit = (e) => {
        e.preventDefault();
        const valid = handleValidation();
        if (valid) {
            setShow(false);
            dispatch(editProduct(product.id, prepareFormData(product, formInput), navigate));
        }
    };

    const prepareFormData = (commonData, formInput) => {
        const formData = new FormData();

        formData.append('name', commonData.name);
        formData.append('product_code', commonData.product_code);
        formData.append('product_category_id', commonData.product_category_id);
        formData.append('brand_id', commonData.brand_id);
        formData.append('barcode_symbol', commonData.barcode_symbol);
        formData.append('product_unit', commonData.product_unit);
        formData.append('sale_unit', commonData.sale_unit);
        formData.append('purchase_unit', commonData.purchase_unit);
        formData.append('quantity_limit', commonData.quantity_limit);
        formData.append('main_product_id', commonData.main_product_id);
        formData.append('notes', commonData.notes);

        formData.append('code', formInput.code);
        formData.append('product_price', formInput.product_price);
        formData.append('product_cost', formInput.product_cost);
        formData.append('order_tax', formInput.order_tax);
        formData.append('stock_alert', formInput.stock_alert);
        if (formInput.tax_type[0]) {
            formData.append('tax_type', formInput.tax_type[0].value ? formInput.tax_type[0].value : 1);
        } else {
            formData.append('tax_type', formInput.tax_type.value ? formInput.tax_type.value : 1);
        }

        // Campos de estoque (opcional - só envia se preenchido)
        if (formInput.add_stock && formInput.add_stock !== "") {
            formData.append('purchase_warehouse_id', formInput.warehouse_id.value);
            formData.append('purchase_supplier_id', formInput.supplier_id.value);
            formData.append('purchase_quantity', formInput.add_stock);
            formData.append('purchase_date', moment(formInput.purchase_date).locale('en').format("YYYY-MM-DD"));
            formData.append('purchase_status', formInput.status_id.value);
        }

        return formData;
    };

    const defaultTaxType = productData
        ? productData.tax_type === "1"
            ? {
                value: 1,
                label: getFormattedMessage("tax-type.filter.exclusive.label"),
            }
            : {
                value: 2,
                label: getFormattedMessage("tax-type.filter.inclusive.label"),
            } || productData.tax_type === "2"
                ? {
                    value: 2,
                    label: getFormattedMessage("tax-type.filter.inclusive.label"),
                }
                : {
                    value: 1,
                    label: getFormattedMessage("tax-type.filter.exclusive.label"),
                }
        : {
            value: 1,
            label: getFormattedMessage("tax-type.filter.exclusive.label"),
        };

    const clearField = () => {
        setShow(false);
    }

    return <Modal show={show} size="xl"
        onHide={clearField}
        keyboard={true}
    >
        <Modal.Header closeButton>
            <Modal.Title>{getFormattedMessage("product.edit.title")}</Modal.Title>
        </Modal.Header>
        <Form>
            <Modal.Body>
                {product &&
                    <div className="mt-2">
                        <div>
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "product.input.product-cost.label"
                                        )}
                                        :{" "}
                                    </label>
                                    <span className="required" />
                                    <InputGroup>
                                        <input
                                            type="text"
                                            name="product_cost"
                                            min={0}
                                            className="form-control"
                                            placeholder={placeholderText(
                                                "product.input.product-cost.placeholder.label"
                                            )}
                                            onKeyPress={(event) =>
                                                decimalValidate(event)
                                            }
                                            onChange={(e) =>
                                                onProductDataChange(e)
                                            }
                                            value={
                                                formInput.product_cost
                                            }
                                        />
                                        <InputGroup.Text>
                                            {frontSetting.value &&
                                                frontSetting.value
                                                    .currency_symbol}
                                        </InputGroup.Text>
                                    </InputGroup>
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["product_cost"]
                                            ? errors["product_cost"]
                                            : null}
                                    </span>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "product.input.product-price.label"
                                        )}
                                        :{" "}
                                    </label>
                                    <span className="required" />
                                    <InputGroup>
                                        <input
                                            type="text"
                                            name="product_price"
                                            min={0}
                                            className="form-control"
                                            placeholder={placeholderText(
                                                "product.input.product-price.placeholder.label"
                                            )}
                                            onKeyPress={(event) =>
                                                decimalValidate(event)
                                            }
                                            onChange={(e) =>
                                                onProductDataChange(e)
                                            }
                                            value={
                                                formInput.product_price
                                            }
                                        />
                                        <InputGroup.Text>
                                            {frontSetting.value &&
                                                frontSetting.value
                                                    .currency_symbol}
                                        </InputGroup.Text>
                                    </InputGroup>
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["product_price"]
                                            ? errors["product_price"]
                                            : null}
                                    </span>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage("sku.barcode.title")}
                                        :{" "}
                                    </label>
                                    <span className="required" />
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            name="code"
                                            className=" form-control"
                                            placeholder={placeholderText(
                                                "product.input.code.placeholder.label"
                                            )}
                                            onChange={(e) => onProductDataChange(e)}
                                            value={formInput.code}
                                        />
                                        <button
                                            className="input-group-text border rounded-end px-4"
                                            type="button"
                                            onClick={generateCode}
                                        >
                                            <FontAwesomeIcon icon={faWandMagicSparkles} />
                                        </button>
                                    </div>
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["code"]
                                            ? errors["code"]
                                            : null}
                                    </span>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "dashboard.stockAlert.title"
                                        )}
                                        :{" "}
                                    </label>
                                    <input
                                        type="number"
                                        name="stock_alert"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "product.input.stock-alert.placeholder.label"
                                        )}
                                        onKeyPress={(event) =>
                                            decimalValidate(event)
                                        }
                                        onChange={(e) =>
                                            onProductDataChange(e)
                                        }
                                        value={
                                            formInput.stock_alert
                                        }
                                        min={0}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "globally.detail.order.tax"
                                        )}
                                        :{" "}
                                    </label>
                                    <InputGroup>
                                        <input
                                            type="text"
                                            name="order_tax"
                                            className="form-control"
                                            placeholder={placeholderText(
                                                "product.input.order-tax.placeholder.label"
                                            )}
                                            onKeyPress={(event) =>
                                                decimalValidate(event)
                                            }
                                            onChange={(e) =>
                                                onProductDataChange(e)
                                            }
                                            min={0}
                                            pattern="[0-9]*"
                                            value={
                                                formInput.order_tax
                                            }
                                        />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["order_tax"]
                                            ? errors["order_tax"]
                                            : null}
                                    </span>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <ReactSelect
                                        title={getFormattedMessage(
                                            "product.input.tax-type.label"
                                        )}
                                        multiLanguageOption={
                                            taxTypeFilterOptions
                                        }
                                        onChange={(data) =>
                                            onTaxTypeChange(data)
                                        }
                                        errors={errors["tax_type"]}
                                        defaultValue={defaultTaxType}
                                        placeholder={placeholderText(
                                            "product.input.tax-type.placeholder.label"
                                        )}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "product-quantity.add.title"
                                        )}
                                        :{" "}
                                    </label>
                                    <input
                                        type="number"
                                        name="add_stock"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "product-quantity.add.title"
                                        )}
                                        onKeyPress={(event) =>
                                            decimalValidate(event)
                                        }
                                        onChange={(e) =>
                                            onProductDataChange(e)
                                        }
                                        value={
                                            formInput.add_stock
                                        }
                                        min={0}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["add_stock"]
                                            ? errors["add_stock"]
                                            : null}
                                    </span>
                                </div>
                                {formInput.add_stock && formInput.add_stock !== "" && (
                                    <>
                                        <div className="col-md-3 mb-3">
                                            <ReactSelect
                                                data={warehouses}
                                                onChange={onWarehouseChange}
                                                defaultValue={formInput.warehouse_id}
                                                title={getFormattedMessage(
                                                    "warehouse.title"
                                                )}
                                                errors={errors["warehouse_id"]}
                                                placeholder={placeholderText(
                                                    "product.input.warehouse.placeholder.label"
                                                )}
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <ReactSelect
                                                data={suppliers}
                                                onChange={onSupplierChange}
                                                defaultValue={formInput.supplier_id}
                                                title={getFormattedMessage(
                                                    "supplier.title"
                                                )}
                                                errors={errors["supplier_id"]}
                                                placeholder={placeholderText(
                                                    "purchase.select.supplier.placeholder.label"
                                                )}
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">
                                                {getFormattedMessage(
                                                    "react-data-table.date.column.label"
                                                )}
                                                :{" "}
                                            </label>
                                            <ReactDatePicker
                                                onChangeDate={handleDateCallback}
                                                newStartDate={formInput.purchase_date}
                                                readOnlyref={false}
                                                disablePast={false}
                                                disableFuture={false}
                                                placeholder={placeholderText("react-data-table.date.column.label")}
                                            />
                                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                                {errors["purchase_date"]
                                                    ? errors["purchase_date"]
                                                    : null}
                                            </span>
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <ReactSelect
                                                multiLanguageOption={
                                                    statusFilterOptions
                                                }
                                                onChange={onStatusChange}
                                                name="status"
                                                title={getFormattedMessage(
                                                    "globally.detail.status"
                                                )}
                                                value={formInput.status_id}
                                                errors={errors["status_id"]}
                                                defaultValue={statusDefaultValue[0]}
                                                placeholder={getFormattedMessage(
                                                    "globally.detail.status"
                                                )}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                }
            </Modal.Body>
            <Modal.Footer children='justify-content-start' className='pt-0'>
                <button type="button" className="btn btn-primary m-0"
                    onClick={(event) => onSubmit(event)}>
                    {placeholderText('globally.save-btn')}</button>
                <button type="button" className="btn btn-secondary my-0 ms-5 me-0" data-bs-dismiss="modal"
                    onClick={clearField}>{getFormattedMessage('globally.cancel-btn')}
                </button>
            </Modal.Footer>
        </Form>
    </Modal>;
}

export default EditSubProductModal;

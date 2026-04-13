import React, { useEffect, useState } from "react";
import { InputGroup, Modal, Table, Button } from "react-bootstrap-v5";
import { decimalValidate, generateBarCode, getFormattedMessage, getFormattedOptions, placeholderText } from "../../shared/sharedMethod";
import { useDispatch, useSelector } from "react-redux";
import { taxMethodOptions, purchaseStatusOptions } from "../../constants";
import Form from "react-bootstrap/Form";
import ReactSelect from "../../shared/select/reactSelect";
import { editProduct } from "../../store/action/productAction";
import { useNavigate } from "react-router";
import { faWandMagicSparkles, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
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
    const [existingStocks, setExistingStocks] = useState([]);
    const [newStockItems, setNewStockItems] = useState([]);
    const [showAddStock, setShowAddStock] = useState(false);
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

    const normalizeInputValue = (value, fallback = "") => {
        if (value === null || value === undefined || value === "") {
            return fallback;
        }

        if (typeof value === "number") {
            return String(value);
        }

        if (typeof value === "object") {
            const nestedValue = value?.value ?? value?.amount ?? value?.raw ?? value?.number ?? value?.price ?? value?.cost;
            return normalizeInputValue(nestedValue, fallback);
        }

        if (typeof value === "string") {
            return value;
        }

        return fallback;
    };

    const normalizeCurrencyMask = (value, fallback = "0,00") => {
        const normalized = normalizeInputValue(value, "");
        if (normalized === "") {
            return fallback;
        }

        const parsed = Number.parseFloat(String(normalized).replace(",", "."));
        if (!Number.isFinite(parsed)) {
            return fallback;
        }

        return parsed.toFixed(2).replace(".", ",");
    };

    const toApiDecimal = (value, fallback = "0") => {
        const normalized = normalizeInputValue(value, "");
        if (normalized === "") {
            return fallback;
        }

        const parsed = Number.parseFloat(String(normalized).replace(",", "."));
        if (!Number.isFinite(parsed)) {
            return fallback;
        }

        return String(parsed);
    };

    useEffect(() => {
        if (show) {
            dispatch(fetchAllWarehouses());
            dispatch(fetchAllSuppliers());
            setProduct(productData);
            
            // Carregar todos os estoques existentes
            if (productData.all_stocks && productData.all_stocks.length > 0) {
                setExistingStocks(productData.all_stocks);
            } else {
                setExistingStocks([]);
            }

            // Resetar novos itens de estoque
            setNewStockItems([]);
            setShowAddStock(false);

            setFormInput((prev) => ({
                ...prev,
                product_price: normalizeCurrencyMask(productData.product_price, "0,00"),
                product_cost: normalizeCurrencyMask(productData.product_cost, "0,00"),
                order_tax: normalizeInputValue(productData.order_tax, ""),
                stock_alert: normalizeInputValue(productData.stock_alert, "10"),
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
            setExistingStocks([]);
            setNewStockItems([]);
            setShowAddStock(false);
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

    // Atualizar labels quando warehouses e suppliers carregarem
    useEffect(() => {
        if (show && warehouses && warehouses.length > 0 && formInput.warehouse_id && typeof formInput.warehouse_id === 'object' && formInput.warehouse_id.value) {
            const warehouse = warehouses.find(w => w.id === formInput.warehouse_id.value);
            if (warehouse && (!formInput.warehouse_id.label || formInput.warehouse_id.label === "")) {
                setFormInput((prev) => ({
                    ...prev,
                    warehouse_id: {
                        value: prev.warehouse_id.value,
                        label: warehouse.attributes?.name || warehouse.name || "",
                    },
                }));
            }
        }

        if (show && suppliers && suppliers.length > 0 && formInput.supplier_id && typeof formInput.supplier_id === 'object' && formInput.supplier_id.value) {
            const supplier = suppliers.find(s => s.id === formInput.supplier_id.value);
            if (supplier && (!formInput.supplier_id.label || formInput.supplier_id.label === "")) {
                setFormInput((prev) => ({
                    ...prev,
                    supplier_id: {
                        value: prev.supplier_id.value,
                        label: supplier.attributes?.name || supplier.name || "",
                    },
                }));
            }
        }
    }, [warehouses, suppliers, show, formInput.warehouse_id, formInput.supplier_id]);

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

    const addNewStockItem = () => {
        setNewStockItems((prev) => [
            ...prev,
            {
                id: Date.now(), // ID temporário
                warehouse_id: "",
                supplier_id: "",
                quantity: "",
                purchase_date: new Date(),
                status_id: {
                    label: getFormattedMessage("status.filter.received.label"),
                    value: 1,
                },
            },
        ]);
        setShowAddStock(true);
    };

    const removeNewStockItem = (id) => {
        setNewStockItems((prev) => prev.filter((item) => item.id !== id));
        if (newStockItems.length === 1) {
            setShowAddStock(false);
        }
    };

    const updateNewStockItem = (id, field, value) => {
        setNewStockItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const updateExistingStockQuantity = (stockId, quantity) => {
        setExistingStocks((prev) =>
            prev.map((stock) =>
                stock.id === stockId ? { ...stock, quantity: quantity } : stock
            )
        );
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
        } else {
            // Validar novos itens de estoque
            newStockItems.forEach((item, index) => {
                if (!item.warehouse_id || item.warehouse_id === "") {
                    validationErrors[`new_stock_${item.id}_warehouse`] = getFormattedMessage('product.input.warehouse.validate.label');
                }
                if (!item.supplier_id || item.supplier_id === "") {
                    validationErrors[`new_stock_${item.id}_supplier`] = getFormattedMessage('purchase.select.supplier.validate.label');
                }
                if (!item.quantity || item.quantity === "" || item.quantity <= 0) {
                    validationErrors[`new_stock_${item.id}_quantity`] = getFormattedMessage('purchase.product.quantity.validate.label');
                }
            });
            
            if (Object.keys(validationErrors).length === 0) {
                isValid = true;
            }
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
        formData.append('product_price', toApiDecimal(formInput.product_price));
        formData.append('product_cost', toApiDecimal(formInput.product_cost));
        formData.append('order_tax', toApiDecimal(formInput.order_tax, ""));
        formData.append('stock_alert', toApiDecimal(formInput.stock_alert, "0"));
        if (formInput.tax_type[0]) {
            formData.append('tax_type', formInput.tax_type[0].value ? formInput.tax_type[0].value : 1);
        } else {
            formData.append('tax_type', formInput.tax_type.value ? formInput.tax_type.value : 1);
        }

        // Enviar novos itens de estoque
        if (newStockItems.length > 0) {
            const stockItems = newStockItems.map((item) => ({
                warehouse_id: typeof item.warehouse_id === 'object' ? item.warehouse_id.value : item.warehouse_id,
                supplier_id: typeof item.supplier_id === 'object' ? item.supplier_id.value : item.supplier_id,
                quantity: item.quantity,
                date: moment(item.purchase_date).locale('en').format("YYYY-MM-DD"),
                status: typeof item.status_id === 'object' ? item.status_id.value : item.status_id,
            }));
            formData.append('new_stock_items', JSON.stringify(stockItems));
        }

        // Enviar estoques existentes atualizados (se houver mudanças de quantidade)
        const updatedStocks = existingStocks.map((stock) => ({
            id: stock.id,
            quantity: stock.quantity,
        }));
        formData.append('existing_stocks', JSON.stringify(updatedStocks));

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
                            </div>
                            
                            {/* Tabela de Estoques Existentes */}
                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">
                                            {getFormattedMessage("product.product-in-stock.label")}
                                        </h5>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={addNewStockItem}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="me-1" />
                                            {getFormattedMessage("globally.add-btn")}
                                        </Button>
                                    </div>
                                    
                                    {(existingStocks.length > 0 || newStockItems.length > 0) && (
                                        <Table responsive striped bordered>
                                            <thead>
                                                <tr>
                                                    <th>{getFormattedMessage("warehouse.title")}</th>
                                                    <th>{getFormattedMessage("supplier.title")}</th>
                                                    <th>{getFormattedMessage("product.product-in-stock.label")}</th>
                                                    <th>{getFormattedMessage("react-data-table.date.column.label")}</th>
                                                    <th>{getFormattedMessage("globally.detail.status")}</th>
                                                    <th className="text-center">{getFormattedMessage("react-data-table.action.column.label")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Estoques Existentes */}
                                                {existingStocks.map((stock) => (
                                                    <tr key={stock.id}>
                                                        <td>{stock.warehouse_name}</td>
                                                        <td>
                                                            {stock.last_purchase?.supplier_name || "-"}
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                value={stock.quantity}
                                                                min={0}
                                                                onChange={(e) =>
                                                                    updateExistingStockQuantity(
                                                                        stock.id,
                                                                        parseFloat(e.target.value) || 0
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            {stock.last_purchase?.date
                                                                ? moment(stock.last_purchase.date).format("DD/MM/YYYY")
                                                                : "-"}
                                                        </td>
                                                        <td>
                                                            {stock.last_purchase?.status
                                                                ? statusFilterOptions.find(
                                                                      (opt) => opt.id === stock.last_purchase.status
                                                                  )?.name || "-"
                                                                : "-"}
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge bg-light-info">
                                                                Existente
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                
                                                {/* Novos Estoques */}
                                                {newStockItems.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <ReactSelect
                                                                data={warehouses}
                                                                onChange={(obj) =>
                                                                    updateNewStockItem(item.id, "warehouse_id", obj)
                                                                }
                                                                defaultValue={item.warehouse_id}
                                                                title={getFormattedMessage(
                                                                    "warehouse.title"
                                                                )}
                                                                errors={errors[`new_stock_${item.id}_warehouse`]}
                                                                placeholder={placeholderText(
                                                                    "product.input.warehouse.placeholder.label"
                                                                )}
                                                            />
                                                        </td>
                                                        <td>
                                                            <ReactSelect
                                                                data={suppliers}
                                                                onChange={(obj) =>
                                                                    updateNewStockItem(item.id, "supplier_id", obj)
                                                                }
                                                                defaultValue={item.supplier_id}
                                                                title={getFormattedMessage(
                                                                    "supplier.title"
                                                                )}
                                                                errors={errors[`new_stock_${item.id}_supplier`]}
                                                                placeholder={placeholderText(
                                                                    "purchase.select.supplier.placeholder.label"
                                                                )}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                value={item.quantity}
                                                                min={1}
                                                                onChange={(e) =>
                                                                    updateNewStockItem(
                                                                        item.id,
                                                                        "quantity",
                                                                        parseFloat(e.target.value) || ""
                                                                    )
                                                                }
                                                            />
                                                            <span className="text-danger d-block fw-400 fs-small mt-1">
                                                                {errors[`new_stock_${item.id}_quantity`]
                                                                    ? errors[`new_stock_${item.id}_quantity`]
                                                                    : null}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <ReactDatePicker
                                                                onChangeDate={(date) =>
                                                                    updateNewStockItem(item.id, "purchase_date", date)
                                                                }
                                                                newStartDate={item.purchase_date}
                                                                readOnlyref={false}
                                                                disablePast={false}
                                                                disableFuture={false}
                                                                placeholder={placeholderText("react-data-table.date.column.label")}
                                                            />
                                                        </td>
                                                        <td>
                                                            <ReactSelect
                                                                multiLanguageOption={statusFilterOptions}
                                                                onChange={(obj) =>
                                                                    updateNewStockItem(item.id, "status_id", obj)
                                                                }
                                                                name="status"
                                                                title={getFormattedMessage(
                                                                    "globally.detail.status"
                                                                )}
                                                                value={item.status_id}
                                                                errors={errors[`new_stock_${item.id}_status`]}
                                                                defaultValue={statusDefaultValue[0]}
                                                                placeholder={getFormattedMessage(
                                                                    "globally.detail.status"
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="text-center">
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => removeNewStockItem(item.id)}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                    
                                    {existingStocks.length === 0 && newStockItems.length === 0 && (
                                        <div className="text-center py-4 text-muted">
                                            <p>{getFormattedMessage("react-data-table.no-record-found.label")}</p>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={addNewStockItem}
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                                {getFormattedMessage("product-quantity.add.title")}
                                            </Button>
                                        </div>
                                    )}
                                </div>
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

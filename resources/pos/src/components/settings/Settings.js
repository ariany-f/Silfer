import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Form } from "react-bootstrap-v5";
import { connect } from "react-redux";
import { dateFormatOptions } from "../../constants";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import ImagePicker from "../../shared/image-picker/ImagePicker";
import ReactSelect from "../../shared/select/reactSelect";
import {
    getFormattedMessage,
    numWithSpaceValidate,
    placeholderText,
} from "../../shared/sharedMethod";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchCurrencies } from "../../store/action/currencyAction";
import { fetchAllCustomer } from "../../store/action/customerAction";
import {
    editSetting,
    fetchCacheClear,
    fetchSetting,
    fetchState,
} from "../../store/action/settingAction";
import { fetchAllWarehouses } from "../../store/action/warehouseAction";
import HeaderTitle from "../header/HeaderTitle";
import MasterLayout from "../MasterLayout";
import warning from "../../assets/images/warning.png"
import EditHoldConfirmationModal from "../../frontend/components/cart-product/EditHoldConfirmationModal";
import barcodeOptions from "../../shared/option-lists/barcode.json";

const Settings = (props) => {
    const intl = useIntl();
    const decimalSepData = useMemo(
        () => [
            {
                value: ".",
                label: intl.formatMessage({
                    id: "settings.decimal.separator.option.dot",
                    defaultMessage: "Dot as decimal (1,234.56)",
                }),
            },
            {
                value: ",",
                label: intl.formatMessage({
                    id: "settings.decimal.separator.option.comma",
                    defaultMessage: "Comma as decimal (1.234,56)",
                }),
            },
        ],
        [intl]
    );

    const {
        fetchSetting,
        fetchCurrencies,
        fetchAllCustomer,
        customers,
        fetchAllWarehouses,
        warehouses,
        editSetting,
        currencies,
        settings,
        fetchState,
        countryState,
        dateFormat,
        defaultCountry,
        fetchCacheClear
    } = props;

    const [settingValue, setSettingValue] = useState({
        currency: "",
        currency_symbol: "",
        email: "",
        logo: "",
        phone: "",
        default_language: "",
        default_customer: "",
        default_warehouse: "",
        warehouse_name: "",
        address: "",
        dateFormat: "",
        country: "",
        countries: "",
        state: "",
        postCode: "",
        date_format: "",
        currency_icon_right_side: "",
        decimal_separator: "",
        default_barcode_symbol: "",
    });

    const [defaultDate, setDefaultDate] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState();
    const [byDefaultCountry, setByDefaultCountry] = useState(null);
    const [selectImg, setSelectImg] = useState(null);
    const [isClearCache, setIsClearCache] = useState(false);
    const [errors, setErrors] = useState({
        currency: "",
        currency_symbol: "",
        email: "",
        phone: "",
        default_language: "",
        default_customer: "",
        default_warehouse: "",
        warehouse_name: "",
        address: "",
        city: "",
        country: "",
        date_format: "",
        currency_icon_right_side: "",
    });

    const [disable, setDisable] = useState(true);

    useEffect(() => {
        fetchSetting();
        fetchCurrencies();
        fetchAllCustomer();
        fetchAllWarehouses();
    }, []);

    useEffect(() => {
        if (settings) {
            setSettingValue({
                currency:
                    settings.attributes && settings.attributes.currency
                        ? {
                              value: Number(settings.attributes.currency),
                              label: settings.attributes.currency_symbol,
                          }
                        : "",
                currency_symbol:
                    settings.attributes && settings.attributes.currency_symbol
                        ? settings.attributes.currency_symbol
                        : "",
                email:
                    settings.attributes && settings.attributes.store_email
                        ? settings.attributes.store_email
                        : "",
                logo:
                    settings.attributes && settings.attributes.store_logo
                        ? settings.attributes.store_logo
                        : "",
                phone:
                    settings.attributes && settings.attributes.store_phone
                        ? settings.attributes.store_phone
                        : "",
                default_language:
                    settings.attributes && settings.attributes.default_language
                        ? settings.attributes.default_language
                        : "",
                default_customer:
                    settings.attributes && settings.attributes.default_customer
                        ? {
                              value: Number(
                                  settings.attributes.default_customer
                              ),
                              label: settings.attributes.customer_name,
                          }
                        : "",
                default_warehouse:
                    settings.attributes && settings.attributes.default_warehouse
                        ? {
                              value: Number(
                                  settings.attributes.default_warehouse
                              ),
                              label: settings.attributes.warehouse_name,
                          }
                        : "",
                warehouse_name:
                    settings.attributes && settings.attributes.warehouse_name
                        ? settings.attributes.warehouse_name
                        : "",
                address:
                    settings.attributes && settings.attributes.store_address
                        ? settings.attributes.store_address
                        : "",
                city:
                    settings.attributes && settings.attributes.city
                        ? settings.attributes.city
                        : "",
                postCode:
                    settings.attributes && settings.attributes.store_postcode
                        ? settings.attributes.store_postcode
                        : "",
                countries:
                    settings.attributes &&
                    settings?.attributes?.countries &&
                    byDefaultCountry
                        ? {
                              value: byDefaultCountry.id,
                              label: byDefaultCountry.name,
                          }
                        : "",
                country:
                    settings?.attributes && settings?.attributes?.country
                        ? {
                              value: settings?.attributes?.country,
                              label: settings?.attributes?.country,
                          }
                        : "",
                state:
                    settings.attributes && settings?.attributes?.country
                        ? {
                              value: settings?.attributes?.state,
                              label: settings?.attributes?.state,
                          }
                        : "",
                date_format:
                    settings.attributes &&
                    settings.attributes.date_format &&
                    defaultDate
                        ? { value: defaultDate.value, label: defaultDate.label }
                        : "",
                currency_icon_right_side:
                    settings.attributes &&
                    settings.attributes.is_currency_right !== "true"
                        ? false
                        : true,
                decimal_separator: (() => {
                    const sep =
                        settings.attributes?.decimal_separator === ","
                            ? ","
                            : ".";
                    return (
                        decimalSepData.find((d) => d.value === sep) ||
                        decimalSepData[0]
                    );
                })(),
                default_barcode_symbol: (() => {
                    const v = settings.attributes?.default_barcode_symbol;
                    const pick =
                        v != null && v !== "" ? String(v) : String(barcodeOptions[0].value);
                    const row = barcodeOptions.find(
                        (b) => String(b.value) === pick
                    );
                    return row
                        ? { value: row.value, label: row.label }
                        : {
                              value: barcodeOptions[0].value,
                              label: barcodeOptions[0].label,
                          };
                })(),
            });
        }
    }, [settings, defaultDate, decimalSepData]);

    useEffect(() => {
        if (dateFormat) {
            const defaultDateFormat = dateFormat
                ? dateFormatOptions.filter((date) => date.value == dateFormat)
                : null;
            defaultDateFormat && setDefaultDate(defaultDateFormat[0]);
        }
    }, [dateFormat]);

    useEffect(() => {
        if (defaultCountry) {
            const countries =
                defaultCountry &&
                defaultCountry.countries &&
                defaultCountry.countries.filter(
                    (country) => country.name == defaultCountry.country
                );
            countries && setByDefaultCountry(countries[0]);
        }
    }, [defaultCountry]);

    useEffect(() => {
        byDefaultCountry && fetchState(byDefaultCountry && byDefaultCountry.id);
    }, [byDefaultCountry]);

    const [checkState, setCheckState] = useState(false);
    const [allState, setAllState] = useState(null);

    useEffect(() => {
        if (countryState.value) {
            setCheckState(true);
            setAllState(countryState);
        }
    }, [settings, countryState]);

    const stateOptions =
        checkState &&
        allState &&
        allState.value &&
        allState.value.map((item) => {
            return {
                id: item,
                name: item,
            };
        });

    const onCurrencyChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({ ...settingValue, currency: obj }));
        setErrors("");
    };

    const onCustomerChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({
            ...settingValue,
            default_customer: obj,
        }));
        setErrors("");
    };

    const onWarehouseChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({
            ...settingValue,
            default_warehouse: obj,
        }));
        setErrors("");
    };

    const onCountryChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({ ...settingValue, country: obj }));
        setSettingValue((settingValue) => ({ ...settingValue, state: null }));
        fetchState(obj.value);
        setErrors("");
    };

    const onStateChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({ ...settingValue, state: obj }));
        setErrors("");
    };

    const handleImageChange = (e) => {
        e.preventDefault();
        setDisable(false);
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/svg+xml") {
                setSelectImg(file);
                const fileReader = new FileReader();
                fileReader.onloadend = () => {
                    setImagePreviewUrl(fileReader.result);
                };
                if (file) {
                    fileReader.readAsDataURL(file);
                }
                setErrors("");
            }
        }
    };

    // checkedCurrency
    const handleChangedCurrency = (event) => {
        let checked = event.target.checked;
        setDisable(false);
        setSettingValue((settingValue) => ({
            ...settingValue,
            currency_icon_right_side: checked,
        }));
    };

    const onChangeInput = (event) => {
        event.preventDefault();
        setDisable(false);
        setSettingValue((inputs) => ({
            ...inputs,
            [event.target.name]: event.target.value,
        }));
        setErrors("");
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        formData.append(
            "currency",
            data.currency.value ? data.currency.value : data.currency
        );
        formData.append("store_email", data.email);
        if (selectImg) {
            formData.append("store_logo", data.logo);
        }
        formData.append("store_phone", data.phone);
        if (data.default_language.value) {
            formData.append("default_language", data.default_language.value);
        } else {
            formData.append("default_language", data.default_language);
        }
        formData.append(
            "default_customer",
            data.default_customer.value
                ? data.default_customer.value
                : data.default_customer
        );
        formData.append(
            "default_warehouse",
            data.default_warehouse.value
                ? data.default_warehouse.value
                : data.default_warehouse
        );
        formData.append("store_address", data.address);
        formData.append("city", data.city);
        formData.append("store_postcode", data.postCode);
        formData.append("country", data.country.label);
        formData.append("state", data.state.label);
        formData.append("date_format", data.date_format.value);
        formData.append("is_currency_right", data.currency_icon_right_side);
        formData.append(
            "decimal_separator",
            data.decimal_separator?.value != null
                ? data.decimal_separator.value
                : data.decimal_separator ?? "."
        );
        formData.append(
            "default_barcode_symbol",
            data.default_barcode_symbol?.value != null
                ? data.default_barcode_symbol.value
                : data.default_barcode_symbol ??
                      String(barcodeOptions[0].value)
        );
        return formData;
    };
    
    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!settingValue["currency"]) {
            errorss["currency"] = getFormattedMessage(
                "settings.system-settings.select.default-currency.validate.label"
            );
        } else if (!settingValue["email"]) {
            errorss["email"] = getFormattedMessage(
                "globally.input.email.validate.label"
            );
        } else if (!settingValue["phone"]) {
            errorss["phone"] = getFormattedMessage(
                "settings.system-settings.input.company-phone.validate.label"
            );
        }
        else if (!settingValue["default_customer"]) {
            errorss["default_customer"] = getFormattedMessage(
                "sale.select.customer.validate.label"
            );
        } else if (!settingValue["default_warehouse"]) {
            errorss["default_warehouse"] = getFormattedMessage(
                "product.input.warehouse.validate.label"
            );
        } else if (!settingValue["address"]) {
            errorss["address"] = getFormattedMessage(
                "globally.input.address.validate.label"
            );
        } else if (
            settingValue["address"] &&
            settingValue["address"].length > 150
        ) {
            errorss["address"] = getFormattedMessage(
                "settings.system-settings.select.address.valid.validate.label"
            );
        } else if (!settingValue["city"]) {
            errorss["city"] = getFormattedMessage(
                "globally.input.city.validate.label"
            );
        }
        else if (!settingValue["country"]) {
            errorss["country"] = getFormattedMessage(
                "settings.system-settings.select.country.validate.label"
            );
        } else if (!settingValue["state"]) {
            errorss["state"] = getFormattedMessage(
                "settings.system-settings.select.state.validate.label"
            );
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const onEdit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        settingValue.logo = selectImg;
        if (valid) {
            editSetting(prepareFormData(settingValue), true, setDefaultDate);
            setDisable(true);
        }
    };

    const onDateFormatChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({
            ...settingValue,
            date_format: obj,
        }));
        setErrors("");
    };

    const onDecimalSeparatorChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({
            ...settingValue,
            decimal_separator: obj,
        }));
        setErrors("");
    };

    const onDefaultBarcodeSymbolChange = (obj) => {
        setDisable(false);
        setSettingValue((settingValue) => ({
            ...settingValue,
            default_barcode_symbol: obj,
        }));
        setErrors("");
    };

    const onConfirm = () => {
        fetchCacheClear();
        setIsClearCache( false )
    }

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("settings.title")} />
            <HeaderTitle
                title={getFormattedMessage("settings.system-settings.title")}
            />
            <>
                <div className="card">
                    <div className="card-body">
                        <Form>
                            <div className="row">
                                <div className="col-lg-6 mb-3">
                                    <div>
                                        {settings &&
                                            settings.attributes &&
                                            settingValue.currency && (
                                                <ReactSelect
                                                    title={getFormattedMessage(
                                                        "settings.system-settings.select.default-currency.label"
                                                    )}
                                                    placeholder={placeholderText(
                                                        "settings.system-settings.select.default-currency.placeholder.label"
                                                    )}
                                                    defaultValue={
                                                        settings
                                                            ? settings.attributes &&
                                                              settingValue.currency
                                                            : ""
                                                    }
                                                    data={currencies}
                                                    onChange={onCurrencyChange}
                                                    errors={errors["currency"]}
                                                />
                                            )}
                                    </div>
                                    <div className="mt-3">
                                        <div>
                                            {getFormattedMessage(
                                                "currency.icon.right.side.lable"
                                            )}
                                        </div>
                                        <div className="d-flex align-items-center mt-2">
                                            <label className="form-check form-switch form-switch-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        settingValue.currency_icon_right_side
                                                    }
                                                    name="currency_icon_right_side"
                                                    onChange={(event) =>
                                                        handleChangedCurrency(
                                                            event
                                                        )
                                                    }
                                                    className="me-3 form-check-input cursor-pointer"
                                                />
                                                <div className="control__indicator" />
                                            </label>
                                            <span
                                                className="switch-slider"
                                                data-checked="✓"
                                                data-unchecked="✕"
                                            >
                                                {errors[
                                                    "currency_icon_right_side"
                                                ]
                                                    ? errors[
                                                          "currency_icon_right_side"
                                                      ]
                                                    : null}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "settings.system-settings.input.default-email.label"
                                        )}
                                        :<span className='required' />
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "settings.system-settings.input.default-email.placeholder.label"
                                        )}
                                        name="email"
                                        value={settingValue.email}
                                        onChange={(e) => onChangeInput(e)}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["email"]
                                            ? errors["email"]
                                            : null}
                                    </span>
                                </div>
                                <div className="col-lg-6 mb-3">
                                    <ImagePicker
                                        imageTitle={placeholderText(
                                            "globally.input.change-logo.tooltip"
                                        )}
                                        imagePreviewUrl={
                                            imagePreviewUrl
                                                ? imagePreviewUrl
                                                : settings.attributes &&
                                                  settings.attributes.store_logo
                                        }
                                        handleImageChange={handleImageChange}
                                    />
                                </div>
                                <div className="col-lg-6 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "settings.system-settings.input.company-phone.label"
                                        )}
                                        :<span className='required' />
                                    </label>
                                    <Form.Control
                                        type="text"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "settings.system-settings.input.company-phone.placeholder.label"
                                        )}
                                        name="phone"
                                        min={0}
                                        value={settingValue.phone}
                                        onKeyPress={(event) =>
                                            numWithSpaceValidate(event)
                                        }
                                        onChange={onChangeInput}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["phone"]
                                            ? errors["phone"]
                                            : null}
                                    </span>
                                </div>

                                <div className="col-lg-6 mb-3">
                                    {settings &&
                                        settings.attributes &&
                                        settingValue.default_customer && (
                                            <ReactSelect
                                                title={getFormattedMessage(
                                                    "settings.system-settings.select.default-customer.label"
                                                )}
                                                placeholder={placeholderText(
                                                    "settings.system-settings.select.default-customer.placeholder.label"
                                                )}
                                                defaultValue={
                                                    settings
                                                        ? settings.attributes &&
                                                          settingValue.default_customer
                                                        : ""
                                                }
                                                data={customers}
                                                onChange={onCustomerChange}
                                                errors={
                                                    errors["default_customer"]
                                                }
                                            />
                                        )}
                                </div>
                                <div className="col-lg-6 mb-3">
                                    {settings &&
                                        settings.attributes &&
                                        settingValue.default_warehouse && (
                                            <ReactSelect
                                                title={getFormattedMessage(
                                                    "settings.system-settings.select.default-warehouse.label"
                                                )}
                                                placeholder={placeholderText(
                                                    "settings.system-settings.select.default-warehouse.label"
                                                )}
                                                defaultValue={
                                                    settings
                                                        ? settings.attributes &&
                                                          settingValue.default_warehouse
                                                        : ""
                                                }
                                                data={warehouses}
                                                onChange={onWarehouseChange}
                                                errors={
                                                    errors["default_warehouse"]
                                                }
                                            />
                                        )}
                                </div>

                                {/* Country  */}
                                <div className="col-lg-6 mb-3">
                                    {/* {settings &&
                                        settings.attributes &&
                                        byDefaultCountry && ( */}
                                            <ReactSelect
                                                title={getFormattedMessage(
                                                    "globally.input.country.label"
                                                )}
                                                placeholder={placeholderText(
                                                    "globally.input.country.label"
                                                )}
                                                defaultValue={
                                                    settings &&
                                                    settings.attributes &&
                                                    byDefaultCountry
                                                        ? {
                                                              label: settingValue
                                                                  .country
                                                                  .label,
                                                              value: settingValue
                                                                  .country
                                                                  .value,
                                                          }
                                                        : ""
                                                }
                                                name="country"
                                                multiLanguageOption={
                                                    defaultCountry.countries
                                                        ? defaultCountry.countries
                                                        : []
                                                }
                                                onChange={onCountryChange}
                                                errors={errors["country"]}
                                            />
                                        {/* )} */}
                                </div>
                                {/* state  */}
                                <div className="col-lg-6 mb-3">
                                    {/* {settings &&
                                        settings.attributes &&
                                        stateOptions.length && ( */}
                                            <ReactSelect
                                                title={getFormattedMessage(
                                                    "setting.state.lable"
                                                )}
                                                placeholder={placeholderText(
                                                    "setting.state.lable"
                                                )}
                                                name="state"
                                                value={
                                                    settingValue &&
                                                    settingValue.state !== null
                                                        ? settingValue.state
                                                        : ""
                                                }
                                                multiLanguageOption={
                                                    stateOptions
                                                }
                                                onChange={onStateChange}
                                                errors={errors["state"]}
                                            />
                                        {/* )} */}
                                </div>
                                {/* City  */}
                                <div className="col-lg-6 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "globally.input.city.label"
                                        )}
                                        :<span className='required' />
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "globally.input.city.label"
                                        )}
                                        name="city"
                                        value={settingValue.city}
                                        onChange={(e) => onChangeInput(e)}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["city"] ? errors["city"] : null}
                                    </span>
                                </div>
                                {/* POST code */}
                                <div className="col-lg-6 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "setting.postCode.lable"
                                        )}
                                        :
                                    </label>
                                    <Form.Control
                                        type="text"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "setting.postCode.lable"
                                        )}
                                        name="postCode"
                                        min={0}
                                        value={settingValue.postCode}
                                        onKeyPress={(event) => event}
                                        onChange={onChangeInput}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        
                                    </span>
                                </div>
                                <div className="col-lg-6 mb-3">
                                    {settings &&
                                        settings.attributes &&
                                        settings.attributes.date_format &&
                                        defaultDate &&
                                        settingValue.date_format && (
                                            <ReactSelect
                                                title={getFormattedMessage(
                                                    "settings.system-settings.select.date-format.label"
                                                )}
                                                placeholder={placeholderText(
                                                    "settings.system-settings.select.default-warehouse.label"
                                                )}
                                                defaultValue={
                                                    settings
                                                        ? settings.attributes &&
                                                          settingValue.date_format
                                                        : ""
                                                }
                                                data={dateFormatOptions}
                                                onChange={onDateFormatChange}
                                                errors={errors["date_format"]}
                                            />
                                        )}
                                </div>
                                <div className="col-lg-6 mb-3">
                                    {settingValue.decimal_separator ? (
                                        <ReactSelect
                                            title={intl.formatMessage({
                                                id: "settings.decimal.separator.label",
                                                defaultMessage:
                                                    "Decimal separator",
                                            })}
                                            placeholder={intl.formatMessage({
                                                id: "settings.decimal.separator.placeholder",
                                                defaultMessage:
                                                    "Select decimal separator",
                                            })}
                                            data={decimalSepData}
                                            value={settingValue.decimal_separator}
                                            onChange={onDecimalSeparatorChange}
                                        />
                                    ) : null}
                                </div>
                                <div className="col-lg-6 mb-3">
                                    {settingValue.default_barcode_symbol ? (
                                        <>
                                            <ReactSelect
                                                title={intl.formatMessage({
                                                    id: "settings.default.barcode.symbology.label",
                                                    defaultMessage:
                                                        "Default barcode symbology (new products)",
                                                })}
                                                placeholder={intl.formatMessage({
                                                    id: "settings.default.barcode.symbology.placeholder",
                                                    defaultMessage:
                                                        "Select default symbology",
                                                })}
                                                data={barcodeOptions}
                                                value={
                                                    settingValue.default_barcode_symbol
                                                }
                                                onChange={
                                                    onDefaultBarcodeSymbolChange
                                                }
                                            />
                                            <p className="text-muted small mb-0 mt-1">
                                                {intl.formatMessage({
                                                    id: "settings.default.barcode.symbology.hint",
                                                    defaultMessage:
                                                        "Pre-selected when creating a product.",
                                                })}
                                            </p>
                                        </>
                                    ) : null}
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "globally.input.address.label"
                                        )}
                                        :<span className='required' />
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        placeholder={placeholderText(
                                            "globally.input.address.placeholder.label"
                                        )}
                                        name="address"
                                        value={settingValue.address}
                                        onChange={(e) => onChangeInput(e)}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["address"]
                                            ? errors["address"]
                                            : null}
                                    </span>
                                </div>

                                <div>
                                    <button
                                        disabled={disable}
                                        className="btn btn-primary mt-4"
                                        onClick={(event) => onEdit(event)}
                                    >
                                        {getFormattedMessage(
                                            "globally.save-btn"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>

                <div className="w-100 mx-auto pt-lg-10 pt-5">
                    <h4 className="mb-5">
                        {getFormattedMessage("globally.clear.cache.title")}
                    </h4>
                    <Form className="card card-body">
                        <div className="row">
                            <div>
                                <button
                                    className="btn btn-primary"
                                    type="button"
                                    onClick={() => setIsClearCache(true)}
                                >
                                    {getFormattedMessage(
                                        "globally.clear.cache.title"
                                    )}
                                </button>
                            </div>
                        </div>
                    </Form>
                </div>
                {isClearCache &&
                    <EditHoldConfirmationModal
                        onConfirm={onConfirm}
                        onCancel={() => setIsClearCache(false)}
                        icon={warning}
                        title={getFormattedMessage("globally.clear.cache.warning.message")}
                    />}
            </>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        customers,
        warehouses,
        settings,
        currencies,
        countryState,
        dateFormat,
        defaultCountry,
    } = state;
    return {
        customers,
        warehouses,
        settings,
        currencies,
        countryState,
        dateFormat,
        defaultCountry,
    };
};

export default connect(mapStateToProps, {
    fetchSetting,
    fetchCurrencies,
    fetchAllCustomer,
    fetchAllWarehouses,
    editSetting,
    fetchState,
    fetchCacheClear
})(Settings);

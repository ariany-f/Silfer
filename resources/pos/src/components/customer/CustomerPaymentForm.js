import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import {
    getFormattedMessage,
    placeholderText,
} from "../../shared/sharedMethod";
import {
    addCustomerPayment,
    updateCustomerPayment,
    fetchCustomerPayment,
} from "../../store/action/customerPaymentAction";
import ModelFooter from "../../shared/components/modelFooter";
import ReactSelect from "../../shared/select/reactSelect";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";
import { fetchCustomers } from "../../store/action/customerAction";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import HeaderTitle from "../header/HeaderTitle";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";

const CustomerPaymentForm = (props) => {
    const {
        addCustomerPayment,
        updateCustomerPayment,
        singleCustomerPayment,
        customers,
        fetchCustomers,
        fetchCustomerPayment,
        isLoading,
    } = props;
    const { customerId, id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [paymentValue, setPaymentValue] = useState({
        customer_id: customerId || "",
        payment_date: null,
        due_date: null,
        amount: "",
        status: "pending",
        notes: "",
    });

    // Atualizar o formulário quando os dados do pagamento forem carregados
    useEffect(() => {
        if (singleCustomerPayment && singleCustomerPayment.length > 0) {
            const payment = singleCustomerPayment[0];
            // A resposta pode vir como objeto direto ou com estrutura { type, id, attributes }
            const paymentData = payment.attributes || payment;
            setPaymentValue({
                customer_id: customerId || paymentData.customer_id || "",
                payment_date: paymentData.payment_date
                    ? moment(paymentData.payment_date).toDate()
                    : null,
                due_date: paymentData.due_date
                    ? moment(paymentData.due_date).toDate()
                    : null,
                amount: paymentData.amount || "",
                status: paymentData.status || "pending",
                notes: paymentData.notes || "",
            });
        }
    }, [singleCustomerPayment, customerId]);

    const [errors, setErrors] = useState({
        customer_id: "",
        payment_date: "",
        amount: "",
        status: "",
    });

    useEffect(() => {
        if (!customerId) {
            fetchCustomers({}, false, "?page[size]=0");
        }
    }, [customerId]);

    useEffect(() => {
        if (isEditMode && id) {
            fetchCustomerPayment(id, true);
        }
    }, [id, isEditMode, fetchCustomerPayment]);

    // Auto-preencher data quando status mudar para concluído
    useEffect(() => {
        if (paymentValue.status === 'completed' && !paymentValue.payment_date) {
            setPaymentValue(prev => ({ ...prev, payment_date: new Date() }));
        }
    }, [paymentValue.status]);

    const handleCallback = (date) => {
        setPaymentValue({ ...paymentValue, payment_date: date });
        setErrors({ ...errors, payment_date: "" });
    };

    const handleDueDateCallback = (date) => {
        setPaymentValue({ ...paymentValue, due_date: date });
    };

    const onCustomerChange = (obj) => {
        setPaymentValue({ ...paymentValue, customer_id: obj });
        setErrors({ ...errors, customer_id: "" });
    };

    const onStatusChange = (obj) => {
        const newStatus = obj.value;
        let updatedPaymentValue = { ...paymentValue, status: newStatus };
        
        // Se mudou para concluído e não tem data de pagamento, preenche automaticamente
        if (newStatus === 'completed' && !paymentValue.payment_date) {
            updatedPaymentValue.payment_date = new Date();
        }
        
        setPaymentValue(updatedPaymentValue);
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!customerId && !paymentValue.customer_id) {
            errorss.customer_id = getFormattedMessage("customer.select.validate.label");
        } else if (!paymentValue.amount || paymentValue.amount <= 0) {
            errorss.amount = getFormattedMessage("globally.input.amount.validate.label");
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (handleValidation()) {
            const paymentData = {
                customer_id: customerId || paymentValue.customer_id?.value || paymentValue.customer_id,
                payment_date: paymentValue.payment_date
                    ? moment(paymentValue.payment_date).format("YYYY-MM-DD")
                    : null,
                due_date: paymentValue.due_date
                    ? moment(paymentValue.due_date).format("YYYY-MM-DD")
                    : null,
                amount: paymentValue.amount,
                status: paymentValue.status,
                notes: paymentValue.notes || null,
            };

            if (isEditMode) {
                updateCustomerPayment(id, paymentData, navigate, customerId);
            } else {
                addCustomerPayment(paymentData, navigate, customerId);
            }
        }
    };

    const customersData = customers?.map((customer) => ({
        id: customer.id,
        label: customer.attributes?.name || customer.name,
        value: customer.id,
    })) || [];

    const statusOptions = [
        { label: getFormattedMessage("globally.status.pending"), value: "pending" },
        { label: getFormattedMessage("globally.status.completed"), value: "completed" },
    ];

    // Converter status string para objeto para o ReactSelect
    const getStatusValue = () => {
        if (!paymentValue.status) return null;
        return statusOptions.find(opt => opt.value === paymentValue.status) || null;
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle
                title={
                    isEditMode
                        ? placeholderText("customer.payment.edit.title")
                        : placeholderText("customer.payment.create.title")
                }
            />
            <HeaderTitle
                title={
                    isEditMode
                        ? getFormattedMessage("customer.payment.edit.title")
                        : getFormattedMessage("customer.payment.create.title")
                }
                to={customerId ? `/app/user/customers/${customerId}/payments` : '/app/user/customers'}
            />
            <div className="card">
                <div className="card-body">
                    <Form>
                        <div className="row">
                            {!customerId && (
                                <div className="col-md-6 mb-3">
                                    <ReactSelect
                                        name="customer_id"
                                        data={customersData}
                                        onChange={onCustomerChange}
                                        title={getFormattedMessage("customer.title")}
                                        errors={errors.customer_id}
                                        defaultValue={paymentValue.customer_id}
                                        value={paymentValue.customer_id}
                                        placeholder={placeholderText("customer.select.placeholder.label")}
                                    />
                                </div>
                            )}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    {getFormattedMessage("globally.react-table.column.payment-date.label")}:
                                </label>
                                {paymentValue.status === 'completed' && <span className="required" />}
                                <div className="position-relative">
                                    <ReactDatePicker
                                        onChangeDate={handleCallback}
                                        newStartDate={paymentValue.payment_date}
                                    />
                                </div>
                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                    {errors.payment_date ? errors.payment_date : null}
                                </span>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    {getFormattedMessage("globally.react-table.column.due-date.label")}:
                                </label>
                                <div className="position-relative">
                                    <ReactDatePicker
                                        onChangeDate={handleDueDateCallback}
                                        newStartDate={paymentValue.due_date}
                                        disableFuture={false}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    {getFormattedMessage("amount.title")}:
                                </label>
                                <span className="required" />
                                <Form.Control
                                    type="text"
                                    name="amount"
                                    value={paymentValue.amount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Allow only numbers and decimal point
                                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                            // Check if value includes a decimal point
                                            if (value.match(/\./g)) {
                                                const [, decimal] = value.split('.');
                                                // restrict value to only 2 decimal places
                                                if (decimal?.length > 2) {
                                                    return;
                                                }
                                            }
                                            setPaymentValue({ ...paymentValue, amount: value });
                                            setErrors({ ...errors, amount: "" });
                                        }
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "") {
                                            setPaymentValue({ ...paymentValue, amount: "" });
                                        }
                                    }}
                                />
                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                    {errors.amount ? errors.amount : null}
                                </span>
                            </div>
                            <div className="col-md-6 mb-3">
                                <ReactSelect
                                    name="status"
                                    data={statusOptions}
                                    onChange={onStatusChange}
                                    title={getFormattedMessage("globally.react-table.column.status.label")}
                                    defaultValue={getStatusValue()}
                                    value={getStatusValue()}
                                    placeholder={placeholderText("globally.select.status.placeholder.label")}
                                />
                            </div>
                            <div className="col-md-12 mb-3">
                                <label className="form-label">
                                    {getFormattedMessage("globally.input.notes.label")}:
                                </label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="notes"
                                    value={paymentValue.notes}
                                    onChange={(e) => {
                                        setPaymentValue({ ...paymentValue, notes: e.target.value });
                                    }}
                                    placeholder={placeholderText("globally.input.notes.placeholder.label")}
                                />
                            </div>
                        </div>
                        <ModelFooter
                            onEditRecord={isEditMode ? singleCustomerPayment : null}
                            onSubmit={onSubmit}
                            editDisabled={isLoading}
                            link={customerId ? `/app/user/customers/${customerId}/payments` : '/app/user/customers'}
                            addDisabled={!paymentValue.amount || paymentValue.amount <= 0}
                        />
                    </Form>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { customers, isLoading, singleCustomerPayment } = state;
    return { customers, isLoading, singleCustomerPayment };
};

export default connect(mapStateToProps, {
    addCustomerPayment,
    updateCustomerPayment,
    fetchCustomers,
    fetchCustomerPayment,
})(CustomerPaymentForm);

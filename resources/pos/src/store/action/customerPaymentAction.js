import apiConfig from "../../config/apiConfig";
import { apiBaseURL, toastType, customerActionType } from "../../constants";
import requestParam from "../../shared/requestParam";
import { addToast } from "./toastAction";
import { setTotalRecord } from "./totalRecordAction";
import { setLoading } from "./loadingAction";

export const fetchCustomerPayments =
    (filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = apiBaseURL.CUSTOMER_PAYMENTS;
        if (
            !_.isEmpty(filter) &&
            (filter.page ||
                filter.pageSize ||
                filter.search ||
                filter.order_By ||
                filter.created_at ||
                filter.customer_id)
        ) {
            url += requestParam(filter, null, null, null, url);
        }
        apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: customerActionType.FETCH_CUSTOMER_PAYMENTS,
                    payload: response.data.data.data,
                });
                dispatch(
                    setTotalRecord(
                        response.data.data.total
                    )
                );
                if (isLoading) {
                    dispatch(setLoading(false));
                }
            })
            .catch(({ response }) => {
                dispatch(
                    addToast({
                        text: response?.data?.message,
                        type: toastType.ERROR,
                    })
                );
                if (isLoading) {
                    dispatch(setLoading(false));
                }
            });
    };

export const fetchCustomerPaymentsByCustomer =
    (customerId, filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = `${apiBaseURL.CUSTOMERS}/${customerId}/payments`;
        if (
            !_.isEmpty(filter) &&
            (filter.page ||
                filter.pageSize ||
                filter.search ||
                filter.order_By ||
                filter.created_at)
        ) {
            url += requestParam(filter, null, null, null, url);
        }
        apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: customerActionType.FETCH_CUSTOMER_PAYMENTS,
                    payload: response.data.data,
                });
                dispatch(
                    setTotalRecord(
                        response.data.meta?.total !== undefined &&
                        response.data.meta?.total >= 0
                            ? response.data.meta.total
                            : response.data.data?.total || 0
                    )
                );
                if (isLoading) {
                    dispatch(setLoading(false));
                }
            })
            .catch(({ response }) => {
                dispatch(
                    addToast({
                        text: response?.data?.message || "Algo deu errado",
                        type: toastType.ERROR,
                    })
                );
                if (isLoading) {
                    dispatch(setLoading(false));
                }
            });
    };

export const addCustomerPayment = (payment, navigate, customerId) => async (dispatch) => {
    dispatch(setLoading(true));
    apiConfig
        .post(apiBaseURL.CUSTOMER_PAYMENTS, payment)
        .then((response) => {
            dispatch({
                type: customerActionType.ADD_CUSTOMER_PAYMENT,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: response.data.message,
                    type: toastType.SUCCESS,
                })
            );
            dispatch(setLoading(false));
            if (navigate) {
                if (customerId) {
                    navigate(`/app/user/customers/${customerId}/payments`);
                } else {
                    navigate(-1);
                }
            }
        })
        .catch(({ response }) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                    type: toastType.ERROR,
                })
            );
            dispatch(setLoading(false));
        });
};

export const updateCustomerPayment = (id, payment, navigate, customerId) => async (dispatch) => {
    dispatch(setLoading(true));
    apiConfig
        .patch(`${apiBaseURL.CUSTOMER_PAYMENTS}/${id}`, payment)
        .then((response) => {
            dispatch({
                type: customerActionType.EDIT_CUSTOMER_PAYMENT,
                payload: response.data.data,
            });
            dispatch(
                addToast({
                    text: response.data.message,
                    type: toastType.SUCCESS,
                })
            );
            dispatch(setLoading(false));
            if (navigate) {
                if (customerId) {
                    navigate(`/app/user/customers/${customerId}/payments`);
                } else {
                    navigate(-1);
                }
            }
        })
        .catch(({ response }) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                    type: toastType.ERROR,
                })
            );
            dispatch(setLoading(false));
        });
};

export const deleteCustomerPayment = (id) => async (dispatch) => {
    apiConfig
        .delete(`${apiBaseURL.CUSTOMER_PAYMENTS}/${id}`)
        .then(() => {
            dispatch({
                type: customerActionType.DELETE_CUSTOMER_PAYMENT,
                payload: id,
            });
            dispatch(
                addToast({
                    text: "Customer payment deleted successfully",
                    type: toastType.SUCCESS,
                })
            );
        })
        .catch((error) => {
            const msg = error?.response?.data?.message || error?.message || "Algo deu errado";
            dispatch(
                addToast({
                    text: msg,
                    type: toastType.ERROR,
                })
            );
        });
};

export const fetchCustomerPayment = (id, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true));
    }
    apiConfig
        .get(`${apiBaseURL.CUSTOMER_PAYMENTS}/${id}`)
        .then((response) => {
            dispatch({
                type: customerActionType.FETCH_CUSTOMER_PAYMENT,
                payload: response.data.data,
            });
            if (isLoading) {
                dispatch(setLoading(false));
            }
        })
        .catch((error) => {
            const errorMessage = error?.response?.data?.message || error?.message || "Algo deu errado";
            dispatch(
                addToast({
                    text: errorMessage,
                    type: toastType.ERROR,
                })
            );
            if (isLoading) {
                dispatch(setLoading(false));
            }
        });
};

export const customerPaymentPdfAction = (id) => async (dispatch) => {
    apiConfig
        .get(`${apiBaseURL.CUSTOMER_PAYMENTS}/${id}/pdf`)
        .then((response) => {
            if (response.data.data.customer_payment_pdf_url) {
                window.open(response.data.data.customer_payment_pdf_url, "_blank");
            }
            dispatch(
                addToast({
                    text: response.data.message,
                    type: toastType.SUCCESS,
                })
            );
        })
        .catch(({ response }) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                    type: toastType.ERROR,
                })
            );
        });
};

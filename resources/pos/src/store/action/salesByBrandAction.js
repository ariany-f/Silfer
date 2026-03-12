import apiConfig from '../../config/apiConfig';
import { apiBaseURL, toastType, salesByBrandActionType } from '../../constants';
import { addToast } from './toastAction';
import { setLoading } from "./loadingAction";

export const fetchSalesByBrand = () => async (dispatch) => {
    dispatch(setLoading(true));

    apiConfig.get(apiBaseURL.SALES_BY_BRAND)
        .then((response) => {
            dispatch({ type: salesByBrandActionType.SALES_BY_BRAND, payload: response.data.data });
            dispatch(setLoading(false));
        })
        .catch(({ response }) => {
            dispatch(addToast(
                { text: response?.data?.message, type: toastType.ERROR }));
            dispatch(setLoading(false));
        });
};

export const fetchSalesByBrandReport = (filter = {}, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true));
    }
    let url = apiBaseURL.SALES_BY_BRAND_REPORT;
    if (filter.start_date && filter.end_date) {
        url += `?start_date=${filter.start_date}&end_date=${filter.end_date}`;
    }
    apiConfig
        .get(url)
        .then((response) => {
            dispatch({ type: salesByBrandActionType.SALES_BY_BRAND, payload: response.data.data });
            if (isLoading) {
                dispatch(setLoading(false));
            }
        })
        .catch(({ response }) => {
            dispatch(addToast({ text: response?.data?.message, type: toastType.ERROR }));
            if (isLoading) {
                dispatch(setLoading(false));
            }
        });
};

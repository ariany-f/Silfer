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

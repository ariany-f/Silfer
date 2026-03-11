import apiConfig from '../../config/apiConfig';
import { toastType } from '../../constants';
import { addToast } from './toastAction';
import { setLoading } from './loadingAction';

export const salesItemsReportExcel = (dates, setIsLoadingItems, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true));
    }
    await apiConfig
        .get(
            `sales-items-report-excel?start_date=${dates?.start_date ?? null}&end_date=${dates?.end_date ?? null}`
        )
        .then((response) => {
            window.open(response.data.data.sales_items_excel_url, '_blank');
            setIsLoadingItems?.(false);
            if (isLoading) {
                dispatch(setLoading(false));
            }
        })
        .catch(({ response }) => {
            dispatch(addToast({ text: response?.data?.message, type: toastType.ERROR }));
            setIsLoadingItems?.(false);
            if (isLoading) {
                dispatch(setLoading(false));
            }
        });
};

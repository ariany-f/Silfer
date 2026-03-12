import apiConfig from '../../config/apiConfig';
import { apiBaseURL, toastType, nfeIoActionType } from '../../constants';
import { getFormattedMessage } from '../../shared/sharedMethod';
import { addToast } from './toastAction';

export const fetchNfeConfig = () => async (dispatch) => {
    await apiConfig.get(apiBaseURL.NFE_IO_CONFIG)
        .then((response) => {
            dispatch({ type: nfeIoActionType.FETCH_NFE_CONFIG, payload: response.data.data });
        })
        .catch(({ response }) => {
            dispatch(addToast({ text: response?.data?.message || 'Erro ao carregar configuração NFe.io', type: toastType.ERROR }));
        });
};

export const updateNfeConfig = (data) => async (dispatch) => {
    await apiConfig.post(apiBaseURL.NFE_IO_CONFIG, data)
        .then(() => {
            dispatch(fetchNfeConfig());
            dispatch(addToast({ text: getFormattedMessage('messages.success.nfe_config_updated') || 'Configuração NFe.io atualizada.', type: toastType.ADD_TOAST }));
        })
        .catch(({ response }) => {
            dispatch(addToast({ text: response?.data?.message || 'Erro ao salvar', type: toastType.ERROR }));
        });
};

export const fetchNfeInvoices = (page = 1) => async (dispatch) => {
    await apiConfig.get(`${apiBaseURL.NFE_IO_INVOICES}?per_page=15&page=${page}`)
        .then((response) => {
            dispatch({ type: nfeIoActionType.FETCH_NFE_INVOICES, payload: response.data.data });
        })
        .catch(({ response }) => {
            dispatch(addToast({ text: response?.data?.message || 'Erro ao carregar notas', type: toastType.ERROR }));
        });
};

export const generateSaleInvoice = (saleId) => async (dispatch) => {
    return apiConfig.post(`/sales/${saleId}/generate-invoice`)
        .then((response) => {
            dispatch(addToast({ text: response.data.data?.message || 'Nota enfileirada.', type: toastType.ADD_TOAST }));
            return response.data.data;
        })
        .catch(({ response }) => {
            const msg = response?.data?.message || 'Erro ao gerar nota';
            dispatch(addToast({ text: msg, type: toastType.ERROR }));
            throw new Error(msg);
        });
};

export const syncSaleInvoiceStatus = (invoiceId) => async (dispatch) => {
    await apiConfig.post(`/nfe-io/invoices/${invoiceId}/sync`)
        .then(() => {
            dispatch(addToast({ text: getFormattedMessage('messages.success.status_updated') || 'Status atualizado.', type: toastType.ADD_TOAST }));
            dispatch(fetchNfeInvoices());
        })
        .catch(({ response }) => {
            dispatch(addToast({ text: response?.data?.message || 'Erro ao sincronizar', type: toastType.ERROR }));
        });
};

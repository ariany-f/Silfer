import { nfeIoActionType } from '../../constants';

const initialState = {
    config: {},
    invoices: { data: [], total: 0, current_page: 1, per_page: 15 },
};

export default (state = initialState, action) => {
    switch (action.type) {
        case nfeIoActionType.FETCH_NFE_CONFIG:
            return { ...state, config: action.payload };
        case nfeIoActionType.UPDATE_NFE_CONFIG:
            return { ...state, config: action.payload };
        case nfeIoActionType.FETCH_NFE_INVOICES:
            return { ...state, invoices: action.payload };
        default:
            return state;
    }
};

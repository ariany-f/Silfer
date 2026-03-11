import { salesByBrandActionType } from '../../constants';

export default (state = [], action) => {
    switch (action.type) {
        case salesByBrandActionType.SALES_BY_BRAND:
            return action.payload;
        default:
            return state;
    }
};

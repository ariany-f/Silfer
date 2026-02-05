import { customerActionType } from '../../constants';

const customerPaymentReducer = (state = [], action) => {
    switch (action.type) {
        case customerActionType.FETCH_CUSTOMER_PAYMENTS:
            return action.payload;
        case customerActionType.ADD_CUSTOMER_PAYMENT:
            return [...state, action.payload];
        case customerActionType.EDIT_CUSTOMER_PAYMENT:
            return state.map((payment) =>
                payment.id === action.payload.id ? action.payload : payment
            );
        case customerActionType.DELETE_CUSTOMER_PAYMENT:
            return state.filter((payment) => payment.id !== action.payload);
        default:
            return state;
    }
};

export default customerPaymentReducer;

export const singleCustomerPaymentReducer = (state = [], action) => {
    switch (action.type) {
        case customerActionType.FETCH_CUSTOMER_PAYMENT:
            return action.payload ? [action.payload] : [];
        default:
            return state;
    }
};

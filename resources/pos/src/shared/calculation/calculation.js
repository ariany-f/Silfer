import { parseLocalizedNumber as N } from "../numberLocale";

export const subTotalCount = (cartItem) => {
    const totalAmount = taxAmount(cartItem) + amountBeforeTax(cartItem);
    return Number(N(totalAmount) * N(cartItem.quantity)).toFixed(2);
};

export const discountAmount = (cartItem) => {
    if (cartItem.discount_type === "1" || cartItem.discount_type === 1) {
        return (N(cartItem.fix_net_unit) / 100) * N(cartItem.discount_value);
    }
    if (cartItem.discount_type === "2" || cartItem.discount_type === 2) {
        return N(cartItem.discount_value);
    }
    return N(cartItem.discount_amount);
};

export const discountAmountMultiply = (cartItem) => {
    const discountMultiply = discountAmount(cartItem);
    return (N(discountMultiply) * N(cartItem.quantity)).toFixed(2);
};

export const taxAmount = (cartItem) => {
    if (cartItem.tax_type === "2" || cartItem.tax_type === 2) {
        return (
            ((N(cartItem.fix_net_unit) - discountAmount(cartItem)) *
                N(cartItem.tax_value)) /
            (100 + N(cartItem.tax_value))
        );
    }
    if (cartItem.tax_type === "1" || cartItem.tax_type === 1) {
        return (
            ((N(cartItem.fix_net_unit) - discountAmount(cartItem)) *
                N(cartItem.tax_value)) /
            100
        );
    }

    return N(cartItem.tax_amount);
};

export const taxAmountMultiply = (cartItem) => {
    const taxMultiply = taxAmount(cartItem);
    return (N(taxMultiply) * N(cartItem.quantity)).toFixed(2);
};

export const amountBeforeTax = (cartItem) => {
    const price = N(cartItem.fix_net_unit);
    const unitCost = N(price) - discountAmount(cartItem);
    const inclusiveTax = N(unitCost) - taxAmount(cartItem);
    const finalCalPrice =
        cartItem.tax_type === "1" || cartItem.tax_type === 1
            ? N(unitCost)
            : N(inclusiveTax);
    return Number(finalCalPrice.toFixed(2));
};

//Grand Total Calculation
export const calculateCartTotalTaxAmount = (carts, inputValue) => {
    const taxValue = inputValue && N(inputValue.tax_rate);
    let totalTax = 0;
    let price = 0;

    carts.forEach((cartItem) => {
        if (taxValue > 0) {
            price = price + N(cartItem.sub_total);
            totalTax =
                (((price - N(inputValue.discount)) / 100) * taxValue) *
                N(cartItem.quantity);
        }
    });

    return N(totalTax).toFixed(2);
};

export const calculateSubTotal = (carts) => {
    let subTotalAmount = 0;
    carts.forEach((cartItem) => {
        subTotalAmount = subTotalAmount + Number(subTotalCount(cartItem));
    });
    return subTotalAmount;
};

export const calculateCartTotalAmount = (carts, inputValue) => {
    const value = inputValue && inputValue;
    const totalAmountAfterDiscount =
        calculateSubTotal(carts) - N(value.discount);
    const taxCal = (
        (totalAmountAfterDiscount * N(inputValue.tax_rate)) /
        100
    ).toFixed(2);
    const finalTotalAmount =
        Number(totalAmountAfterDiscount) +
        Number(taxCal) +
        N(value.shipping);
    return N(finalTotalAmount).toFixed(2);
};

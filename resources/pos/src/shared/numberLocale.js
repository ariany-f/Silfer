/**
 * Separador decimal configurável (definições da loja).
 * Sincronizado a partir de MasterLayout / PosMainPage.
 */

let activeDecimalSeparator = ".";

export function syncDecimalSeparatorFromSettings(sources = {}) {
    const { allConfigData, frontSetting } = sources;
    const raw =
        allConfigData?.decimal_separator ??
        frontSetting?.value?.decimal_separator;
    activeDecimalSeparator = raw === "," ? "," : ".";
}

export function getActiveDecimalSeparator() {
    return activeDecimalSeparator;
}

export function getThousandsSeparatorForDisplay(decimalSeparator) {
    const dec = decimalSeparator === "," ? "," : ".";
    return dec === "," ? "." : ",";
}

/**
 * Formata número para exibição (moeda / tabelas).
 */
export function formatDecimalDisplay(value, decimalSeparator, decimals = 2) {
    const dec = decimalSeparator === "," ? "," : ".";
    const thou = getThousandsSeparatorForDisplay(dec);
    const n =
        typeof value === "number" && !Number.isNaN(value)
            ? value
            : parseLocalizedNumber(value);
    const safe = Number.isNaN(n) ? 0 : n;
    const fixed = safe.toFixed(decimals);
    const [intPart, frac] = fixed.split(".");
    const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thou);
    return frac !== undefined ? `${withThousands}${dec}${frac}` : withThousands;
}

/**
 * Interpreta valor digitado (formulário / carrinho).
 */
export function parseLocalizedNumber(value) {
    if (value === null || value === undefined || value === "") {
        return 0;
    }
    if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
    }
    let s = String(value).trim().replace(/\s/g, "");
    if (!s) {
        return 0;
    }
    const dec = getActiveDecimalSeparator();
    if (dec === ",") {
        s = s.replace(/\./g, "").replace(",", ".");
    } else {
        s = s.replace(/,/g, "");
    }
    const num = parseFloat(s);
    return Number.isNaN(num) ? 0 : num;
}

/** Normaliza string numérica para envio à API (ponto decimal). */
export function toApiNumericString(value) {
    if (value === null || value === undefined || value === "") {
        return value;
    }
    const n = parseLocalizedNumber(value);
    if (Number.isNaN(n)) {
        return String(value);
    }
    return String(n);
}

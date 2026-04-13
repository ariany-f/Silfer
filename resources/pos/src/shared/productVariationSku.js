/**
 * Extrai componente de medida do nome do produto (mesma regra do backend / duplicação).
 * Ex.: "TURBOFIOS 10.0MM (50M)" -> "50M 10.0MM"; "CONDUCELL 1.5MM" -> "1.5MM"
 */
export function extractVariationMeasureComponent(productName) {
    if (productName == null || String(productName).trim() === "") {
        return null;
    }

    const normalizedName = String(productName).toUpperCase();
    const mmMatch = normalizedName.match(/(\d+(?:[.,]\d+)?)\s*MM\b/u);
    if (!mmMatch) {
        return null;
    }

    const measure = String(mmMatch[1]).replace(",", ".") + "MM";
    let meter = null;
    const meterMatch = normalizedName.match(
        /\(?\s*(\d+(?:[.,]\d+)?)\s*M\s*\)?(?!M)/u
    );
    if (meterMatch) {
        meter = String(meterMatch[1]).replace(",", ".") + "M";
    }

    return meter ? `${meter} ${measure}` : measure;
}

/**
 * Gera SKU sugerido por linha: VALOR_VARIACAO + medida + índice.0
 * Índice reinicia em 1 para cada prefixo (mesmo valor + mesma medida), na ordem das linhas.
 */
export function applyVariationSkuSuggestions(rows, productName) {
    if (!rows?.length) {
        return [];
    }

    const component = extractVariationMeasureComponent(productName);
    const out = rows.map((r) => ({ ...r }));

    if (!component) {
        return out;
    }

    const prefixToIndices = new Map();
    out.forEach((row, idx) => {
        const label = (row.variation_type || "").trim();
        if (!label) {
            return;
        }
        const prefix = `${label.toUpperCase()} ${component}`;
        if (!prefixToIndices.has(prefix)) {
            prefixToIndices.set(prefix, []);
        }
        prefixToIndices.get(prefix).push(idx);
    });

    prefixToIndices.forEach((indices) => {
        indices.forEach((rowIdx, order) => {
            const row = out[rowIdx];
            const label = (row.variation_type || "").trim();
            const prefix = `${label.toUpperCase()} ${component}`;
            const n = order + 1;
            out[rowIdx].product_variation_code = `${prefix} ${n}.0`;
        });
    });

    return out;
}

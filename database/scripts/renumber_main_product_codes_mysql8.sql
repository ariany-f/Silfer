-- =============================================================================
-- Renumera o campo `code` dos produtos principais (tabela main_products)
-- em ordem crescente de `id`: 01, 02, 03, ... (zeros à esquerda; acima de 99
-- o LPAD expande automaticamente para 3+ dígitos).
--
-- NÃO altera a tabela `products` (variações).
--
-- OBRIGATÓRIO: faça backup do banco antes de executar.
-- Ajuste @tenant_id para o tenant desejado (string: use aspas, ex.: '1').
-- Requer MySQL 8+ (ROW_NUMBER).
--
-- PASSO 1: rode só o SELECT abaixo para ver code_atual x code_novo.
-- PASSO 2: depois rode o UPDATE (comente ou remova o SELECT se preferir).
-- =============================================================================

SET @tenant_id = 1;

-- Pré-visualização (não altera dados)
SELECT
    mp.id,
    mp.name,
    mp.code AS code_atual,
    LPAD(
        ranked.seq,
        GREATEST(2, LENGTH(CAST(ranked.seq AS CHAR))),
        '0'
    ) AS code_novo
FROM main_products mp
INNER JOIN (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY id) AS seq
    FROM main_products
    WHERE tenant_id = @tenant_id
) AS ranked ON mp.id = ranked.id
WHERE mp.tenant_id = @tenant_id
ORDER BY mp.id;

/*
UPDATE main_products mp
INNER JOIN (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY id) AS seq
    FROM main_products
    WHERE tenant_id = @tenant_id
) AS ranked ON mp.id = ranked.id
SET mp.code = LPAD(
    ranked.seq,
    GREATEST(2, LENGTH(CAST(ranked.seq AS CHAR))),
    '0'
)
WHERE mp.tenant_id = @tenant_id;
*/

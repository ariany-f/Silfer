<?php

namespace App\Support;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class VariationSku
{
    public static function extractMeasureComponent(?string $productName): ?string
    {
        if (empty($productName)) {
            return null;
        }

        $normalizedName = Str::upper($productName);

        if (! preg_match('/(\d+(?:[.,]\d+)?)\s*MM\b/u', $normalizedName, $measureMatch)) {
            return null;
        }

        $measure = str_replace(',', '.', $measureMatch[1]) . 'MM';
        $meter = null;

        if (preg_match('/\(?\s*(\d+(?:[.,]\d+)?)\s*M\s*\)?(?!M)/u', $normalizedName, $meterMatch)) {
            $meter = str_replace(',', '.', $meterMatch[1]) . 'M';
        }

        return $meter ? $meter . ' ' . $measure : $measure;
    }

    /**
     * Maior índice N em códigos no formato "{prefix} N.0" já gravados no banco.
     */
    public static function maxIndexForPrefix(Builder $productQuery, string $prefix): int
    {
        $pattern = '/^' . preg_quote($prefix, '/') . '\s+(\d+)\.0$/u';
        $maxIndex = 0;

        $codes = (clone $productQuery)
            ->where('code', 'like', $prefix . ' %.0')
            ->pluck('code');

        foreach ($codes as $code) {
            if (preg_match($pattern, (string) $code, $matches)) {
                $maxIndex = max($maxIndex, (int) $matches[1]);
            }
        }

        return $maxIndex;
    }

    public static function baseProductQuery(?int $brandId): Builder
    {
        $q = Product::query();
        if ($brandId !== null) {
            $q->where('brand_id', $brandId);
        }

        return $q;
    }

    /**
     * @param  array<int, string|null>  $variationTypeLabels  ordem das linhas do formulário
     * @return array{0: array<int, string>, 1: string|null} [codes, component]
     */
    public static function nextCodesForLabels(string $productName, array $variationTypeLabels, ?int $brandId = null): array
    {
        $component = self::extractMeasureComponent($productName);
        $codes = [];
        if ($component === null) {
            foreach ($variationTypeLabels as $_) {
                $codes[] = '';
            }

            return [$codes, null];
        }

        $query = self::baseProductQuery($brandId);
        $nextByPrefix = [];

        foreach ($variationTypeLabels as $rawLabel) {
            $label = trim((string) $rawLabel);
            if ($label === '') {
                $codes[] = '';

                continue;
            }

            $prefix = Str::upper($label) . ' ' . $component;
            if (! array_key_exists($prefix, $nextByPrefix)) {
                $nextByPrefix[$prefix] = self::maxIndexForPrefix($query, $prefix) + 1;
            }

            $n = $nextByPrefix[$prefix];
            $codes[] = $prefix . ' ' . $n . '.0';
            $nextByPrefix[$prefix]++;
        }

        return [$codes, $component];
    }
}

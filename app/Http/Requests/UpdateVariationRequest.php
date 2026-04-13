<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateVariationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $variation = $this->route('variation');
        $variationId = is_object($variation) ? $variation->getKey() : $variation;

        return [
            'name' => 'required|unique:variations,name,' . $variationId . ',id,tenant_id,' . Auth::user()->tenant_id,
        ];
    }
}

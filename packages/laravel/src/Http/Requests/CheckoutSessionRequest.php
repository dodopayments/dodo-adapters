<?php

namespace Dodopayments\Laravel\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Recommended sessions flow
            'product_cart' => ['required', 'array', 'min:1'],
            'product_cart.*.product_id' => ['required', 'string'],
            'product_cart.*.quantity' => ['required', 'integer', 'min:1'],

            // Optional
            'return_url' => ['nullable', 'url'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}

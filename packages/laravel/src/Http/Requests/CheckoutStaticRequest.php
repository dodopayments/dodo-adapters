<?php

namespace Dodopayments\Laravel\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutStaticRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'productId' => ['required', 'string'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            // Optional customer fields
            'fullName' => ['nullable', 'string'],
            'firstName' => ['nullable', 'string'],
            'lastName' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
            'country' => ['nullable', 'string', 'size:2'],
            'addressLine' => ['nullable', 'string'],
            'city' => ['nullable', 'string'],
            'state' => ['nullable', 'string'],
            'zipCode' => ['nullable', 'string'],
            // Advanced controls
            'paymentCurrency' => ['nullable', 'string'],
            'showCurrencySelector' => ['nullable', 'boolean'],
            'paymentAmount' => ['nullable', 'numeric', 'min:0'],
            'showDiscounts' => ['nullable', 'boolean'],
        ];
    }
}

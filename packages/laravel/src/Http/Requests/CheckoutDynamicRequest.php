<?php

namespace Dodopayments\Laravel\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutDynamicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // One-time or subscription parameters as JSON body
            'productId' => ['nullable', 'string'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'paymentCurrency' => ['nullable', 'string'],
            'paymentAmount' => ['nullable', 'numeric', 'min:0'],
            // Optional sessions-style cart to use checkout sessions in dynamic flow
            'product_cart' => ['sometimes', 'array', 'min:1'],
            'product_cart.*.product_id' => ['required_with:product_cart', 'string'],
            'product_cart.*.quantity' => ['required_with:product_cart', 'integer', 'min:1'],
            // Session-specific or dynamic fields can be validated here as needed
            // 'subscription_plan_id' => ['nullable', 'string'],
            // 'trial_days' => ['nullable', 'integer', 'min:0'],
        ];
    }
}

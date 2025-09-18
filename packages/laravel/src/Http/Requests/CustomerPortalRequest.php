<?php

namespace Dodopayments\Laravel\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerPortalRequest extends FormRequest
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
            'customer_id' => ['required', 'string'],
            'send_email' => ['nullable', 'boolean'],
        ];
    }
}

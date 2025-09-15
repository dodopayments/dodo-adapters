# Laravel Basic Example - Dodo Payments Adapter (Blueprint)

This is a blueprint example demonstrating how the `dodopayments/laravel` adapter would be used in a Laravel app.

> Note: This monorepo is JavaScript/Turborepo oriented. The full runnable example should live in a dedicated PHP repo or a separate example repository. This folder serves as documentation and quick-start guidance.

## Prerequisites

- PHP 8.1+
- Composer
- Laravel 10 or 11

## Install

```bash
composer require dodopayments/laravel
composer require dodopayments/client ^1.53.3
composer require standard-webhooks/standard-webhooks ^1.0

php artisan vendor:publish --tag=dodo-config
```

## Environment

Add to your `.env`:

```
DODO_PAYMENTS_API_KEY=your_api_key
DODO_PAYMENTS_WEBHOOK_SECRET=whsec_xxx
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_RETURN_URL=http://localhost/success
```

## Routes

```php
// routes/api.php
Route::prefix(config('dodo.route_prefix', 'api/dodo'))->group(function () {
    Route::get('/checkout', [\Dodopayments\Laravel\Http\Controllers\CheckoutController::class, 'static']);
    Route::post('/checkout', [\Dodopayments\Laravel\Http\Controllers\CheckoutController::class, 'dynamic']);
    Route::post('/checkout/session', [\Dodopayments\Laravel\Http\Controllers\CheckoutController::class, 'session']);

    Route::get('/customer-portal', [\Dodopayments\Laravel\Http\Controllers\CustomerPortalController::class, 'show']);

    Route::post('/webhook', [\Dodopayments\Laravel\Http\Controllers\WebhookController::class, 'handle'])
        ->middleware('dodo.webhook');
});
```

## Testing webhooks locally

- Use ngrok to expose your local server: `ngrok http http://localhost:8000`
- Set the public URL in your Dodo Payments dashboard webhook settings to `/api/dodo/webhook`
- Ensure `DODO_PAYMENTS_WEBHOOK_SECRET` matches the secret in your dashboard

## Postman collection

A sample Postman collection is included in `postman.collection.json` to hit the checkout, portal, and webhook endpoints.

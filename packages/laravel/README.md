# `@dodopayments/laravel` (Blueprint)

This directory documents the design and intended API for a first‑class Laravel adapter for Dodo Payments. The actual PHP package will be published separately to Packagist as `dodopayments/laravel` and maintained in a dedicated repository.

## Goals

- Provide Laravel‑native endpoints and middleware for:
  - Checkout (static GET, dynamic POST, sessions POST)
  - Customer Portal (GET)
  - Webhooks (POST with signature verification)
- Offer clear configuration, events/listeners, validation, and robust error handling.

## Installation (planned)

```bash
# Add the Laravel adapter (published separately in its own repo)
composer require dodopayments/laravel

# Required runtime dependencies
composer require dodopayments/client ^1.53.3
composer require standard-webhooks/standard-webhooks ^1.0

# Publish config
php artisan vendor:publish --tag=dodo-config
```

.env keys:

```
DODO_PAYMENTS_API_KEY=...
DODO_PAYMENTS_WEBHOOK_SECRET=...
DODO_PAYMENTS_ENVIRONMENT=test_mode # or live_mode
DODO_PAYMENTS_RETURN_URL=https://example.com/success
```

> Tip: `DODO_PAYMENTS_ENVIRONMENT` can be `test_mode` (default) or `live_mode`.

## Routes (example)

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

### Controller usage

```php
// app/Http/Controllers/DemoCheckoutController.php (example if you wire your own)
use Dodopayments\Laravel\Http\Requests\CheckoutSessionRequest;
use Dodopayments\Laravel\Support\Client;

class DemoCheckoutController {
    public function __construct(private Client $client) {}

    public function session(CheckoutSessionRequest $request) {
        $data = $request->validated();
        $returnUrl = $data['return_url'] ?? config('dodo.return_url');
        $resp = $this->client->createCheckoutSession($data + ['return_url' => $returnUrl]);
        return response()->json($resp);
    }
}
```

## Webhook verification

- Middleware: `VerifyDodoWebhook`
  - Reads raw request body and signature headers
  - Verifies using Standard Webhooks with `DODO_PAYMENTS_WEBHOOK_SECRET`
  - On success: attaches parsed payload to the request attributes
  - On failure: aborts with 401 JSON error

Example listener registration:

```php
// app/Providers/EventServiceProvider.php
use Dodopayments\\Laravel\\Support\\Events\\PaymentSucceeded;

protected $listen = [
    PaymentSucceeded::class => [
        \App\Listeners\OnPaymentSucceeded::class,
    ],
];
```

## Events mapping (subset)

- PaymentSucceeded, PaymentFailed, PaymentProcessing, PaymentCancelled
- RefundSucceeded, RefundFailed
- DisputeOpened, DisputeExpired, DisputeAccepted, DisputeCancelled, DisputeChallenged, DisputeWon, DisputeLost
- SubscriptionActive, SubscriptionOnHold, SubscriptionRenewed, SubscriptionPaused, SubscriptionPlanChanged, SubscriptionCancelled, SubscriptionFailed, SubscriptionExpired
- LicenseKeyCreated

Consumers register listeners via Laravel's `EventServiceProvider`.

## Controllers (high level)

- `CheckoutController`
  - `static()` GET: validates `productId` and optional params; returns `{ checkout_url }`
  - `dynamic()` POST: validates body; creates payment/subscription; returns `{ checkout_url }`
  - `session()` POST: validates body with `product_cart`; returns `{ checkout_url }`
- `CustomerPortalController@show()` GET: validates `customer_id` and `send_email`; returns JSON portal URL (or redirect pattern, configurable)
- `WebhookController@handle()` POST: dispatches events based on payload type

## Config (publishable)

```php
return [
    'api_key' => env('DODO_PAYMENTS_API_KEY'),
    'webhook_secret' => env('DODO_PAYMENTS_WEBHOOK_SECRET'),
    'environment' => env('DODO_PAYMENTS_ENVIRONMENT', 'test_mode'),
    'return_url' => env('DODO_PAYMENTS_RETURN_URL'),
    'route_prefix' => 'api/dodo',
];
```

## Package structure (planned)

```
src/
  Providers/DodoServiceProvider.php
  Http/Controllers/{CheckoutController.php, CustomerPortalController.php, WebhookController.php}
  Http/Middleware/VerifyDodoWebhook.php
  Http/Requests/{CheckoutStaticRequest.php, CheckoutDynamicRequest.php, CheckoutSessionRequest.php, CustomerPortalRequest.php}
  Support/{Client.php, Events/*, Listeners/*, Exceptions/*}
  Facades/Dodo.php
config/dodo.php
routes/api.php
```

## Dependencies

- Runtime: `dodopayments/client`, `standard-webhooks/standard-webhooks`
- Dev: `orchestra/testbench`, `phpunit/phpunit`, `larastan/phpstan`, `laravel/pint`

## Example Usage

### Basic Setup

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

### Testing Webhooks Locally

- Use ngrok to expose your local server: `ngrok http http://localhost:8000`
- Set the public URL in your Dodo Payments dashboard webhook settings to `/api/dodo/webhook`
- Ensure `DODO_PAYMENTS_WEBHOOK_SECRET` matches the secret in your dashboard

### Postman Collection

A sample Postman collection is available to test the checkout, portal, and webhook endpoints.

## Roadmap

- v0.1.0: Public beta (Checkout, Portal, Webhooks + Events)
- v0.2.x: More examples, advanced validation, typed payload classes
- v1.0.0: Stable API and docs

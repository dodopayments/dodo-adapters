<?php

return [
    'api_key' => env('DODO_PAYMENTS_API_KEY', 'test_api_key'),

    'webhook_secret' => env('DODO_PAYMENTS_WEBHOOK_SECRET', null),

    // "test_mode" or "live_mode"
    'environment' => env('DODO_PAYMENTS_ENVIRONMENT', 'test_mode'),

    // Optional default return URL for successful checkout
    'return_url' => env('DODO_PAYMENTS_RETURN_URL', 'http://localhost/success'),

    // API route prefix, e.g. /api/dodo
    'route_prefix' => env('DODO_PAYMENTS_ROUTE_PREFIX', 'api/dodo'),

    // Control whether adapter maps domain exceptions to JSON 4xx automatically
    'map_exceptions' => env('DODO_PAYMENTS_MAP_EXCEPTIONS', true),

    // When true, the adapter will not make outbound SDK calls and will return placeholder URLs.
    'offline' => env('DODO_PAYMENTS_OFFLINE', false),
];

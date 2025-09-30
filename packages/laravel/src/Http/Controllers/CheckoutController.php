<?php

namespace Dodopayments\Laravel\Http\Controllers;

use Dodopayments\Laravel\Http\Requests\CheckoutDynamicRequest;
use Dodopayments\Laravel\Http\Requests\CheckoutSessionRequest;
use Dodopayments\Laravel\Http\Requests\CheckoutStaticRequest;
use Dodopayments\Laravel\Support\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class CheckoutController extends Controller
{
    public function __construct(private Client $client) {}

    // GET /checkout (static)
    public function static(CheckoutStaticRequest $request): JsonResponse
    {
        /** @var array{productId:string,quantity?:int,return_url?:string} $validated */
        $validated = $request->validated();
        $returnUrl = $validated['return_url'] ?? config('dodo.return_url');

        $result = $this->client->createStaticCheckout($validated + ['return_url' => $returnUrl]);

        return response()->json([
            'checkout_url' => $result['checkout_url'],
            'return_url' => $returnUrl,
        ]);

    }

    // POST /checkout (dynamic)
    public function dynamic(CheckoutDynamicRequest $request): JsonResponse
    {
        /** @var array<string,mixed> $validated */
        $validated = $request->validated();
        $returnUrl = $validated['return_url'] ?? config('dodo.return_url');

        $result = $this->client->createDynamicCheckout($validated + ['return_url' => $returnUrl]);

        return response()->json([
            'checkout_url' => $result['checkout_url'],
            'return_url' => $returnUrl,
        ]);

    }

    // POST /checkout/session (recommended sessions flow)
    public function session(CheckoutSessionRequest $request): JsonResponse
    {
        /** @var array{product_cart:array<array{product_id:string,quantity:int}>,return_url?:string,metadata?:array<string,mixed>} $validated */
        $validated = $request->validated();
        $returnUrl = $validated['return_url'] ?? config('dodo.return_url');

        $result = $this->client->createCheckoutSession($validated + ['return_url' => $returnUrl]);

        return response()->json([
            'checkout_url' => $result['checkout_url'],
            'return_url' => $returnUrl,
        ]);

    }
}

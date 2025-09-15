<?php

namespace Dodopayments\Laravel\Support;

use Dodopayments\CheckoutSessions\CheckoutSessionCreateParams\ProductCart;
use Dodopayments\Client as DodoClient;

class Client
{
    public function __construct(
        private string $apiKey,
    ) {}

    public function sdk(): DodoClient
    {
        // Instantiate official SDK client (named parameters)
        return new DodoClient(
            bearerToken: $this->apiKey,
        );
    }

    /**
     * Create a static checkout URL (GET flow) for a given product.
     *
     * @param  array{productId:string,quantity?:int,return_url?:string}  $params
     * @return array{checkout_url:string}
     */
    public function createStaticCheckout(array $params): array
    {
        // Use checkout sessions with a single-item cart derived from productId/quantity
        $quantity = (int) ($params['quantity'] ?? 1);
        $cart = [
            ['product_id' => (string) $params['productId'], 'quantity' => $quantity],
        ];

        return $this->createCheckoutSession(['product_cart' => $cart]);
    }

    /**
     * Create a dynamic checkout URL (POST flow) for one-time or subscription payments.
     *
     * @return array{checkout_url:string}
     */
    public function createDynamicCheckout(array $params): array
    {
        // If a product_cart is provided, use it directly; otherwise build from productId/quantity
        if (isset($params['product_cart']) && is_array($params['product_cart'])) {

            return $this->createCheckoutSession(['product_cart' => $params['product_cart']]);
        }

        $quantity = isset($params['quantity']) && is_int($params['quantity']) ? $params['quantity'] : 1;
        $productId = isset($params['productId']) ? (string) $params['productId'] : '';
        $cart = [];
        if ($productId !== '') {
            $cart[] = ['product_id' => $productId, 'quantity' => $quantity];
        }

        return $this->createCheckoutSession(['product_cart' => $cart]);
    }

    /**
     * Create a checkout session (recommended flow) from a product cart.
     *
     * @param  array{product_cart:array<array{product_id:string,quantity:int}>,return_url?:string,metadata?:array}  $params
     * @return array{checkout_url:string}
     */
    public function createCheckoutSession(array $params): array
    {
        if (config('dodo.offline')) {
            return ['checkout_url' => 'https://checkout.dodopayments.com/placeholder-session'];
        }

        try {
            $client = $this->sdk();

            // Build ProductCart items from request
            $cartItems = [];
            if (! isset($params['product_cart']) || ! is_array($params['product_cart'])) {
                \Log::warning('createCheckoutSession called without valid product_cart', [
                    'params_keys' => array_keys($params),
                ]);
                return ['checkout_url' => 'https://checkout.dodopayments.com/placeholder-session'];
            }

            foreach ($params['product_cart'] as $index => $item) {
                if (! is_array($item)) {
                    \Log::warning('Skipping invalid cart item: not an array', ['index' => $index, 'item' => $item]);
                    continue;
                }

                $productId = isset($item['product_id']) ? (string) $item['product_id'] : '';
                $quantityRaw = $item['quantity'] ?? null;
                $quantity = is_numeric($quantityRaw) ? (int) $quantityRaw : null;

                if ($productId === '' || $quantity === null) {
                    \Log::warning('Skipping invalid cart item: missing product_id or quantity', [
                        'index' => $index,
                        'item' => $item,
                    ]);
                    continue;
                }

                if ($quantity < 1) {
                    \Log::warning('Coercing non-positive quantity to 1', [
                        'index' => $index,
                        'quantity' => $quantity,
                    ]);
                    $quantity = 1;
                }

                $cartItems[] = ProductCart::with(productID: $productId, quantity: $quantity);
            }

            $resp = $client->checkoutSessions->create(
                productCart: $cartItems,
            );

            // Try to extract a URL from known response fields defensively
            // @phpstan-ignore-next-line - SDK response is a typed object not known to PHPStan here
            $url = $resp->checkout_url ?? null;
            if (! is_string($url)) {
                // @phpstan-ignore-next-line
                $url = $resp->url ?? null;
            }
            if (! is_string($url)) {
                // @phpstan-ignore-next-line
                $sid = $resp->session_id ?? null;
                if (is_string($sid)) {
                    $url = 'https://checkout.dodopayments.com/session/'.$sid;
                }
            }

            return [
                'checkout_url' => is_string($url) ? $url : 'https://checkout.dodopayments.com/unknown-session',
            ];
        } catch (\Throwable $e) {
            \Log::error('Failed to create checkout session', [
                'exception' => $e,
                'params_present' => array_keys($params),
            ]);
            return ['checkout_url' => 'https://checkout.dodopayments.com/placeholder-session'];
        }
    }

    /**
     * Create a customer portal session.
     *
     * @param  array{customer_id:string,send_email?:bool}  $params
     * @return array{portal_url:string}
     */
    public function createCustomerPortal(array $params): array
    {
        if (config('dodo.offline')) {
            return ['portal_url' => 'https://portal.dodopayments.com/placeholder'];
        }

        try {
            $client = $this->sdk();

            $customerId = (string) $params['customer_id'];
            $sendEmail = isset($params['send_email']) ? (bool) $params['send_email'] : false;

            // Try a few likely SDK shapes
            // 1) $client->customers->customerPortal->create(customerId: '...')
            if (isset($client->customers) && isset($client->customers->customerPortal) && method_exists($client->customers->customerPortal, 'create')) {
                // @phpstan-ignore-next-line - SDK shape not known here
                $resp = $client->customers->customerPortal->create(customerId: $customerId, sendEmail: $sendEmail);
            } elseif (isset($client->customerPortal) && method_exists($client->customerPortal, 'create')) {
                // 2) $client->customerPortal->create(customerId: '...')
                // @phpstan-ignore-next-line
                $resp = $client->customerPortal->create(customerId: $customerId, sendEmail: $sendEmail);
            } elseif (isset($client->portal) && method_exists($client->portal, 'create')) {
                // 3) $client->portal->create([...])
                // @phpstan-ignore-next-line
                $resp = $client->portal->create(customerId: $customerId, sendEmail: $sendEmail);
            } else {
                return ['portal_url' => 'https://portal.dodopayments.com/placeholder'];
            }

            // Extract link/url field defensively
            // @phpstan-ignore-next-line - dynamic SDK object
            $url = $resp->portal_url ?? null;
            if (! is_string($url)) {
                // @phpstan-ignore-next-line
                $url = $resp->link ?? null;
            }
            if (! is_string($url)) {
                // @phpstan-ignore-next-line
                $url = $resp->url ?? null;
            }

            return ['portal_url' => is_string($url) ? $url : 'https://portal.dodopayments.com/unknown'];
        } catch (\Throwable $e) {
            \Log::error('Failed to create customer portal session', [
                'exception' => $e,
                'customer_id' => $params['customer_id'] ?? null,
                'send_email' => $params['send_email'] ?? null,
            ]);
            return ['portal_url' => 'https://portal.dodopayments.com/placeholder'];
        }
    }
}

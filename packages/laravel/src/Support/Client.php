<?php

namespace Dodopayments\Laravel\Support;

use Dodopayments\CheckoutSessions\CheckoutSessionCreateParams\ProductCart;
use Dodopayments\Client as DodoClient;
use Dodopayments\Laravel\Support\Exceptions\CheckoutUnavailableException;
use Dodopayments\Laravel\Support\Exceptions\InvalidProductCartException;

class Client
{
    public function __construct(
        private string $apiKey,
    ) {}

    public function sdk(): DodoClient
    {
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
        if (isset($params['product_cart']) && is_array($params['product_cart'])) {
            return $this->createCheckoutSession(['product_cart' => $params['product_cart']]);
        }

        $quantity = (int) ($params['quantity'] ?? 1);
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
        if (! isset($params['product_cart']) || ! is_array($params['product_cart']) || count($params['product_cart']) === 0) {
            throw new InvalidProductCartException('product_cart must be a non-empty array of {product_id, quantity}.');
        }

        if (config('dodo.offline')) {
            throw new CheckoutUnavailableException('Checkout session creation is unavailable in offline mode.');
        }

        try {
            $client = $this->sdk();

            $cartItems = [];
            foreach ($params['product_cart'] as $item) {
                $cartItems[] = ProductCart::with(productID: $item['product_id'], quantity: $item['quantity']);
            }

            $resp = $client->checkoutSessions->create(productCart: $cartItems);

            // Try to extract a URL from known response fields defensively
            // @phpstan-ignore-next-line - SDK response is dynamic here
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

            if (! is_string($url)) {
                throw new CheckoutUnavailableException('SDK response did not include a checkout URL.');
            }

            return ['checkout_url' => $url];
        } catch (\Throwable $e) {
            throw new CheckoutUnavailableException('Failed to create checkout session.', previous: $e);
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
            throw new CheckoutUnavailableException('Customer portal creation is unavailable in offline mode.');
        }

        try {
            $client = $this->sdk();

            $customerId = (string) $params['customer_id'];
            $sendEmail = isset($params['send_email']) ? (bool) $params['send_email'] : false;

            // Try a few likely SDK shapes
            if (isset($client->customers) && isset($client->customers->customerPortal) && method_exists($client->customers->customerPortal, 'create')) {
                // @phpstan-ignore-next-line - SDK shape not known here
                $resp = $client->customers->customerPortal->create(customerId: $customerId, sendEmail: $sendEmail);
            } elseif (isset($client->customerPortal) && method_exists($client->customerPortal, 'create')) {
                // @phpstan-ignore-next-line
                $resp = $client->customerPortal->create(customerId: $customerId, sendEmail: $sendEmail);
            } elseif (isset($client->portal) && method_exists($client->portal, 'create')) {
                // @phpstan-ignore-next-line
                $resp = $client->portal->create(customerId: $customerId, sendEmail: $sendEmail);
            } else {
                throw new CheckoutUnavailableException('Customer portal API not available on SDK client.');
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

            if (! is_string($url)) {
                throw new CheckoutUnavailableException('SDK response did not include a portal URL.');
            }

            return ['portal_url' => $url];
        } catch (\Throwable $e) {
            throw new CheckoutUnavailableException('Failed to create customer portal session.', previous: $e);
        }
    }
}

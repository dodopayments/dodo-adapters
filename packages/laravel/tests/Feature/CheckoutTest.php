<?php

namespace Dodopayments\Laravel\Tests\Feature;

use Dodopayments\Laravel\Tests\TestCase;

class CheckoutTest extends TestCase
{
    public function test_static_checkout_get_returns_json_with_url(): void
    {
        $response = $this->get('/api/dodo/checkout?productId=pdt_test');

        $response->assertStatus(200)
            ->assertJsonStructure(['checkout_url', 'return_url']);
    }

    public function test_session_checkout_post_returns_json_with_url(): void
    {
        $payload = [
            'product_cart' => [
                ['product_id' => 'pdt_test', 'quantity' => 1],
            ],
        ];

        $response = $this->postJson('/api/dodo/checkout/session', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure(['checkout_url', 'return_url']);
    }
}

<?php

namespace Dodopayments\Laravel\Tests\Feature;

use Dodopayments\Laravel\Tests\TestCase;

class WebhookTest extends TestCase
{
    public function test_webhook_with_missing_signature_returns_401(): void
    {
        $payload = ['type' => 'payment.succeeded'];
        $resp = $this->post('/api/dodo/webhook', $payload, [
            // Missing real signature headers on purpose
        ]);

        $resp->assertStatus(401)
            ->assertJsonStructure(['error' => ['code', 'message']]);
    }
}

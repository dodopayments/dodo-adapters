<?php

namespace Dodopayments\Laravel\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Event;

class WebhookController extends Controller
{
    // POST /webhook (protected by dodo.webhook middleware)
    public function handle(Request $request): JsonResponse
    {
        // Retrieve payload verified by middleware
        $payload = $request->attributes->get('dodo_payload');
        if ($payload === null) {
            return response()->json([
                'error' => [
                    'code' => 'payload_missing',
                    'message' => 'Verified webhook payload is missing.',
                ],
            ], 400);
        }

        // Dispatch high-level catch-all event
        Event::dispatch(new \Dodopayments\Laravel\Support\Events\WebhookReceived($payload));

        // Dispatch specific events by type
        $type = $payload['type'] ?? null;
        if (is_string($type)) {
            $this->dispatchTypedEvent($type, $payload);
        }

        return response()->json(['ok' => true]);
    }

    protected function dispatchTypedEvent(string $type, array $payload): void
    {
        // Full mapping of supported webhook types to Laravel Events.
        $map = [
            // Payments
            'payment.succeeded' => \Dodopayments\Laravel\Support\Events\PaymentSucceeded::class,
            'payment.failed' => \Dodopayments\Laravel\Support\Events\PaymentFailed::class,
            'payment.processing' => \Dodopayments\Laravel\Support\Events\PaymentProcessing::class,
            'payment.cancelled' => \Dodopayments\Laravel\Support\Events\PaymentCancelled::class,

            // Refunds
            'refund.succeeded' => \Dodopayments\Laravel\Support\Events\RefundSucceeded::class,
            'refund.failed' => \Dodopayments\Laravel\Support\Events\RefundFailed::class,

            // Disputes
            'dispute.opened' => \Dodopayments\Laravel\Support\Events\DisputeOpened::class,
            'dispute.expired' => \Dodopayments\Laravel\Support\Events\DisputeExpired::class,
            'dispute.accepted' => \Dodopayments\Laravel\Support\Events\DisputeAccepted::class,
            'dispute.cancelled' => \Dodopayments\Laravel\Support\Events\DisputeCancelled::class,
            'dispute.challenged' => \Dodopayments\Laravel\Support\Events\DisputeChallenged::class,
            'dispute.won' => \Dodopayments\Laravel\Support\Events\DisputeWon::class,
            'dispute.lost' => \Dodopayments\Laravel\Support\Events\DisputeLost::class,

            // Subscriptions
            'subscription.active' => \Dodopayments\Laravel\Support\Events\SubscriptionActive::class,
            'subscription.on_hold' => \Dodopayments\Laravel\Support\Events\SubscriptionOnHold::class,
            'subscription.renewed' => \Dodopayments\Laravel\Support\Events\SubscriptionRenewed::class,
            'subscription.paused' => \Dodopayments\Laravel\Support\Events\SubscriptionPaused::class,
            'subscription.plan_changed' => \Dodopayments\Laravel\Support\Events\SubscriptionPlanChanged::class,
            'subscription.cancelled' => \Dodopayments\Laravel\Support\Events\SubscriptionCancelled::class,
            'subscription.failed' => \Dodopayments\Laravel\Support\Events\SubscriptionFailed::class,
            'subscription.expired' => \Dodopayments\Laravel\Support\Events\SubscriptionExpired::class,

            // License
            'license_key.created' => \Dodopayments\Laravel\Support\Events\LicenseKeyCreated::class,
        ];

        if (isset($map[$type])) {
            Event::dispatch(new $map[$type]($payload));
        }
    }
}

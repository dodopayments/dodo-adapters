<?php

namespace Dodopayments\Laravel\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyDodoWebhook
{
    public function handle(Request $request, Closure $next): Response
    {
        // NOTE: Blueprint implementation. Replace with actual Standard Webhooks verification.
        // 1) Read raw body
        $raw = $request->getContent();
        // 2) Collect headers as an associative array of comma-joined strings
        $headers = [];
        foreach ($request->headers->all() as $key => $values) {
            $headers[$key] = implode(',', $values);
        }

        $secret = (string) config('dodo.webhook_secret', '');
        if ($secret === '') {
            return response()->json([
                'error' => [
                    'code' => 'webhook_secret_missing',
                    'message' => 'Dodo webhook secret is not configured.',
                ],
            ], 500);
        }

        try {
            // Attempt to verify using Standard Webhooks PHP library if present
            if (! class_exists('StandardWebhooks\\Webhook')) {
                return response()->json([
                    'error' => [
                        'code' => 'verification_library_missing',
                        'message' => 'Standard Webhooks PHP library is not installed. Please require standard-webhooks/standard-webhooks.',
                    ],
                ], 500);
            }

            // If the library exists, perform verification
            // phpcs:ignore
            $wh = new \StandardWebhooks\Webhook($secret);
            // Some implementations expect canonical header names. Ensure the library supports raw header array input.
            $wh->verify($raw, $headers);

            // Parse JSON and attach payload for controllers
            $json = json_decode($raw, true, flags: JSON_THROW_ON_ERROR);
            $request->attributes->set('dodo_payload', $json);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => [
                    'code' => 'invalid_signature',
                    'message' => 'Webhook signature verification failed.',
                ],
            ], 401);
        }

        return $next($request);
    }
}

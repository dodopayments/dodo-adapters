<?php
declare(strict_types=1);

namespace Dodopayments\Laravel\Support\Events;

final class WebhookReceived
{
    public function __construct(
        public readonly array $payload,
    ) {}
}

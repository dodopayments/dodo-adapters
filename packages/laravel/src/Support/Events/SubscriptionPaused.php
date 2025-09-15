<?php
declare(strict_types=1);

namespace Dodopayments\Laravel\Support\Events;

final class SubscriptionPaused
{
    public function __construct(
        public readonly array $payload,
    ) {}
}

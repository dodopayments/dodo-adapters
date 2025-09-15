<?php
declare(strict_types=1);

namespace Dodopayments\Laravel\Support\Events;

final class PaymentSucceeded
{
    public function __construct(
        public readonly array $payload,
    ) {}
}

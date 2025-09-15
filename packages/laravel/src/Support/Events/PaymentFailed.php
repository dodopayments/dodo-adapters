<?php

namespace Dodopayments\Laravel\Support\Events;

class PaymentFailed
{
    public function __construct(
        public array $payload,
    ) {}
}

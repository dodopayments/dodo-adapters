<?php

namespace Dodopayments\Laravel\Support\Events;

class PaymentSucceeded
{
    public function __construct(
        public array $payload,
    ) {}
}

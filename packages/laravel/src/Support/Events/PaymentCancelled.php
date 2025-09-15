<?php

namespace Dodopayments\Laravel\Support\Events;

class PaymentCancelled
{
    public function __construct(
        public array $payload,
    ) {}
}

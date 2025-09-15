<?php

namespace Dodopayments\Laravel\Support\Events;

class PaymentProcessing
{
    public function __construct(
        public array $payload,
    ) {}
}

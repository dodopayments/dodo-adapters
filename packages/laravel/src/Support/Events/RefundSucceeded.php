<?php

namespace Dodopayments\Laravel\Support\Events;

class RefundSucceeded
{
    public function __construct(
        public array $payload,
    ) {}
}

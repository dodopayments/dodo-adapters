<?php

namespace Dodopayments\Laravel\Support\Events;

class RefundFailed
{
    public function __construct(
        public array $payload,
    ) {}
}

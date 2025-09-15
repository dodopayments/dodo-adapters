<?php

namespace Dodopayments\Laravel\Support\Events;

class DisputeExpired
{
    public function __construct(
        public array $payload,
    ) {}
}

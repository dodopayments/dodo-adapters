<?php

namespace Dodopayments\Laravel\Support\Events;

class DisputeCancelled
{
    public function __construct(
        public array $payload,
    ) {}
}

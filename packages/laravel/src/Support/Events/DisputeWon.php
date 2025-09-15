<?php

namespace Dodopayments\Laravel\Support\Events;

class DisputeWon
{
    public function __construct(
        public array $payload,
    ) {}
}

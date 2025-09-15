<?php

namespace Dodopayments\Laravel\Support\Events;

class DisputeOpened
{
    public function __construct(
        public array $payload,
    ) {}
}

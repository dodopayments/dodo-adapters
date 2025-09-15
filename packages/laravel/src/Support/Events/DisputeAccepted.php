<?php

namespace Dodopayments\Laravel\Support\Events;

class DisputeAccepted
{
    public function __construct(
        public array $payload,
    ) {}
}

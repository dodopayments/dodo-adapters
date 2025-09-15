<?php

namespace Dodopayments\Laravel\Support\Events;

class DisputeChallenged
{
    public function __construct(
        public array $payload,
    ) {}
}

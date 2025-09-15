<?php

namespace Dodopayments\Laravel\Support\Events;

class SubscriptionPaused
{
    public function __construct(
        public array $payload,
    ) {}
}

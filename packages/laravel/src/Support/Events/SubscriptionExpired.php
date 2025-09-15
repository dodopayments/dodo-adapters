<?php

namespace Dodopayments\Laravel\Support\Events;

class SubscriptionExpired
{
    public function __construct(
        public array $payload,
    ) {}
}

<?php

namespace Dodopayments\Laravel\Support\Events;

class SubscriptionActive
{
    public function __construct(
        public array $payload,
    ) {}
}

<?php

namespace Dodopayments\Laravel\Support\Events;

class SubscriptionOnHold
{
    public function __construct(
        public array $payload,
    ) {}
}

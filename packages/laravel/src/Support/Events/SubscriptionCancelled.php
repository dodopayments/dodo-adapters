<?php

namespace Dodopayments\Laravel\Support\Events;

class SubscriptionCancelled
{
    public function __construct(
        public array $payload,
    ) {}
}

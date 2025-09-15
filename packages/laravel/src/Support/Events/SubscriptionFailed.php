<?php

namespace Dodopayments\Laravel\Support\Events;

class SubscriptionFailed
{
    public function __construct(
        public array $payload,
    ) {}
}

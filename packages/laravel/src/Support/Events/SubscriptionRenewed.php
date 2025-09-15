<?php

namespace Dodopayments\Laravel\Support\Events;

class SubscriptionRenewed
{
    public function __construct(
        public array $payload,
    ) {}
}

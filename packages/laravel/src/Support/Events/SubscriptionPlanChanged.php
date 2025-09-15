<?php

namespace Dodopayments\Laravel\Support\Events;

class SubscriptionPlanChanged
{
    public function __construct(
        public array $payload,
    ) {}
}

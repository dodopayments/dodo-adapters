<?php

namespace Dodopayments\Laravel\Support\Events;

class DisputeLost
{
    public function __construct(
        public array $payload,
    ) {}
}

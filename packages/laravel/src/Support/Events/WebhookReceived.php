<?php

namespace Dodopayments\Laravel\Support\Events;

class WebhookReceived
{
    public function __construct(
        public array $payload,
    ) {}
}

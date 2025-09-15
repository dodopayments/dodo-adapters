<?php

namespace Dodopayments\Laravel\Support\Events;

class LicenseKeyCreated
{
    public function __construct(
        public array $payload,
    ) {}
}

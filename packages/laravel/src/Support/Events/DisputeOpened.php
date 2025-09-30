<?php

declare(strict_types=1);

namespace Dodopayments\Laravel\Support\Events;

final class DisputeOpened
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly array $payload,
    ) {}
}

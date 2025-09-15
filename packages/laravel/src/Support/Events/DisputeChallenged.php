<?php
declare(strict_types=1);

namespace Dodopayments\Laravel\Support\Events;

final class DisputeChallenged
{
    public function __construct(
        public readonly array $payload,
    ) {}
}

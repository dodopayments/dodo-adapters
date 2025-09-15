<?php

namespace Dodopayments\Laravel\Facades;

use Dodopayments\Laravel\Support\Client;
use Illuminate\Support\Facades\Facade;

/**
 * @method static \Dodopayments\Client sdk()
 */
class Dodo extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return Client::class;
    }
}

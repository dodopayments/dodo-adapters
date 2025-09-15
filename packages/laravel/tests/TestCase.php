<?php

namespace Dodopayments\Laravel\Tests;

use Dodopayments\Laravel\Providers\DodoServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app)
    {
        return [DodoServiceProvider::class];
    }

    protected function defineEnvironment($app)
    {
        $app['config']->set('dodo.api_key', 'test_api_key');
        $app['config']->set('dodo.webhook_secret', 'whsec_test');
        $app['config']->set('dodo.environment', 'test_mode');
        $app['config']->set('dodo.return_url', 'http://localhost/success');
        $app['config']->set('dodo.route_prefix', 'api/dodo');
        $app['config']->set('dodo.offline', true);
    }
}

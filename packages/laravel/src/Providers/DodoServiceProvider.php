<?php

namespace Dodopayments\Laravel\Providers;

use Dodopayments\Laravel\Support\Client;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class DodoServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../config/dodo.php', 'dodo');

        $this->app->singleton(Client::class, function ($app) {
            return new Client(
                apiKey: (string) config('dodo.api_key'),
            );
        });
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../../config/dodo.php' => config_path('dodo.php'),
        ], 'dodo-config');

        $this->registerRoutes();

        // Register middleware alias for webhook verification
        /** @var \Illuminate\Routing\Router $router */
        $router = $this->app->make('router');
        $router->aliasMiddleware('dodo.webhook', \Dodopayments\Laravel\Http\Middleware\VerifyDodoWebhook::class);
    }

    protected function registerRoutes(): void
    {
        if ($this->app->routesAreCached()) {
            return;
        }

        $prefix = config('dodo.route_prefix', 'api/dodo');

        Route::group([
            'prefix' => $prefix,
            'middleware' => ['api'],
        ], function () {
            require __DIR__.'/../../routes/api.php';
        });
    }
}

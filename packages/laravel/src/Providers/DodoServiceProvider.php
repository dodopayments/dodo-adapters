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

        // Global exception mapping for Dodo domain errors
        $exceptionHandler = $this->app->make(\Illuminate\Contracts\Debug\ExceptionHandler::class);
        if (method_exists($exceptionHandler, 'renderable')) {
            // Map invalid arguments (validation-like) to 400
            $exceptionHandler->renderable(function (\InvalidArgumentException $e, $request) {
                return response()->json([
                    'error' => [
                        'code' => 'invalid_request',
                        'message' => $e->getMessage(),
                    ],
                ], 400);
            });

            // Map expected runtime domain failures to 400
            $exceptionHandler->renderable(function (\RuntimeException $e, $request) {
                return response()->json([
                    'error' => [
                        'code' => 'operation_failed',
                        'message' => $e->getMessage(),
                    ],
                ], 400);
            });
        }
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

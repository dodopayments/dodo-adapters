<?php

use Dodopayments\Laravel\Http\Controllers\CheckoutController;
use Dodopayments\Laravel\Http\Controllers\CustomerPortalController;
use Dodopayments\Laravel\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/checkout', [CheckoutController::class, 'static']);
Route::post('/checkout', [CheckoutController::class, 'dynamic']);
Route::post('/checkout/session', [CheckoutController::class, 'session']);

Route::get('/customer-portal', [CustomerPortalController::class, 'show']);

Route::post('/webhook', [WebhookController::class, 'handle'])->middleware('dodo.webhook');

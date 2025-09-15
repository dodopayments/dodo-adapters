<?php

namespace Dodopayments\Laravel\Http\Controllers;

use Dodopayments\Laravel\Http\Requests\CustomerPortalRequest;
use Dodopayments\Laravel\Support\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class CustomerPortalController extends Controller
{
    public function __construct(private Client $client) {}

    // GET /customer-portal
    public function show(CustomerPortalRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // TODO: Call SDK to create portal session. Support optional send_email flag.
        $result = $this->client->createCustomerPortal($validated);

        return response()->json([
            'portal_url' => $result['portal_url'],
        ]);
    }
}

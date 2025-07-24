# `@dodopayments/sveltekit`

A typescript library that exports Handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your SvelteKit app.

> **AI Agent Integration Guide:** See the AI Agent Prompt section below for detailed instructions and guidance for AI assistants.

## Documentation

Detailed documentation can be found at [Dodo Payments SvelteKit adaptor](https://docs.dodopayments.com/developer-resources/sveltekit-adaptor)

## Installation

You can install this package via npm or any other package manager of your choice:

```bash
npm install @dodopayments/sveltekit
```

## Quick Start

All the examples below assume you're using SvelteKit App Router.

### 1. Checkout

```typescript
// src/routes/api/checkout/+server.ts
import { Checkout } from "@dodopayments/sveltekit";
import { DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_RETURN_URL, DODO_PAYMENTS_ENVIRONMENT } from '$env/static/private';

const checkoutGetHandler = Checkout({
    bearerToken: DODO_PAYMENTS_API_KEY,
    returnUrl: DODO_PAYMENTS_RETURN_URL,
    environment: environment,
    type: "static", // optional, defaults to 'static'
});
export const GET = checkoutGetHandler.GET;
```

---

### 2. Customer Portal Route Handler

```typescript
//
// src/routes/api/checkout/+server.ts
import { CustomerPortal } from "@dodopayments/sveltekit";
import { DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_RETURN_URL, DODO_PAYMENTS_ENVIRONMENT } from '$env/static/private';

const customerPortalHandler = CustomerPortal({
    bearerToken: DODO_PAYMENTS_API_KEY,
    environment: environment,
});

export const GET = customerPortalHandler.GET;
```

#### Query Parameters

- `customer_id` (required): The customer ID for the portal session (e.g., `?customer_id=cus_123`)
- `send_email` (optional, boolean): If set to `true`, sends an email to the customer with the portal link.

Returns 400 if `customer_id` is missing.

---

### 3. Webhook Route Handler

```typescript
// src/routes/api/webhook/+server.ts
// /api/checkout/+server.ts
import { Webhooks } from "@dodopayments/sveltekit";
import { DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_RETURN_URL, DODO_PAYMENTS_ENVIRONMENT, DODO_PAYMENTS_WEBHOOK_KEY } from '$env/static/private';

export const POST = Webhooks({
    webhookKey: DODO_PAYMENTS_WEBHOOK_KEY,
    onPayload: async (payload) => {
        //Handle payload here
        console.log(payload);
    }
});

```

---

## Prompt for LLM

```

You are an expert SvelteKit developer assistant. Your task is to guide a user through integrating the @dodopayments/sveltekit adapter into their existing SvelteKit project.

The @dodopayments/sveltekit adapter provides route handlers for Dodo Payments' Checkout, Customer Portal, and Webhook functionalities, designed for the SvelteKit App Router.

First, install the necessary packages. Use the package manager appropriate for your project (npm, yarn, or bun) based on the presence of lock files (e.g., package-lock.json for npm, yarn.lock for yarn, bun.lockb for bun):

npm install @dodopayments/sveltekit

Here's how you should structure your response:

    Ask the user which functionalities they want to integrate.

"Which parts of the @dodopayments/sveltekit adapter would you like to integrate into your project? You can choose one or more of the following:

    Checkout Route Handler (for handling product checkouts)

    Customer Portal Route Handler (for managing customer subscriptions/details)

    Webhook Route Handler (for receiving Dodo Payments webhook events)

    All (integrate all three)"

    Based on the user's selection, provide detailed integration steps for each chosen functionality.

If Checkout Route Handler is selected:

Purpose: This handler redirects users to the Dodo Payments checkout page.
File Creation: Create a new file at app/checkout/route.ts in your SvelteKit project.

Code Snippet:

// src/routes/api/checkout/+server.ts
import { Checkout } from "@dodopayments/sveltekit";
import { DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_RETURN_URL, DODO_PAYMENTS_ENVIRONMENT } from '$env/static/private';

const checkoutGetHandler = Checkout({
    bearerToken: DODO_PAYMENTS_API_KEY,
    returnUrl: DODO_PAYMENTS_RETURN_URL,
    environment: environment,
    type: "static", // optional, defaults to 'static'
});

const checkoutPostHandler = Checkout({
    bearerToken: DODO_PAYMENTS_API_KEY,
    returnUrl: DODO_PAYMENTS_RETURN_URL,
    environment: environment,
    type: "dynamic", // optional, defaults to 'static'
});

export const GET = checkoutGetHandler.GET;
export const POST = checkoutPostHandler.POST;

Configuration & Usage:

    bearerToken: Your Dodo Payments API key. It's recommended to set this via the DODO_PAYMENTS_API_KEY environment variable.

    returnUrl: (Optional) The URL to redirect the user to after a successful checkout.

    environment: (Optional) Set to "test_mode" for testing, or omit/set to "live_mode" for production.

    type: (Optional) Set to "static" for GET/static checkout, "dynamic" for POST/dynamic checkout. Defaults to "static".

Static Checkout (GET) Query Parameters:

    productId (required): Product identifier (e.g., ?productId=pdt_nZuwz45WAs64n3l07zpQR)

    quantity (optional): Quantity of the product

    Customer Fields (optional): fullName, firstName, lastName, email, country, addressLine, city, state, zipCode

    Disable Flags (optional, set to true to disable): disableFullName, disableFirstName, disableLastName, disableEmail, disableCountry, disableAddressLine, disableCity, disableState, disableZipCode

    Advanced Controls (optional): paymentCurrency, showCurrencySelector, paymentAmount, showDiscounts

    Metadata (optional): Any query parameter starting with metadata_ (e.g., ?metadata_userId=abc123)

Dynamic Checkout (POST): Parameters are sent as a JSON body. Supports both one-time and recurring payments. For a complete list of supported POST body fields, refer to:

    Docs - One Time Payment Product: https://docs.dodopayments.com/api-reference/payments/post-payments

    Docs - Subscription Product: https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions

Error Handling: If productId is missing or other query parameters are invalid, the handler will return a 400 response.

If Customer Portal Route Handler is selected:

Purpose: This handler redirects authenticated users to their Dodo Payments customer portal.
File Creation: Create a new file at app/customer-portal/route.ts in your SvelteKit project.

Code Snippet:

// src/routes/api/checkout/+server.ts
import { CustomerPortal } from "@dodopayments/sveltekit";
import { DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_RETURN_URL, DODO_PAYMENTS_ENVIRONMENT } from '$env/static/private';

const customerPortalHandler = CustomerPortal({
    bearerToken: DODO_PAYMENTS_API_KEY,
    environment: environment,
});

export const GET = customerPortalHandler.GET;


Query Parameters:

    customer_id (required): The customer ID for the portal session (e.g., ?customer_id=cus_123)

    send_email (optional, boolean): If set to true, sends an email to the customer with the portal link.

    Returns 400 if customer_id is missing.

If Webhook Route Handler is selected:

Purpose: This handler processes incoming webhook events from Dodo Payments, allowing your application to react to events like successful payments, refunds, or subscription changes.
File Creation: Create a new file at app/api/webhook/dodo-payments/route.ts in your SvelteKit project.

Code Snippet:

// src/routes/api/webhook/+server.ts
import { Webhooks } from "@dodopayments/sveltekit";
import { DODO_PAYMENTS_WEBHOOK_KEY } from '$env/static/private';

export const POST = Webhooks({
    webhookKey: DODO_PAYMENTS_WEBHOOK_KEY,
    onPayload: async (payload) => {
        console.log(payload);
    }
});

Handler Details:

    Method: Only POST requests are supported. Other methods return 405.

    Signature Verification: The handler verifies the webhook signature using the webhookKey and returns 401 if verification fails.

    Payload Validation: The payload is validated with Zod. Returns 400 for invalid payloads.

Error Handling:

    401: Invalid signature

    400: Invalid payload

    500: Internal error during verification

Event Routing: Calls the appropriate event handler based on the payload type.

Supported Webhook Event Handlers:

    onPayload?: (payload: WebhookPayload) => Promise<void>

    onPaymentSucceeded?: (payload: WebhookPayload) => Promise<void>

    onPaymentFailed?: (payload: WebhookPayload) => Promise<void>

    onPaymentProcessing?: (payload: WebhookPayload) => Promise<void>

    onPaymentCancelled?: (payload: WebhookPayload) => Promise<void>

    onRefundSucceeded?: (payload: WebhookPayload) => Promise<void>

    onRefundFailed?: (payload: WebhookPayload) => Promise<void>

    onDisputeOpened?: (payload: WebhookPayload) => Promise<void>

    onDisputeExpired?: (payload: WebhookPayload) => Promise<void>

    onDisputeAccepted?: (payload: WebhookPayload) => Promise<void>

    onDisputeCancelled?: (payload: WebhookPayload) => Promise<void>

    onDisputeChallenged?: (payload: WebhookPayload) => Promise<void>

    onDisputeWon?: (payload: WebhookPayload) => Promise<void>

    onDisputeLost?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionActive?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionOnHold?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionRenewed?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionPaused?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionPlanChanged?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionCancelled?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionFailed?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionExpired?: (payload: WebhookPayload) => Promise<void>

    onLicenseKeyCreated?: (payload: WebhookPayload) => Promise<void>

    Environment Variable Setup:

To ensure the adapter functions correctly, you will need to manually set up the following environment variables in your SvelteKit project's deployment environment (e.g., Vercel, Netlify, AWS, etc.):

    DODO_PAYMENTS_API_KEY: Your Dodo Payments API Key (required for Checkout and Customer Portal).

    RETURN_URL: (Optional) The URL to redirect to after a successful checkout (for Checkout handler).

    DODO_PAYMENTS_WEBHOOK_SECRET: Your Dodo Payments Webhook Secret (required for Webhook handler).

Example .env file:

DODO_PAYMENTS_API_KEY=your-api-key
DODO_PAYMENTS_WEBHOOK_KEY=your-webhook-secret
DODO_PAYMENTS_RETURN_URL=your-return-url
DODO_PAYMENTS_ENVIRONMENT="test" or "live"

Usage in your code:

bearerToken: process.env.DODO_PAYMENTS_API_KEY
webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY

Important: Never commit sensitive environment variables directly into your version control. Use environment variables for all sensitive information.

If the user needs assistance setting up environment variables for their specific deployment environment, ask them what platform they are using (e.g., Vercel, Netlify, AWS, etc.), and provide guidance. You can also add comments to their PR or chat depending on the context

```

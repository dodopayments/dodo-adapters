# @dodopayments/koa

A TypeScript library that exports middleware for Checkout, Customer Portal, and Webhook routes for easy integration with your Koa.js app.

> **AI Agent Integration Guide:** See the AI Agent Prompt section below for detailed instructions and guidance for AI assistants.

## Documentation

Detailed documentation can be found at [Dodo Payments Koa adaptor](https://docs.dodopayments.com/developer-resources/koa-adaptor)

## Installation

```bash
npm install @dodopayments/koa
# or
yarn add @dodopayments/koa
# or
pnpm add @dodopayments/koa
```

## Quick Start

### 1. Checkout

```typescript
import Koa from "koa";
import { Checkout } from "@dodopayments/koa";

const app = new Koa();

app.use(
  Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
    type: "static", // optional, defaults to 'static'
  })
);

app.listen(3000);
```

**Note:** You can also use `type: "dynamic"` for dynamic checkout links or `type: "session"` for checkout sessions instead of `"static"`.

---

### 2. Customer Portal Route Handler

```typescript
import Koa from "koa";
import { CustomerPortal } from "@dodopayments/koa";

const app = new Koa();

app.use(
  CustomerPortal({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  })
);

app.listen(3000);
```

#### Query Parameters

- `customer_id` (required): The customer ID for the portal session (e.g., `?customer_id=cus_123`)
- `send_email` (optional, boolean): If set to `true`, sends an email to the customer with the portal link.

Returns 400 if `customer_id` is missing.

---

### 3. Webhook Route Handler

```typescript
import Koa from "koa";
import { Webhooks, rawBodyMiddleware } from "@dodopayments/koa";

const app = new Koa();

// CRITICAL: Use rawBodyMiddleware BEFORE any body parser
app.use(rawBodyMiddleware());

app.use(
  Webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
    onPayload: async (payload) => {
      // handle the payload
    },
    // ... other event handlers for granular control
  })
);

app.listen(3000);
```

**IMPORTANT:** The `rawBodyMiddleware()` must be used before the webhook handler to capture the raw request body for signature verification.

---

## Prompt for LLM

```text
You are an expert Koa.js developer assistant. Your task is to guide a user through integrating the @dodopayments/koa adapter into their existing Koa.js project.

The @dodopayments/koa adapter provides middleware handlers for Dodo Payments' Checkout, Customer Portal, and Webhook functionalities, designed to work seamlessly with Koa's middleware system.

First, install the necessary package:

npm install @dodopayments/koa

Here's how you should structure your response:

1. Ask the user which functionalities they want to integrate.

"Which parts of the @dodopayments/koa adapter would you like to integrate into your project? You can choose one or more of the following:

    Checkout Middleware (for handling product checkouts)

    Customer Portal Middleware (for managing customer subscriptions/details)

    Webhook Middleware (for receiving Dodo Payments webhook events)

    All (integrate all three)"

2. Based on the user's selection, provide detailed integration steps for each chosen functionality.

If Checkout Middleware is selected:

Purpose: This middleware manages different types of checkout flows. All checkout types (static, dynamic, and sessions) return JSON responses with checkout URLs for programmatic handling.

Integration: Use the Checkout middleware in your Koa app for static (GET), dynamic (POST), and checkout sessions (POST).

Code Snippet:

import Koa from 'koa';
import { Checkout } from '@dodopayments/koa';

const app = new Koa();

app.use(
  Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
    type: "static" // or "dynamic" or "session"
  })
);

app.listen(3000);

Config Options:

    bearerToken: Your Dodo Payments API key (recommended to be stored in DODO_PAYMENTS_API_KEY env variable).

    returnUrl (optional): URL to redirect the user after successful checkout.

    environment: "test_mode" or "live_mode"

    type: "static" (GET), "dynamic" (POST), or "session" (POST)

GET (type: "static") expects query parameters:
- productId (required)
- quantity (optional)
- Customer fields (optional): fullName, email, phoneNumber
- Metadata fields (optional): metadata_* (e.g., metadata_userId=123)
- Returns: {"checkout_url": "https://checkout.dodopayments.com/..."}

POST (type: "dynamic") expects JSON body with payment details:
- For one-time payments: See https://docs.dodopayments.com/api-reference/payments/post-payments
- For subscriptions: See https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions
- Uses nested objects: customer.name, customer.email, billing.city, billing.country, etc.
- Returns: {"checkout_url": "https://checkout.dodopayments.com/..."}

POST (type: "session") expects JSON body (RECOMMENDED):
- product_cart (required): Array of {product_id, quantity}
- customer (optional): {name, email}
- billing (optional): {city, country, state, street, zipcode}
- See https://docs.dodopayments.com/api-reference/checkout-sessions
- Returns: {"checkout_url": "https://checkout.dodopayments.com/session/..."}

Error Handling: If productId is missing or other parameters are invalid, the middleware will return a 400 response.

If Customer Portal Middleware is selected:

Purpose: This middleware allows customers to manage their subscriptions via the Dodo Payments portal.

Integration:

import Koa from 'koa';
import { CustomerPortal } from '@dodopayments/koa';

const app = new Koa();

app.use(
  CustomerPortal({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  })
);

app.listen(3000);

Query Parameters:

    customer_id (required): e.g., ?customer_id=cus_123

    send_email (optional): if true, customer is emailed the portal link

Returns 400 if customer_id is missing.

If Webhook Middleware is selected:

Purpose: Processes incoming webhook events from Dodo Payments to trigger events in your app.

Integration:

import Koa from 'koa';
import { Webhooks, rawBodyMiddleware } from '@dodopayments/koa';

const app = new Koa();

// Important: rawBodyMiddleware must be used BEFORE webhook handler
app.use(rawBodyMiddleware());

app.use(
  Webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    onPayload: async (payload) => {
      // Handle generic payload
    },
    // You can also provide fine-grained handlers for each event type below
  })
);

app.listen(3000);

Features:

    Only POST method is allowed — others return 405

    Signature verification is performed using webhookKey. Returns 401 if invalid.

    Zod-based payload validation. Returns 400 if invalid schema.

    All handlers are async functions.

Supported Webhook Event Handlers:

You may pass in any of the following handlers:

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

    onSubscriptionUpdated?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionPaused?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionPlanChanged?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionCancelled?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionFailed?: (payload: WebhookPayload) => Promise<void>

    onSubscriptionExpired?: (payload: WebhookPayload) => Promise<void>

    onLicenseKeyCreated?: (payload: WebhookPayload) => Promise<void>

Environment Variable Setup:

Make sure to define these environment variables in your project:

DODO_PAYMENTS_API_KEY=your-api-key
DODO_PAYMENTS_WEBHOOK_KEY=your-webhook-secret
DODO_PAYMENTS_ENVIRONMENT="test_mode" or "live_mode"
DODO_PAYMENTS_RETURN_URL=your-return-url

Use these inside your code as:

process.env.DODO_PAYMENTS_API_KEY
process.env.DODO_PAYMENTS_WEBHOOK_KEY

Security Note: Do NOT commit secrets to version control. Use .env files locally and secrets managers in deployment environments (e.g., AWS, Vercel, Heroku, etc.).
```

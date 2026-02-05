# @dodopayments/elysia

A typescript library that exports Plugins for Checkout, Customer Portal, and Webhook routes for easy integration with your Elysia.js app.

> **AI Agent Integration Guide:** See the AI Agent Prompt section below for detailed instructions and guidance for AI assistants.

## Documentation

Detailed documentation can be found at [Dodo Payments Elysia adaptor](https://docs.dodopayments.com/developer-resources/elysia-adaptor)

## Installation

You can install this package using Bun:

```bash
bun add @dodopayments/elysia
```

## Quick Start

### 1. Checkout

```typescript
import { Elysia } from "elysia";
import { Checkout } from "@dodopayments/elysia";

const app = new Elysia()
  .group("/api/checkout", (app) =>
    app.use(
      Checkout({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
        environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
        type: "static", // optional, defaults to 'static'
      })
    )
  )
  .listen(3000);
```

**Note:** You can also use `type: "dynamic"` for dynamic checkout links or `type: "session"` for checkout sessions instead of `"static"`.

---

### 2. Customer Portal Route Handler

```typescript
import { Elysia } from "elysia";
import { CustomerPortal } from "@dodopayments/elysia";

const app = new Elysia()
  .group("/api/customer-portal", (app) =>
    app.use(
      CustomerPortal({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
        environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
      })
    )
  )
  .listen(3000);
```

#### Query Parameters

- `customer_id` (required): The customer ID for the portal session (e.g., `?customer_id=cus_123`)
- `send_email` (optional, boolean): If set to `true`, sends an email to the customer with the portal link.

Returns 400 if `customer_id` is missing.

---

### 3. Webhook Route Handler

```typescript
import { Elysia } from "elysia";
import { Webhooks } from "@dodopayments/elysia";

const app = new Elysia()
  .group("/api/webhook", (app) =>
    app.use(
      Webhooks({
        webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
        onPayload: async (payload) => {
          // handle the payload
        },
        // ... other event handlers for granular control
      })
    )
  )
  .listen(3000);
```

---

## Prompt for LLM

```text
You are an expert Elysia.js developer assistant. Your task is to guide a user through integrating the @dodopayments/elysia adapter into their existing Elysia.js project.

The @dodopayments/elysia adapter provides plugin-based handlers for Dodo Payments' Checkout, Customer Portal, and Webhook functionalities, designed to work seamlessly with Elysia's plugin system.

First, install the necessary package:

bun add @dodopayments/elysia

Here's how you should structure your response:

1. Ask the user which functionalities they want to integrate.

"Which parts of the @dodopayments/elysia adapter would you like to integrate into your project? You can choose one or more of the following:

    Checkout Plugin (for handling product checkouts)

    Customer Portal Plugin (for managing customer subscriptions/details)

    Webhook Plugin (for receiving Dodo Payments webhook events)

    All (integrate all three)"

2. Based on the user's selection, provide detailed integration steps for each chosen functionality.

If Checkout Plugin is selected:

Purpose: This plugin manages different types of checkout flows. All checkout types (static, dynamic, and sessions) return JSON responses with checkout URLs for programmatic handling.

Integration: Use the Checkout plugin in your Elysia app for static (GET), dynamic (POST), and checkout sessions (POST).

Code Snippet:

import { Elysia } from 'elysia';
import { Checkout } from '@dodopayments/elysia';

const app = new Elysia()
  .group('/api/checkout', (app) =>
    app.use(
      Checkout({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
        environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
        type: "static" // or "dynamic" or "session"
      })
    )
  )
  .listen(3000);

Config Options:

    bearerToken: Your Dodo Payments API key (recommended to be stored in DODO_PAYMENTS_API_KEY env variable).

    returnUrl (optional): URL to redirect the user after successful checkout.

    environment: "test_mode" or "live_mode"

    type: "static" (GET), "dynamic" (POST), or "session" (POST)

GET (static checkout) expects query parameters:

    productId (required)

    quantity, customer fields (fullName, email, etc.), and metadata (metadata_*) are optional.

    Returns: {"checkout_url": "https://checkout.dodopayments.com/..."}

POST (dynamic checkout) expects a JSON body with payment details (one-time or subscription). Reference the docs for the full POST schema:

    One-time payments: https://docs.dodopayments.com/api-reference/payments/post-payments

    Subscriptions: https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions

    Returns: {"checkout_url": "https://checkout.dodopayments.com/..."}

POST (checkout sessions) - (Recommended) A more customizable checkout experience:

    Expects a JSON body with product_cart array and customer details.

    One-time payments: https://docs.dodopayments.com/api-reference/payments/post-payments

    Subscriptions: https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions

    Required fields for checkout sessions:
        product_cart (array): Array of products with product_id and quantity

    Returns: {"checkout_url": "https://checkout.dodopayments.com/session/..."}

Error Handling: If productId is missing or other parameters are invalid, the plugin will return a 400 response.

If Customer Portal Plugin is selected:

Purpose: This plugin allows customers to manage their subscriptions via the Dodo Payments portal.

Integration:

import { Elysia } from 'elysia';
import { CustomerPortal } from '@dodopayments/elysia';

const app = new Elysia()
  .group('/api/customer-portal', (app) =>
    app.use(
      CustomerPortal({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
      })
    )
  )
  .listen(3000);

Query Parameters:

    customer_id (required): e.g., ?customer_id=cus_123

    send_email (optional): if true, customer is emailed the portal link

Returns 400 if customer_id is missing.

If Webhook Plugin is selected:

Purpose: Processes incoming webhook events from Dodo Payments to trigger events in your app.

Integration:

import { Elysia } from 'elysia';
import { Webhooks } from '@dodopayments/elysia';

const app = new Elysia()
  .group('/api/webhook', (app) =>
    app.use(
      Webhooks({
        webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
        onPayload: async (payload) => {
          // Handle generic payload
        },
        // You can also provide fine-grained handlers for each event type below
      })
    )
  )
  .listen(3000);

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

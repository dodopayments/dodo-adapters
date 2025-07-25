# `@dodopayments/express`

A typescript library that exports Handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your express app.

> **AI Agent Integration Guide:** See the AI Agent Prompt section below for detailed instructions and guidance for AI assistants.

## Documentation

Detailed documentation can be found at [Dodo Payments Express adaptor](https://docs.dodopayments.com/developer-resources/express-adaptor)

## Installation

You can install this package via npm or any other package manager of your choice:

```bash
npm install @dodopayments/express
```

## Quick Start


### 1. Checkout

```typescript
import { checkoutHandler } from '@dodopayments/express';

app.get('/api/checkout', checkoutHandler({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  returnUrl: process.env.RETURN_URL!,
  environment: "test_mode",
  type: "static"
}))

app.post('/api/checkout', checkoutHandler({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  returnUrl: process.env.RETURN_URL!,
  environment: "test_mode",
  type: "dynamic"
}))
```

---

### 2. Customer Portal Route Handler

```typescript
import { CustomerPortal } from "@dodopayments/express";

app.get('/api/customer-portal', CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode",
}))

```

#### Query Parameters

- `customer_id` (required): The customer ID for the portal session (e.g., `?customer_id=cus_123`)
- `send_email` (optional, boolean): If set to `true`, sends an email to the customer with the portal link.

Returns 400 if `customer_id` is missing.

---

### 3. Webhook Route Handler

```typescript
// app/api/webhook/dodo-payments/route.ts
import { Webhooks } from "@dodopayments/express";

app.post('/api/webhook',
  Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    // handle the payload
  },
  // ... other event handlers for granular control
}))
```

---

## Prompt for LLM

```
You are an expert Express.js developer assistant. Your task is to guide a user through integrating the @dodopayments/express adapter into their existing Express.js project.

The @dodopayments/express adapter provides route handlers for Dodo Payments' Checkout, Customer Portal, and Webhook functionalities, designed to plug directly into an Express app.

First, install the necessary package. Use the package manager appropriate for the user's project (npm, yarn, or bun):

npm install @dodopayments/express

---

Here's how you should structure your response:

1. Ask the user which functionalities they want to integrate.

"Which parts of the @dodopayments/express adapter would you like to integrate into your project? You can choose one or more of the following:

- Checkout Route Handler (for handling product checkouts)
- Customer Portal Route Handler (for managing customer subscriptions/details)
- Webhook Route Handler (for receiving Dodo Payments webhook events)
- All (integrate all three)"

---

2. Based on the user's selection, provide detailed integration steps for each chosen functionality.

---

**If Checkout Route Handler is selected:**

**Purpose**: This handler redirects users to the Dodo Payments checkout page.

**Integration**:
Create two routes in your Express app — one for static (GET) and one for dynamic (POST) checkout.


import { checkoutHandler } from '@dodopayments/express';

app.get('/api/checkout', checkoutHandler({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  returnUrl: process.env.RETURN_URL!,
  environment: "test_mode",
  type: "static"
}));

app.post('/api/checkout', checkoutHandler({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  returnUrl: process.env.RETURN_URL!,
  environment: "test_mode",
  type: "dynamic"
}));

Config Options:

    bearerToken: Your Dodo Payments API key (recommended to be stored in DODO_PAYMENTS_API_KEY env variable).

    returnUrl (optional): URL to redirect the user after successful checkout.

    environment: "test_mode" or "live_mode"

    type: "static" (GET) or "dynamic" (POST)

GET (static checkout) expects query parameters:

    productId (required)

    quantity, customer fields (fullName, email, etc.), and metadata (metadata_*) are optional.

POST (dynamic checkout) expects a JSON body with payment details (one-time or subscription). Reference the docs for the full POST schema:

    One-time payments: https://docs.dodopayments.com/api-reference/payments/post-payments

    Subscriptions: https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions

If Customer Portal Route Handler is selected:

Purpose: This route allows customers to manage their subscriptions via the Dodo Payments portal.

Integration:

import { CustomerPortal } from "@dodopayments/express";

app.get('/api/customer-portal', CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode",
}));

Query Parameters:

    customer_id (required): e.g., ?customer_id=cus_123

    send_email (optional): if true, customer is emailed the portal link

Returns 400 if customer_id is missing.

If Webhook Route Handler is selected:

Purpose: Processes incoming webhook events from Dodo Payments to trigger events in your app.

Integration:

import { Webhooks } from "@dodopayments/express";

app.post('/api/webhook', Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    // Handle generic payload
  },
  // You can also provide fine-grained handlers for each event type below
}));

Features:

    Only POST method is allowed — others return 405

    Signature verification is performed using webhookKey. Returns 401 if invalid.

    Zod-based payload validation. Returns 400 if invalid schema.

    All handlers are async functions.

Supported Webhook Event Handlers:

You may pass in any of the following handlers:

    onPayload

    onPaymentSucceeded

    onPaymentFailed

    onPaymentProcessing

    onPaymentCancelled

    onRefundSucceeded

    onRefundFailed

    onDisputeOpened, onDisputeExpired, onDisputeAccepted, onDisputeCancelled, onDisputeChallenged, onDisputeWon, onDisputeLost

    onSubscriptionActive, onSubscriptionOnHold, onSubscriptionRenewed, onSubscriptionPaused, onSubscriptionPlanChanged, onSubscriptionCancelled, onSubscriptionFailed, onSubscriptionExpired

    onLicenseKeyCreated

Environment Variable Setup:

Make sure to define these environment variables in your project:

DODO_PAYMENTS_API_KEY=your-api-key
RETURN_URL=https://yourapp.com/success
DODO_PAYMENTS_WEBHOOK_SECRET=your-webhook-secret

Use these inside your code as:

process.env.DODO_PAYMENTS_API_KEY!
process.env.DODO_PAYMENTS_WEBHOOK_SECRET!

Security Note: Do NOT commit secrets to version control. Use .env files locally and secrets managers in deployment environments (e.g., AWS, Vercel, Heroku, etc.).
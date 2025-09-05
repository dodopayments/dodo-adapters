# `@dodopayments/hono`

A typescript library that exports Handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your Hono app.

> **AI Agent Integration Guide:** See the AI Agent Prompt section below for detailed instructions and guidance for AI assistants.

## Documentation

Detailed documentation can be found at [Dodo Payments Hono adaptor](https://docs.dodopayments.com/developer-resources/hono-adaptor)

## Installation

You can install this package via npm or any other package manager of your choice:

```bash
npm install @dodopayments/hono
```

## Quick Start

### 1. Checkout

```typescript
// route.ts
import { Checkout } from '@dodopayments/hono';
import Hono from 'hono'

const app = new Hono();

app.get(
  "/api/checkout",
  Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
    returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
    type: 'static'
})
);

app.post(
"/api/checkout",
Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
    returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
    type: 'dynamic'
})
);
  
app.post(
"/api/checkout",
Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
    returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
    type: 'session'
})
);
```

---

### 2. Customer Portal Route Handler

```typescript
import { CustomerPortal } from "@dodopayments/hono";
import { Hono } from "hono";

const app = new Hono();
app.get(
  "/api/customer-portal",
  CustomerPortal({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  }),
);
```

#### Query Parameters

- `customer_id` (required): The customer ID for the portal session (e.g., `?customer_id=cus_123`)
- `send_email` (optional, boolean): If set to `true`, sends an email to the customer with the portal link.

Returns 400 if `customer_id` is missing.

---

### 3. Webhook Route Handler

```typescript
import { Hono } from "hono";
import { Webhooks } from "@dodopayments/hono";

const app = new Hono();
app.post(
  "/api/webhooks",
  Webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    onPayload: async (payload) => {
      // Handle Payload Here
      console.log(payload);
    },
  }),
);
```

---

## Prompt for LLM

```
You are an expert Hono developer assistant. Your task is to guide a user through integrating the @dodopayments/hono adapter into their existing Hono project.

The @dodopayments/hono adapter provides route handlers for Dodo Payments' Checkout, Customer Portal, and Webhook functionalities, designed to plug directly into an Hono app.

First, install the necessary package. Use the package manager appropriate for the user's project (npm, yarn, or bun):

npm install @dodopayments/hono

---

Here's how you should structure your response:

1. Ask the user which functionalities they want to integrate.

"Which parts of the @dodopayments/hono adapter would you like to integrate into your project? You can choose one or more of the following:

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
Create two routes in your Hono app — one for static (GET) and one for dynamic (POST) checkout.


import { Checkout } from '@dodopayments/hono';
import Hono from 'hono'

const app = new Hono()

app.get(
  "/api/checkout",
  Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
    returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
    type: 'static'
  })
);

app.post(
  "/api/checkout",
  Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
    returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
    type: 'session' // or 'dynamic' for dynamic link
  })
);


Config Options:

    bearerToken: Your Dodo Payments API key (recommended to be stored in DODO_PAYMENTS_API_KEY env variable).

    returnUrl (optional): URL to redirect the user after successful checkout.

    environment: "test_mode" or "live_mode"

    type: "static" (GET) or "dynamic" (POST) or "session" (POST)

GET (static checkout) expects query parameters:

    productId (required)

    quantity, customer fields (fullName, email, etc.), and metadata (metadata_*) are optional.

POST (dynamic checkout) expects a JSON body with payment details (one-time or subscription). Reference the docs for the full POST schema:

    One-time payments: https://docs.dodopayments.com/api-reference/payments/post-payments

    Subscriptions: https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions

POST (checkout sessions) - (Recommended) A more customizable checkout experience:

    Expects a JSON body with product_cart array and customer details.

    One-time payments: https://docs.dodopayments.com/api-reference/payments/post-payments

    Subscriptions: https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions

    Required fields for checkout sessions:
        product_cart (array): Array of products with product_id and quantity

    Returns: {"checkout_url": "https://checkout.dodopayments.com/session/..."}


If Customer Portal Route Handler is selected:

Purpose: This route allows customers to manage their subscriptions via the Dodo Payments portal.

Integration:

import { Checkout } from '@dodopayments/hono';
import Hono from 'hono'

const app = new Hono()
app.get(
  "/api/customer-portal",
  CustomerPortal({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT
  })
);

Query Parameters:

    customer_id (required): e.g., ?customer_id=cus_123

    send_email (optional): if true, customer is emailed the portal link

Returns 400 if customer_id is missing.

If Webhook Route Handler is selected:

Purpose: Processes incoming webhook events from Dodo Payments to trigger events in your app.

Integration:

import Hono from 'hono'
import { Webhooks } from '@dodopayments/hono'

const app = new Hono()
app.post(
  "/api/webhooks",
  Webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    onPayload: async (payload) => {
      // Handle Payload Here
      console.log(payload)
    }
  })
);

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
DODO_PAYMENTS_RETURN_URL=https://yourapp.com/success
DODO_PAYMENTS_WEBHOOK_KEY=your-webhook-secret
DODO_PAYMENTS_ENVIRONMENT="test_mode" or "live_mode""

Use these inside your code as:

process.env.DODO_PAYMENTS_API_KEY
process.env.DODO_PAYMENTS_WEBHOOK_KEY

Security Note: Do NOT commit secrets to version control. Use .env files locally and secrets managers in deployment environments (e.g., AWS, Vercel, Heroku, etc.).
```

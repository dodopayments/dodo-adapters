# @dodopayments/bun

A typescript library that exports Handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your Bun server.

> **AI Agent Integration Guide:** See the AI Agent Prompt section below for detailed instructions and guidance for AI assistants.

## Documentation

Detailed documentation can be found at [Dodo Payments Bun adaptor](https://docs.dodopayments.com/developer-resources/bun-adaptor)

## Installation

You can install this package using Bun:

```bash
bun add @dodopayments/bun
```

## Quick Start

### 1. Checkout

```typescript
import { Checkout } from "@dodopayments/bun";

// Static checkout handler (handles GET requests)
const staticCheckoutHandler = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  type: "static", // optional, defaults to 'static'
});

// Session checkout handler (handles POST requests)
const sessionCheckoutHandler = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  type: "session",
});

Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === "/api/checkout") {
      if (request.method === "GET") {
        return staticCheckoutHandler(request);
      }
      if (request.method === "POST") {
        return sessionCheckoutHandler(request);
      }
    }
    
    return new Response("Not Found", { status: 404 });
  },
});
```

**Note:** You can also use `type: "dynamic"` for dynamic checkout links instead of `"session"`.

---

### 2. Customer Portal Route Handler

```typescript
import { CustomerPortal } from "@dodopayments/bun";

const customerPortalHandler = CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode",
});

Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === "/api/customer-portal" && request.method === "GET") {
      return customerPortalHandler(request);
    }
    
    return new Response("Not Found", { status: 404 });
  },
});
```

#### Query Parameters

- `customer_id` (required): The customer ID for the portal session (e.g., `?customer_id=cus_123`)
- `send_email` (optional, boolean): If set to `true`, sends an email to the customer with the portal link.

Returns 400 if `customer_id` is missing.

---

### 3. Webhook Route Handler

```typescript
import { Webhooks } from "@dodopayments/bun";

const webhookHandler = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
  onPayload: async (payload) => {
    // handle the payload
  },
  // ... other event handlers for granular control
});

Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === "/api/webhook" && request.method === "POST") {
      return webhookHandler(request);
    }
    
    return new Response("Not Found", { status: 404 });
  },
});
```

---

## Prompt for LLM

```
You are an expert Bun developer assistant. Your task is to guide a user through integrating the @dodopayments/bun adapter into their existing Bun server project.

The @dodopayments/bun adapter provides request handlers for Dodo Payments' Checkout, Customer Portal, and Webhook functionalities, designed to work seamlessly with Bun's native Request/Response APIs.

First, install the necessary package:

bun add @dodopayments/bun

Here's how you should structure your response:

1. Ask the user which functionalities they want to integrate.

"Which parts of the @dodopayments/bun adapter would you like to integrate into your project? You can choose one or more of the following:

    Checkout Route Handler (for handling product checkouts)

    Customer Portal Route Handler (for managing customer subscriptions/details)

    Webhook Route Handler (for receiving Dodo Payments webhook events)

    All (integrate all three)"

2. Based on the user's selection, provide detailed integration steps for each chosen functionality.

If Checkout Route Handler is selected:

Purpose: This handler manages different types of checkout flows. All checkout types (static, dynamic, and sessions) return JSON responses with checkout URLs for programmatic handling.

Integration: Create handlers in your Bun server for static (GET), dynamic (POST), and checkout sessions (POST).

Code Snippet:

import { Checkout } from '@dodopayments/bun';

const staticCheckoutHandler = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  type: "static"
});

const dynamicCheckoutHandler = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  type: "dynamic"
});

const sessionCheckoutHandler = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  type: "session"
});

Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === "/api/checkout") {
      if (request.method === "GET") {
        return staticCheckoutHandler(request);
      }
      if (request.method === "POST") {
        // Use either dynamicCheckoutHandler or sessionCheckoutHandler based on your needs
        return sessionCheckoutHandler(request);
      }
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

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

Error Handling: If productId is missing or other parameters are invalid, the handler will return a 400 response.

If Customer Portal Route Handler is selected:

Purpose: This route allows customers to manage their subscriptions via the Dodo Payments portal.

Integration:

import { CustomerPortal } from "@dodopayments/bun";

const customerPortalHandler = CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
});

Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === "/api/customer-portal" && request.method === "GET") {
      return customerPortalHandler(request);
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

Query Parameters:

    customer_id (required): e.g., ?customer_id=cus_123

    send_email (optional): if true, customer is emailed the portal link

Returns 400 if customer_id is missing.

If Webhook Route Handler is selected:

Purpose: Processes incoming webhook events from Dodo Payments to trigger events in your app.

Integration:

import { Webhooks } from "@dodopayments/bun";

const webhookHandler = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
  onPayload: async (payload) => {
    // Handle generic payload
  },
  // You can also provide fine-grained handlers for each event type below
});

Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === "/api/webhook" && request.method === "POST") {
      return webhookHandler(request);
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

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

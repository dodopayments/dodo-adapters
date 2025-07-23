# `@dodopayments/remix`

A typescript library that exports Handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your Next.js app.

> **AI Agent Integration Guide:** See the AI Agent Prompt section below for detailed instructions and guidance for AI assistants.

## Documentation

Detailed documentation can be found at [Dodo Payments remix adaptor](https://docs.dodopayments.com/developer-resources/remix-adaptor)

## Installation

You can install this package via npm or any other package manager of your choice:

```bash
npm install @dodopayments/remix
```

## Quick Start

All the examples below assume you're using Next.js App Router.

### 1. Checkout

```typescript
// app/routes/api.checkout.tsx
import { Checkout } from "@dodopayments/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const checkoutGetHandler = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  type: "static", // optional, defaults to 'static'
});

export const loader = ({ request }: LoaderFunctionArgs) => checkoutGetHandler(request);
```

---

### 2. Customer Portal Route Handler

```typescript
// app/routes/api.customer-portal.tsx
import { CustomerPortal } from "@dodopayments/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";


const customerPortalHandler = CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT
});

export const loader = ({ request }: LoaderFunctionArgs) => customerPortalHandler(request);
```

#### Query Parameters

- `customer_id` (required): The customer ID for the portal session (e.g., `?customer_id=cus_123`)
- `send_email` (optional, boolean): If set to `true`, sends an email to the customer with the portal link.

Returns 400 if `customer_id` is missing.

---

### 3. Webhook Route Handler

```typescript
// app/routes/api.webhook.tsx
import { Webhooks } from "@dodopayments/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";


const webhookHandler = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    //Handle Payload Here
    console.log(payload)
  }
});


export const action = ({ request }: LoaderFunctionArgs) => webhookHandler(request);
```

---

## Prompt for LLM

```

You are an expert Remix developer assistant. Your task is to guide a user through integrating the @dodopayments/remix adapter into their existing Remix project.

The @dodopayments/remix adapter provides route handlers for Dodo Payments' Checkout, Customer Portal, and Webhook functionalities, designed for Remix route handlers.

First, install the necessary packages. Use the package manager appropriate for your project (npm, yarn, or bun) based on the presence of lock files (e.g., package-lock.json for npm, yarn.lock for yarn, bun.lockb for bun):

npm install @dodopayments/remix

Here's how you should structure your response:

    Ask the user which functionalities they want to integrate.

"Which parts of the @dodopayments/remix adapter would you like to integrate into your project? You can choose one or more of the following:

    Checkout Route Handler (for handling product checkouts)

    Customer Portal Route Handler (for managing customer subscriptions/details)

    Webhook Route Handler (for receiving Dodo Payments webhook events)

    All (integrate all three)"

    Based on the user's selection, provide detailed integration steps for each chosen functionality.

If Checkout Route Handler is selected:

Purpose: This handler redirects users to the Dodo Payments checkout page.
File Creation: Create a new file at app/routes/api.checkout.tsx in your Remix project.

Code Snippet:

// app/routes/api.checkout.tsx
import { Checkout } from "@dodopayments/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const checkoutGetHandler = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  type: "static", // optional, defaults to 'static'
});

const checkoutPostHandler = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  type: "dynamic", // optional, defaults to 'static'
});

export const loader = ({ request }: LoaderFunctionArgs) => checkoutGetHandler(request);

export const action = ({ request }: LoaderFunctionArgs) => checkoutPostHandler(request);

If Customer Portal Route Handler is selected:

Purpose: This handler redirects authenticated users to their Dodo Payments customer portal.
File Creation: Create a new file at app/routes/api.customer-portal.tsx in your Remix project.

Code Snippet:

// app/routes/api.customer-portal.tsx
import { CustomerPortal } from "@dodopayments/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const customerPortalHandler = CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT
});

export const loader = ({ request }: LoaderFunctionArgs) => customerPortalHandler(request);

Query Parameters:

    customer_id (required): The customer ID for the portal session (e.g., ?customer_id=cus_123)

    send_email (optional, boolean): If set to true, sends an email to the customer with the portal link.

    Returns 400 if customer_id is missing.

If Webhook Route Handler is selected:

Purpose: This handler processes incoming webhook events from Dodo Payments, allowing your application to react to events like successful payments, refunds, or subscription changes.
File Creation: Create a new file at app/routes/api.webhook.tsx in your Remix project.

Code Snippet:

// app/routes/api.webhook.tsx
import { Webhooks } from "@dodopayments/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const webhookHandler = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    //Handle Payload Here
    console.log(payload)
  }
});

export const action = ({ request }: LoaderFunctionArgs) => webhookHandler(request);

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

To ensure the adapter functions correctly, you will need to manually set up the following environment variables in your Remix project's deployment environment (e.g., Vercel, Netlify, AWS, etc.):

    DODO_PAYMENTS_API_KEY: Your Dodo Payments API Key (required for Checkout and Customer Portal).

    DODO_PAYMENTS_RETURN_URL: (Optional) The URL to redirect to after a successful checkout (for Checkout handler).

    DODO_PAYMENTS_ENVIRONMENT: (Optional) The environment for the API (e.g., test or live).

    DODO_PAYMENTS_WEBHOOK_SECRET: Your Dodo Payments Webhook Secret (required for Webhook handler).

Example .env file:

DODO_PAYMENTS_API_KEY=your-api-key
DODO_PAYMENTS_RETURN_URL=your-return-url
DODO_PAYMENTS_ENVIRONMENT=test
DODO_PAYMENTS_WEBHOOK_SECRET=your-webhook-secret

Usage in your code:

bearerToken: process.env.DODO_PAYMENTS_API_KEY
webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET

Important: Never commit sensitive environment variables directly into your version control. Use environment variables for all sensitive information.

If the user needs assistance setting up environment variables for their specific deployment environment, ask them what platform they are using (e.g., Vercel, Netlify, AWS, etc.), and provide guidance. You can also add comments to their PR or chat depending on the context

```

# `@dodopayments/nextjs`

A typescript library that exports Handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your Next.js app.

> **AI Agent Integration Guide:** See the AI Agent Prompt section below for detailed instructions and guidance for AI assistants.

## Documentation

Detailed documentation can be found at [Dodo Payments NextJS adaptor](https://docs.dodopayments.com/developer-resources/nextjs-adaptor)

## Installation

You can install this package via npm or any other package manager of your choice:

```bash
npm install @dodopayments/nextjs
```

## Quick Start

All the examples below assume you're using Next.js App Router.

### 1. Checkout

```typescript
// app/checkout/route.ts
import { Checkout } from "@dodopayments/nextjs";

export const GET = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  type: "static", // optional, defaults to 'static'
});

export const POST = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  type: "dynamic", // for dynamic checkout
});

export const POST = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
  type: "session", // for checkout sessions
});
```

---

### 2. Customer Portal Route Handler

```typescript
// app/customer-portal/route.ts
import { CustomerPortal } from "@dodopayments/nextjs";

export const GET = CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode",
});
```

#### Query Parameters

- `customer_id` (required): The customer ID for the portal session (e.g., `?customer_id=cus_123`)
- `send_email` (optional, boolean): If set to `true`, sends an email to the customer with the portal link.

Returns 400 if `customer_id` is missing.

---

### 3. Change Subscription Plan (New)

```typescript
// app/api/change-plan/route.ts
export { POST } from "@dodopayments/nextjs/customer-portal/change-plan";
```

POST body:

```json
{
  "subscription_id": "sub_123",
  "product_id": "pdt_456",
  "proration_billing_mode": "prorated_immediately",
  "quantity": 1,
  "addons": [{ "addon_id": "adn_1", "quantity": 1 }]
}
```

Environment:

- DODO_PAYMENTS_API_KEY
- DODO_ENVIRONMENT ("test_mode" | "live_mode")

---

### 4. Webhook Route Handler

```typescript
// app/api/webhook/dodo-payments/route.ts
import { Webhooks } from "@dodopayments/nextjs";

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    // handle the payload
  },
  // ... other event handlers for granular control
});
```

---

## Prompt for LLM

```

You are an expert Next.js developer assistant. Your task is to guide a user through integrating the @dodopayments/nextjs adapter into their existing Next.js project.

The @dodopayments/nextjs adapter provides route handlers for Dodo Payments' Checkout, Customer Portal, and Webhook functionalities, designed for the Next.js App Router.

First, install the necessary packages. Use the package manager appropriate for your project (npm, yarn, or bun) based on the presence of lock files (e.g., package-lock.json for npm, yarn.lock for yarn, bun.lockb for bun):

npm install @dodopayments/nextjs

Here's how you should structure your response:

    Ask the user which functionalities they want to integrate.

"Which parts of the @dodopayments/nextjs adapter would you like to integrate into your project? You can choose one or more of the following:

    Checkout Route Handler (for handling product checkouts)

    Customer Portal Route Handler (for managing customer subscriptions/details)

    Webhook Route Handler (for receiving Dodo Payments webhook events)

    All (integrate all three)"

    Based on the user's selection, provide detailed integration steps for each chosen functionality.

If Checkout Route Handler is selected:

Purpose: This handler manages different types of checkout flows. All checkout types (static, dynamic, and sessions) return JSON responses with checkout URLs for programmatic handling.
File Creation: Create a new file at app/checkout/route.ts in your Next.js project.

Code Snippet:

// app/checkout/route.ts
import { Checkout } from '@dodopayments/nextjs'

export const GET = Checkout({
bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
type: "static",
});

export const POST = Checkout({
bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
type: "session", // or "dynamic" for dynamic link
});

Configuration & Usage:

    bearerToken: Your Dodo Payments API key. It's recommended to set this via the DODO_PAYMENTS_API_KEY environment variable.

    returnUrl: (Optional) The URL to redirect the user to after a successful checkout.

    environment: (Optional) Set to "test_mode" for testing, or omit/set to "live_mode" for production.

    type: (Optional) Set to "static" for GET/static checkout, "dynamic" for POST/dynamic checkout, or "session" for POST/checkout sessions.

Static Checkout (GET) Query Parameters:

    productId (required): Product identifier (e.g., ?productId=pdt_nZuwz45WAs64n3l07zpQR)

    quantity (optional): Quantity of the product

    Customer Fields (optional): fullName, firstName, lastName, email, country, addressLine, city, state, zipCode

    Disable Flags (optional, set to true to disable): disableFullName, disableFirstName, disableLastName, disableEmail, disableCountry, disableAddressLine, disableCity, disableState, disableZipCode

    Advanced Controls (optional): paymentCurrency, showCurrencySelector, paymentAmount, showDiscounts

    Metadata (optional): Any query parameter starting with metadata_ (e.g., ?metadata_userId=abc123)

    Returns: {"checkout_url": "https://checkout.dodopayments.com/..."}

Dynamic Checkout (POST) - Returns JSON with checkout_url: Parameters are sent as a JSON body. Supports both one-time and recurring payments. Returns: {"checkout_url": "https://checkout.dodopayments.com/..."}. For a complete list of supported POST body fields, refer to:

    Docs - One Time Payment Product: https://docs.dodopayments.com/api-reference/payments/post-payments

    Docs - Subscription Product: https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions

Checkout Sessions (POST) - (Recommended) A more customizable checkout experience. Returns JSON with checkout_url: Parameters are sent as a JSON body. Supports both one-time and recurring payments. Returns: {"checkout_url": "https://checkout.dodopayments.com/..."}. For a complete list of supported POST body fields, refer to:

    Docs - One Time Payment Product: https://docs.dodopayments.com/api-reference/payments/post-payments

    Docs - Subscription Product: https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions

  Required fields for checkout sessions:
      product_cart (array): Array of products with product_id and quantity

Error Handling: If productId is missing or other parameters are invalid, the handler will return a 400 response.

If Customer Portal Route Handler is selected:

Purpose: This handler redirects authenticated users to their Dodo Payments customer portal.
File Creation: Create a new file at app/customer-portal/route.ts in your Next.js project.

Code Snippet:

// app/customer-portal/route.ts
import { CustomerPortal } from '@dodopayments/nextjs'

export const GET = CustomerPortal({
bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
environment: "test_mode",
});

Query Parameters:

    customer_id (required): The customer ID for the portal session (e.g., ?customer_id=cus_123)

    send_email (optional, boolean): If set to true, sends an email to the customer with the portal link.

    Returns 400 if customer_id is missing.

If Webhook Route Handler is selected:

Purpose: This handler processes incoming webhook events from Dodo Payments, allowing your application to react to events like successful payments, refunds, or subscription changes.
File Creation: Create a new file at app/api/webhook/dodo-payments/route.ts in your Next.js project.

Code Snippet:

// app/api/webhook/dodo-payments/route.ts
import { Webhooks } from '@dodopayments/nextjs'

export const POST = Webhooks({
webhookKey: process.env.DODO_WEBHOOK_SECRET!,
onPayload: async (payload) => {
// handle the payload
},
// ... other event handlers for granular control
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

To ensure the adapter functions correctly, you will need to manually set up the following environment variables in your Next.js project's deployment environment (e.g., Vercel, Netlify, AWS, etc.):

    DODO_PAYMENTS_API_KEY: Your Dodo Payments API Key (required for Checkout and Customer Portal).

    RETURN_URL: (Optional) The URL to redirect to after a successful checkout (for Checkout handler).

    DODO_WEBHOOK_SECRET: Your Dodo Payments Webhook Secret (required for Webhook handler).

Example .env file:

DODO_PAYMENTS_API_KEY=your-api-key
DODO_PAYMENTS_WEBHOOK_KEY=your-webhook-secret
DODO_PAYMENTS_ENVIRONMENT="test_mode" or "live_mode"
DODO_PAYMENTS_RETURN_URL=your-return-url

Usage in your code:

bearerToken: process.env.DODO_PAYMENTS_API_KEY!
webhookKey: process.env.DODO_WEBHOOK_SECRET!

Important: Never commit sensitive environment variables directly into your version control. Use environment variables for all sensitive information.

If the user needs assistance setting up environment variables for their specific deployment environment, ask them what platform they are using (e.g., Vercel, Netlify, AWS, etc.), and provide guidance. You can also add comments to their PR or chat depending on the context

```

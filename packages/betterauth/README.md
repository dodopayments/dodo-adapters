# @dodopayments/better-auth

A Better Auth plugin for integrating Dodo Payments into your authentication flow.

## Features

- **Automatic Customer Management** - Creates Dodo Payments customers when users sign up
- **Secure Checkout Integration** - Type-safe checkout flows with product slug mapping
- **Customer Portal Access** - Self-service portal for subscription and payment management
- **Webhook Event Handling** - Real-time payment event processing with signature verification
- **TypeScript Support** - Full type safety with TypeScript definitions

## Installation

```bash
npm install @dodopayments/better-auth dodopayments better-auth zod
```

## Setup

### 1. Environment Variables

Add the required environment variables to your `.env` file:

```env
# Get this from your Dodo Payments Dashboard > Developer > API Keys
DODO_PAYMENTS_API_KEY=your_api_key_here
# use the webhook endpoint `/api/auth/webhooks/dodopayments` to generate a webhook secret
# from Dodo Payments Dashboard > Developer > Webhooks
DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret_here # Use
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret_here
```

### 2. Server Configuration

```typescript
// src/lib/auth.ts
import { BetterAuth } from "better-auth";
import {
  dodopayments,
  checkout,
  portal,
  webhooks,
} from "@dodopayments/better-auth";
import DodoPayments from "dodopayments";

// Create a DodoPayments client instance
export const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode", // or "live_mode" for production
});

// Configure the dodopayments adapter
export const { auth, endpoints, client } = BetterAuth({
  plugins: [
    dodopayments({
      client: dodoPayments,
      createCustomerOnSignUp: true, // Auto-create customers on user signup
      use: [
        checkout({
          products: [
            {
              productId: "pdt_xxxxxxxxxxxxxxxxxxxxx", // Your product ID
              slug: "premium-plan", // Friendly slug for checkout
            },
          ],
          successUrl: "/dashboard/success",
          authenticatedUsersOnly: true, // Require login for checkout
        }),
        portal(),
        webhooks({
          webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
          onPayload: async (payload) => {
            // Handle all webhook payloads
            console.log("Received webhook:", payload.event_type);
          },
          // ...or use one of the other granular event handlers
        }),
      ],
    }),
  ],
});
```

### 3. Client Configuration

Initialize the client in your application to interact with the payment endpoints:

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { dodopaymentsClient } from "@dodopayments/better-auth";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [dodopaymentsClient()],
});
```

## Usage

### Creating a Checkout Session

```typescript
// Create checkout with customer details
const { data: checkout, error } = await authClient.checkout({
  slug: "premium-plan", // The slug you provided in the checkout configuration
  // product_id: "pdt_xxxxxxxxxxxxxxxxxxxxx", // Alternatively, use the product ID
  customer: {
    email: "customer@example.com",
    name: "John Doe",
  },
  billing: {
    city: "San Francisco",
    country: "US",
    state: "CA",
    street: "123 Market St",
    zipcode: "94103",
  },
  referenceId: "order_123", // Optional reference for your records
});

// Redirect to checkout URL
window.location.href = checkout.url;
```

### Accessing Customer Portal

```typescript
// Redirect to customer portal (requires authentication)
const { data: customerPortal, error } = await authClient.customer.portal();
if (customerPortal && customerPortal.redirect) {
  window.location.href = customerPortal.url;
}
```

### Listing Customer Data

```typescript
// Get customer's subscriptions
const { data: subscriptions, error } =
  await authClient.customer.subscriptions.list({
    query: {
      limit: 10,
      page: 1,
      active: true, // Filter for active subscriptions only
    },
  });

// Get customer's payment history
const { data: payments, error } = await authClient.customer.payments.list({
  query: {
    limit: 10,
    page: 1,
    status: "succeeded", // Filter by payment status
  },
});
```

## Webhooks

The webhooks plugin handles real-time payment events from Dodo Payments with secure signature verification. If you followed the default better-auth setup, the webhook endpoint will be `/api/auth/webhooks/dodopayments`. Generate a webhook secret for the URL `https://<your-domain>/api/auth/webhooks/dodopayments` and set it in your ENV as follows and use it in the `webhooks` plugin setup.

```env
DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret_here
```

### Event Handlers

```typescript
webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
  // Generic handler for all webhook payloads
  onPayload: async (payload) => {
    console.log("Received webhook:", payload.event_type);
  },
  // Specific event handlers
});
```

## Configuration

### Plugin Options

- **`client`** (required) - DodoPayments client instance
- **`createCustomerOnSignUp`** (optional) - Auto-create customers on user signup
- **`use`** (required) - Array of plugins to enable (checkout, portal, webhooks)

### Checkout Plugin Options

- **`products`** - Array of products or async function returning products
- **`successUrl`** - URL to redirect after successful payment
- **`authenticatedUsersOnly`** - Require user authentication (default: false)

# @dodopayments/betterauth

The official Dodo Payments adapter for `better-auth`.

This adapter provides a seamless integration between Dodo Payments and `better-auth`, allowing you to easily add payment functionalities to your application.

## Installation

```bash
npm install @dodopayments/betterauth dodopayments better-auth zod
```

## Usage

To get started, you need to initialize the `dodopayments` plugin and add it to your `better-auth` configuration.

### Initialization

```typescript
// src/lib/auth.ts
import { BetterAuth } from "better-auth";
import { dodopayments, checkout, portal, webhooks } from "@dodopayments/betterauth";
import DodoPayments from "dodopayments";

// First, create a `DodoPayments` client instance:
export const dodoPayments = new DodoPayments({
  // Can be omitted if DODO_PAYMENTS_API_KEY is set in
  // environment
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  // can be omitted for "live_mode"
  environment: "test_mode",
});

// Configure the `dodopayments` adapter in your `better-auth` setup:
export const { auth, endpoints, client } = BetterAuth({
  plugins: [
    dodopayments({
      client: dodoPayments,
      // It will create a customer in the Dodo Payments API whenever
      // a user signs up
      createCustomerOnSignUp: true,
      use: [
        checkout({
          // This can also be an async function if you want to 
          // dynamically provide these
          products: [
            {
              // ID of the product from the Dodo Payments
              // api/dashboard
              productId: "pdt_xxxxxxxxxxxxxxxxxxxxx",
              // an alias for the product, can be used for checkout
              // by passing the 'slug' parameter to the checkout
              // endpoint
              slug: "product-name"
            }
          ],
          successUrl: "/success",
          // require users to be signed in to use checkout
          // default is false
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          webhookKey: process.env.DODO_WEBHOOK_SECRET!,
          // handle the payload here
          onPayload: async (payload) => {
            // Handle all webhook payloads
          },
          // or use one of the granular payload handlers
          onPaymentSucceeded: async (payload) => {
            // Handle successful payment
          },
          onSubscriptionCreated: async (payload) => {
            // Handle new subscription
          },
          onSubscriptionUpdated: async (payload) => {
            // Handle subscription updates
          },
          onSubscriptionCancelled: async (payload) => {
            // Handle subscription cancellation
          },
          onRefundCreated: async (payload) => {
            // Handle refund creation
          },
          onDisputeCreated: async (payload) => {
            // Handle dispute creation
          },
          onLicenseKeyActivated: async (payload) => {
            // Handle license key activation
          },
          onLicenseKeyDeactivated: async (payload) => {
            // Handle license key deactivation
          },
        }),
      ],
    }),
    // ... other plugins
  ],
});
```

### Webhook Endpoint

This adapter creates a webhook endpoint for handling Dodo Payments webhooks. The base path for this endpoint is determined by the location of your `better-auth` configuration file. For example, if your configuration is in `app/api/auth/[...all].ts`, the endpoint will be prefixed with `/api/auth`.

- **POST** `/webhooks/dodopayments` - Handle Dodo Payments webhooks

## Plugins

### Checkout

The `checkout` plugin provides client-side methods for creating checkout links.

#### Options

-   `products`: An array of products or a function that returns an array of products. Each product should have `productId` and `slug` properties. This allows you to use slugs instead of product IDs in checkout requests.
-   `successUrl`: The URL to redirect to after a successful checkout.
-   `authenticatedUsersOnly`: A boolean to restrict checkout to authenticated users only (default: false).

### Portal

The `portal` plugin provides client-side methods for managing customer portals and viewing subscriptions and payments. All portal methods require user authentication.

### Webhooks

The `webhooks` plugin handles incoming webhooks from Dodo Payments. You need to provide a `webhookKey` for signature verification and can define handlers for different webhook events.

#### Options

-   `webhookKey`: Your Dodo Payments webhook secret.
-   `onPayload`: Generic handler for all webhook payloads.
-   `onPaymentSucceeded`: Handler for the `payment.succeeded` event.
-   `onSubscriptionCreated`: Handler for the `subscription.created` event.
-   `onSubscriptionUpdated`: Handler for the `subscription.updated` event.
-   `onSubscriptionCancelled`: Handler for the `subscription.cancelled` event.
-   `onRefundCreated`: Handler for the `refund.created` event.
-   `onDisputeCreated`: Handler for the `dispute.created` event.
-   `onLicenseKeyActivated`: Handler for the `license_key.activated` event.
-   `onLicenseKeyDeactivated`: Handler for the `license_key.deactivated` event.

## Automatic Customer Creation

By setting `createCustomerOnSignUp: true`, a new Dodo Payments customer will be created automatically whenever a new user signs up in your application.

## Client-side Usage

You can use the `dodopaymentsClient` to interact with the endpoints from the client-side. This provides type-safe access to all the server endpoints.

First, initialize the client:

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { dodopaymentsClient } from "@dodopayments/betterauth";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [dodopaymentsClient()],
});
```

Now you can use the client methods:

```typescript
// Example: Creating a checkout
const checkout = await authClient.checkout({
  slug: "my-product-slug",
});

if (checkout.redirect) {
  window.location.href = checkout.url;
}

// Example: Creating a checkout with product ID
const checkoutWithProductId = await authClient.checkout({
  product_id: "pdt_xxxxxxxxxxxxxxxxxxxxx",
  customer: {
    email: "customer@example.com",
    name: "John Doe",
  },
  billing: {
    city: "San Francisco",
    country: "US",
    state: "CA",
    street: "123 Market St",
    zipcode: "94103"
  }
});

// Example: Getting customer portal URL
const portal = await authClient.customer.portal();
if (portal.redirect) {
  window.location.href = portal.url;
}

// Example: Listing customer subscriptions
const subscriptions = await authClient.customer.subscriptions.list({
  query: {
    limit: 10,
    page: 1,
    active: true, // default is false, omit this to get all subscriptions
  },
});

// Example: Listing customer payments
const payments = await authClient.customer.payments.list({
  query: {
    limit: 10,
    page: 1,
    status: "succeeded", // omit this to get all payments
  },
});
``` 

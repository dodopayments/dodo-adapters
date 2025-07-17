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
      client: new DodoPayments({
      }),
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
          onPayload: async (payload) => {}
          // or use on of the granular payload handlers
          onPaymentSucceeded: async (payload) => {}
        }),
      ],
    }),
    // ... other plugins
  ],
});
```

### Endpoints

This adapter creates the following endpoints. The base path for these endpoints is determined by the location of your `better-auth` configuration file. For example, if your configuration is in `app/api/auth/[...all].ts`, the endpoints will be prefixed with `/api/auth`.

-   **POST** `/checkout`
-   **GET** `/checkout/static`
-   **GET** `/customer/portal`
-   **GET** `/customer/subscriptions/list`
-   **GET** `/customer/payments/list`
-   **POST** `/webhooks/dodopayments`

## Plugins

### Checkout

The `checkout` plugin provides endpoints for creating dynamic and static checkouts.

#### Options

-   `products`: An array of products or a function that returns an array of products. This allows you to use slugs instead of product IDs.
-   `successUrl`: The URL to redirect to after a successful checkout.
-   `authenticatedUsersOnly`: A boolean to restrict checkout to authenticated users.

### Portal

The `portal` plugin provides endpoints for managing customer portals and viewing subscriptions and payments.

### Webhooks

The `webhooks` plugin handles incoming webhooks from Dodo Payments. You need to provide a `webhookKey` for signature verification and can define handlers for different webhook events.

#### Options

-   `webhookKey`: Your Dodo Payments webhook secret.
-   `onPaymentSuccess`: Handler for the `payment.succeeded` event.
-   `onSubscriptionCreated`: Handler for the `subscription.created` event.
-   ... and more.

## Automatic Customer Creation

By setting `createCustomerOnSignUp: true`, a new Dodo Payments customer will be created automatically whenever a new user signs up in your application.

## Client-side Usage

You can use the `dodopaymentsClient` to interact with the endpoints from the client-side.

First, initialize the client:

```typescript
// src/lib/client.ts
import { createAuthClient } from "better-auth/client";
import { dodopaymentsClient } from "@dodopayments/betterauth";

export const authClient = createAuthClient({
  plugins: [dodopaymentsClient()],
});
```

Now you can call the endpoints:

```typescript
// Example: Creating a checkout
const checkout = await client.dodopayments.checkout.mutate({
  slug: "my-product-slug",
});

if (checkout.redirect) {
  window.location.href = checkout.url;
}
``` 
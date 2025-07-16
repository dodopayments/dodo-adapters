# @dodopayments/betterauth

A [Better Auth](https://github.com/better-auth/better-auth) plugin for integrating [Dodo Payments](https://dodopayments.com) payments and subscriptions into your authentication flow.

## Features

- Checkout Integration
- Customer Portal
- Automatic Customer creation on signup
- Usage-based billing support
- Secure webhook handling

## Installation

```bash
pnpm add better-auth @dodopayments/betterauth dodopayments
```

## Preparation

Get your Dodo Payments API key and add it to your environment:

```bash
# .env
DODO_PAYMENTS_API_KEY=...
```

## Configuring BetterAuth Server

The Dodo Payments plugin comes with several plugins for checkout, portal, usage, and webhooks.

```typescript
import { betterAuth } from "better-auth";
import { dodopayments, checkout, portal, usage, webhooks } from "@dodopayments/betterauth";
import DodoPayments from "dodopayments";

const dodoClient = new DodoPayments({
  apiKey: process.env.DODO_PAYMENTS_API_KEY!,
  // ...other config options
});

const auth = betterAuth({
  // ... Better Auth config
  plugins: [
    dodopayments({
      client: dodoClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "prod_123", // Dodo Payments Product ID
              slug: "pro" // Custom slug for easy reference
            }
          ],
          successUrl: "/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.DODO_WEBHOOK_SECRET,
          // Add webhook handlers as needed
        })
      ],
    })
  ]
});
```

## Configuring BetterAuth Client

Use the BetterAuth client to interact with Dodo Payments features.

```typescript
import { createAuthClient } from "better-auth/react";
import { dodoClient } from "@dodopayments/betterauth";

export const authClient = createAuthClient({
  plugins: [dodoClient()],
});
```

## Configuration Options

```typescript
import { dodopayments, checkout, portal, usage, webhooks } from "@dodopayments/betterauth";
import DodoPayments from "dodopayments";

const dodoClient = new DodoPayments({ apiKey: process.env.DODO_PAYMENTS_API_KEY! });

const auth = betterAuth({
  plugins: [
    dodopayments({
      client: dodoClient,
      createCustomerOnSignUp: true,
      getCustomerCreateParams: ({ user }, request) => ({
        metadata: {
          customField: "value",
        },
      }),
      use: [
        // Add Dodo Payments plugins here
      ],
    }),
  ],
});
```

### Required Options
- `client`: DodoPayments client instance

### Optional Options
- `createCustomerOnSignUp`: Automatically create a Dodo Payments customer when a user signs up
- `getCustomerCreateParams`: Custom function to provide additional customer creation metadata

## Plugins

### Checkout
```typescript
checkout({
  products: [ { productId: "prod_123", slug: "pro" } ],
  successUrl: "/success?checkout_id={CHECKOUT_ID}",
  authenticatedUsersOnly: true,
})
```

### Portal
```typescript
portal()
```

### Usage
```typescript
usage()
```

### Webhooks
```typescript
webhooks({
  secret: process.env.DODO_WEBHOOK_SECRET,
  // Add webhook handlers as needed
})
```

## Example Usage

- Use `authClient.checkout(...)` to start a checkout session
- Use `authClient.customer.portal()` to redirect to the customer portal
- Use `authClient.usage.list()` to list usage events

---

For more details, see the Better Auth and Dodo Payments documentation. 
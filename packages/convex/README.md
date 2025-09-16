# `@dodopayments/convex`

A TypeScript library that provides a Convex component for seamless integration of Dodo Payments into your Convex applications. This adapter follows the official Convex component pattern, offering a secure, type-safe, and easy-to-use interface for payment processing.

## Installation

```bash
npm install @dodopayments/convex
```

## Quick Start

### 1. Environment Variables

Set the following environment variables in your Convex dashboard (**Settings** → **Environment Variables**):

| Variable | Description | Required |
|----------|-------------|----------|
| `DODO_PAYMENTS_API_KEY` | Your Dodo Payments API key | ✅ |
| `DODO_PAYMENTS_WEBHOOK_SECRET` | Your webhook signing secret | ✅ |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` or `live_mode` | ✅ |

### 2. Add Component to Convex Config

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import dodoComponent from "@dodopayments/convex/convex.config";

const app = defineApp();
app.use(dodoComponent);

export default app;
```

### 3. Generate Types

```bash
npx convex dev
```

This generates the necessary `_generated` files and makes the component available.

### 4. Set Up Payment Functions

Create your payment handling functions:

```typescript
// convex/payments.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { DodoPayments } from "@dodopayments/convex";
import { components } from "./_generated/api";

// Initialize the client with user identification
const dodo = new DodoPayments(components.dodo, {
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    return {
      customerId: identity.subject,
      customerData: {
        name: identity.name,
        email: identity.email,
      },
    };
  },
});

const { checkout, customerPortal } = dodo.api();

// Create checkout session (recommended)
export const createCheckout = mutation({
  args: { payload: v.any() },
  handler: async (ctx, { payload }) => {
    return await checkout(ctx, { payload });
  },
});

// Get customer portal URL
export const getCustomerPortal = query({
  handler: async (ctx) => {
    return await customerPortal(ctx);
  },
});
```

### 5. Use in Frontend

```tsx
// components/CheckoutButton.tsx
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function CheckoutButton() {
  const createCheckout = useMutation(api.payments.createCheckout);

  const handleCheckout = async () => {
    const { checkout_url } = await createCheckout({
      payload: {
        product_cart: [{ product_id: "prod_123", quantity: 1 }],
        return_url: "https://yourapp.com/success",
      },
    });
    window.location.href = checkout_url;
  };

  return <button onClick={handleCheckout}>Buy Now</button>;
}
```

### 6. Handle Webhooks

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { createDodoWebhookHandler } from "@dodopayments/convex";

const http = httpRouter();

http.route({
  path: "/webhooks/dodo",
  method: "POST",
  handler: createDodoWebhookHandler({
    onPaymentSucceeded: async (payload) => {
      console.log("Payment succeeded:", payload.data.payment_id);
      // Handle successful payment
    },
    onPaymentFailed: async (payload) => {
      console.log("Payment failed:", payload.data.payment_id);
      // Handle failed payment
    },
  }),
});

export default http;
```

## API Reference

### Checkout Methods

The `DodoPayments` client provides multiple checkout methods:

#### `checkout(ctx, { payload })` *(Recommended)*
Modern checkout sessions with full customization support.

```typescript
await checkout(ctx, {
  payload: {
    product_cart: [{ product_id: "prod_123", quantity: 1 }],
    customer: { email: "customer@example.com" },
    return_url: "https://yourapp.com/success",
    billing_currency: "USD",
    allowed_payment_method_types: ["credit", "upi_collect"],
    feature_flags: {
      allow_discount_code: true,
      allow_currency_selection: false,
    },
  },
});
```

#### `staticCheckout(ctx, args)`
Simple checkout with query parameters.

```typescript
await staticCheckout(ctx, {
  productId: "prod_123",
  quantity: "2",
  returnUrl: "https://yourapp.com/success",
});
```

#### `dynamicCheckout(ctx, args)`
Dynamic checkout with API body support.

```typescript
await dynamicCheckout(ctx, {
  product_cart: [{ product_id: "prod_123", quantity: 1 }],
  billing: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    country: "US",
    zipcode: "94105",
  },
  customer: {
    email: "customer@example.com",
    name: "John Doe",
  },
});
```

### Customer Portal

```typescript
await customerPortal(ctx, { send_email: false });
```

### Webhook Events

All Dodo Payments webhook events are supported:

**Payment Events:**
- `onPaymentSucceeded`
- `onPaymentFailed` 
- `onPaymentProcessing`
- `onPaymentCancelled`

**Subscription Events:**
- `onSubscriptionActive`
- `onSubscriptionRenewed`
- `onSubscriptionCancelled`
- `onSubscriptionFailed`
- `onSubscriptionExpired`

**Other Events:**
- `onRefundSucceeded`, `onRefundFailed`
- `onDisputeOpened`, `onDisputeWon`, `onDisputeLost`
- `onLicenseKeyCreated`

## Types

The package re-exports all necessary types from `@dodopayments/core`:

```typescript
import type {
  CheckoutSessionPayload,
  CheckoutSessionResponse,
  CheckoutSessionProductCartItem,
  PaymentMethodType,
  WebhookPayload,
  Payment,
  Subscription,
} from "@dodopayments/convex";
```

## Troubleshooting

**Component not found:** Run `npx convex dev` after adding the component to your config.

**Environment variables not set:** Verify all required environment variables are set in your Convex dashboard.

**Webhook verification failed:** Ensure your webhook secret matches the one in your Dodo Payments dashboard.

## Documentation

- [Dodo Payments Docs](https://docs.dodopayments.com)
- [Convex Components Guide](https://docs.convex.dev/components)
- [GitHub Repository](https://github.com/dodopayments/dodo-adapters)
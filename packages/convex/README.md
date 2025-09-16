# `@dodopayments/convex`

A TypeScript library that provides a Convex component for seamless integration of Dodo Payments into your Convex applications.

> **AI Agent Integration Guide:** See the AI Agent Prompt section below for detailed instructions and guidance for AI assistants.

## Documentation

Detailed documentation can be found at [Dodo Payments Convex adaptor](https://docs.dodopayments.com/developer-resources/convex-adaptor)

## Installation

```bash
npm install @dodopayments/convex
```

## Quick Start

### 1. Add Component to Convex Config

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import dodoComponent from "@dodopayments/convex/convex.config";

const app = defineApp();
app.use(dodoComponent);
export default app;
```

### 2. Set Up Environment Variables

In your Convex dashboard (**Settings** → **Environment Variables**):

```
DODO_PAYMENTS_API_KEY=your-api-key
DODO_PAYMENTS_ENVIRONMENT=test_mode
```

### 3. Create Payment Functions

```typescript
// convex/dodo.ts
import { DodoPayments } from "@dodopayments/convex";
import { components } from "./_generated/api";

export const dodo = new DodoPayments(components.dodopayments, {
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity ? { customerId: identity.subject } : null;
  },
  apiKey: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
});

export const { checkout, staticCheckout, dynamicCheckout, customerPortal } = dodo.api();
```

### 4. Use in Mutations

```typescript
// convex/payments.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { checkout } from "./dodo";

export const createSessionCheckout = action({
  args: { 
    product_cart: v.array(v.object({
      product_id: v.string(),
      quantity: v.number(),
    })),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await sessionCheckout(ctx, {
      payload: {
        product_cart: args.product_cart,
        return_url: args.returnUrl,
        billing_currency: "USD",
        feature_flags: {
          allow_discount_code: true,
        },
      },
    });
  },
});
```

### 5. Frontend Usage

```tsx
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function CheckoutButton() {
  const createSessionCheckout = useMutation(api.payments.createSessionCheckout);

  const handleCheckout = async () => {
    const { checkout_url } = await createSessionCheckout({
      payload: {
        product_cart: [{ product_id: "prod_123", quantity: 1 }],
      },
    });
    window.location.href = checkout_url;
  };

  return <button onClick={handleCheckout}>Buy Now</button>;
}
```

---

## Prompt for LLM

```
You are an expert Convex developer assistant. Your task is to guide a user through integrating the @dodopayments/convex component into their existing Convex application.

The @dodopayments/convex adapter provides a Convex component for Dodo Payments' Checkout and Customer Portal functionalities, built using the official Convex component architecture pattern.

First, install the necessary package:

npm install @dodopayments/convex

Here's how you should structure your response:

1. Ask the user which functionalities they want to integrate.

"Which parts of the @dodopayments/convex component would you like to integrate into your project? You can choose one or more of the following:

- Checkout Functions (for handling product checkouts)
- Customer Portal Function (for managing customer subscriptions/details)
- All (integrate both)"

2. Based on the user's selection, provide detailed integration steps for each chosen functionality.

If Checkout Functions are selected:

Purpose: These functions handle different types of checkout flows and return checkout URLs for programmatic handling.

Integration Steps:

Step 1: Add the component to your Convex configuration.

// convex/convex.config.ts
import { defineApp } from "convex/server";
import dodoComponent from "@dodopayments/convex/convex.config";

const app = defineApp();
app.use(dodoComponent);
export default app;

Step 2: Set up environment variables in your Convex dashboard (Settings → Environment Variables):

DODO_PAYMENTS_API_KEY=your-api-key
DODO_PAYMENTS_ENVIRONMENT=test_mode

Step 3: Create your payment functions file.

// convex/dodo.ts
import { DodoPayments } from "@dodopayments/convex";
import { components } from "./_generated/api";

export const dodo = new DodoPayments(components.dodopayments, {
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity ? { customerId: identity.subject } : null;
  },
  apiKey: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
});

export const { checkout, staticCheckout, dynamicCheckout, customerPortal } = dodo.api();

Step 4: Create mutations that use the checkout functions.

// convex/payments.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkout, staticCheckout, dynamicCheckout } from "./dodo";

// Modern checkout session (recommended)
import { action } from "./_generated/server";
import { v } from "convex/values";
import { checkout } from "./dodo";

export const createSessionCheckout = action({
  args: { 
    product_cart: v.array(v.object({
      product_id: v.string(),
      quantity: v.number(),
    })),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await sessionCheckout(ctx, {
      payload: {
        product_cart: args.product_cart,
        return_url: args.returnUrl,
        billing_currency: "USD",
        feature_flags: {
          allow_discount_code: true,
        },
      },
    });
  },
});

// Static checkout (simple)
export const createStaticCheckout = mutation({
  args: {
    productId: v.string(),
    quantity: v.optional(v.string()),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await staticCheckout(ctx, args);
  },
});

// Dynamic checkout (complex scenarios)
export const createDynamicCheckout = mutation({
  args: {
    product_cart: v.array(v.object({
      product_id: v.string(),
      quantity: v.number(),
    })),
    billing: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      zipcode: v.string(),
    }),
    customer: v.object({
      email: v.optional(v.string()),
      name: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    return await dynamicCheckout(ctx, args);
  },
});

Step 5: Use in your frontend.

import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function CheckoutButton() {
  const createSessionCheckout = useMutation(api.payments.createSessionCheckout);

  const handleCheckout = async () => {
    const { checkout_url } = await createSessionCheckout({
      payload: {
        product_cart: [{ product_id: "prod_123", quantity: 1 }],
      },
    });
    window.location.href = checkout_url;
  };

  return <button onClick={handleCheckout}>Buy Now</button>;
}

Configuration Details:

- sessionCheckout(): Simplified checkout for quick payments
- staticCheckout(): Simple checkout with query parameters  
- dynamicCheckout(): Complex checkout with API body support
- All methods return: {"checkout_url": "https://checkout.dodopayments.com/..."}

For complete API documentation, refer to:
- Checkout Sessions: https://docs.dodopayments.com/developer-resources/checkout-session
- One-time Payments: https://docs.dodopayments.com/api-reference/payments/post-payments
- Subscriptions: https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions

If Customer Portal Function is selected:

Purpose: This function allows customers to manage their subscriptions and payment methods.

Integration Steps:

Follow Steps 1-3 from the Checkout Functions section, then:

Step 4: Create a customer portal mutation.

// convex/payments.ts (add to existing file)
export const getCustomerPortal = mutation({
  args: {
    send_email: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await customerPortal(ctx, args);
  },
});

Step 5: Use in your frontend.

import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function CustomerPortalButton() {
  const getPortal = useMutation(api.payments.getCustomerPortal);

  const handlePortal = async () => {
    const { portal_url } = await getPortal({ send_email: false });
    window.location.href = portal_url;
  };

  return <button onClick={handlePortal}>Manage Subscription</button>;
}

Configuration Details:
- Requires authenticated user (via identify function)
- send_email: Optional boolean to send portal link via email

Environment Variable Setup:

Set up the following environment variables in your Convex dashboard (Settings → Environment Variables):

DODO_PAYMENTS_API_KEY=your-api-key
DODO_PAYMENTS_ENVIRONMENT=test_mode

Usage in your component configuration:

apiKey: process.env.DODO_PAYMENTS_API_KEY!
environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode"

Important: Never commit sensitive environment variables directly into your code. Always use Convex environment variables for all sensitive information.

If the user needs assistance setting up environment variables or deployment, ask them about their specific setup and provide guidance accordingly.

Run npx convex dev after setting up the component to generate the necessary types.
```
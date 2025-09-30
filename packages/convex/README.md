# Dodo Payments Convex Component

[![npm version](https://badge.fury.io/js/@dodopayments%2Fconvex.svg)](https://badge.fury.io/js/@dodopayments%2Fconvex.svg)

This component is the official way to integrate the Dodo Payments in your Convex project.

Features:

- Checkout Session: Integrate Dodo Payments Checkout with a couple of lines code.

- Customer Portal: Allow customers to manage subscriptions and details

- Webhooks: Handle webhooks efficiently. Just write your business logic and handle the events you want. Webhook verification is taken care by us

Detailed documentation can be found at [Dodo Payments Convex Component](https://docs.dodopayments.com/developer-resources/convex-component)

## Installation

```bash
npm install @dodopayments/convex
```

## Quick Start


### 1. Add Component to Convex Config

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import dodopayments from "@dodopayments/convex/convex.config";

const app = defineApp();
app.use(dodopayments);
export default app;
```

### 2. Set Up Environment Variables

Create a [Dodo Payments](https://dodopayments.com) account and get the API_KEY and WEBHOOK_SECRET

Add your environment variables in the Convex dashboard (**Settings** → **Environment Variables**). You can open the dashboard by running:

```env
DODO_PAYMENTS_API_KEY=your-dodo-payments-api-key
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_SECRET=your-webhook-secret (if using webhooks)
```
```sh
npx convex dashboard
```

Set the following variables:

- `DODO_PAYMENTS_API_KEY=your-api-key`
- `DODO_PAYMENTS_ENVIRONMENT=test_mode`
- `DODO_PAYMENTS_WEBHOOK_SECRET=your-webhook-secret` (if using webhooks)

> **Note:** Convex backend functions only read environment variables set in the Convex dashboard. `.env` files are ignored. Always set secrets in the Convex dashboard for both production and development.

### 3. Create Payment Functions

```typescript
// convex/dodo.ts
import { DodoPayments } from "@dodopayments/convex";
import { components } from "./_generated/api";

export const dodo = new DodoPayments(components.dodopayments, {
  // This function maps your Convex user to a Dodo Payments customer
  // Customize it based on your authentication provider and/or user database
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // User is not logged in
    }
    
    // Lookup user from your database
    const user = await ctx.db.query("users")
       .withIndex("by_auth_id", (q) => q.eq("authId", identity.subject))
       .first();
     if (!user) {
       return null; // User not found in database
     }
     
     return {
       dodoCustomerId: user.dodoCustomerId, // Use stored dodoCustomerId
       customerData: {
         name: user.name,
         email: user.email,
       },
     };
  },
  apiKey: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
});

export const { checkout, customerPortal } = dodo.api();
// Export the API methods for use in your app
export const { checkout, customerPortal } = dodo.api();
```

### 4. Set Up Webhooks (Optional)

For handling Dodo Payments webhooks, create a file `convex/http.ts`:

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { createDodoWebhookHandler } from "@dodopayments/convex";

const http = httpRouter();

http.route({
  path: "/dodopayments-webhook",
  method: "POST",
  handler: createDodoWebhookHandler({
    onPaymentSucceeded: async (payload) => {
      console.log("Payment succeeded:", payload.data.payment_id);
      // Add your logic here to handle the successful payment
    },
    onSubscriptionActive: async (payload) => {
      console.log("Subscription activated:", payload.data.subscription_id);
      // Add your logic here
    },
    // Add other event handlers as needed
  }),
});

export default http;
```

Add your webhook secret in the Convex dashboard (**Settings** → **Environment Variables**):

- `DODO_PAYMENTS_WEBHOOK_SECRET=your-webhook-secret`

### 5. Define Payment Actions

```typescript
// convex/payments.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { checkout } from "./dodo";

export const createCheckout = action({
  args: { 
    product_cart: v.array(v.object({
      product_id: v.string(),
      quantity: v.number(),
    })),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await checkout(ctx, {
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

### 6. Frontend Usage

```tsx
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export function CheckoutButton() {
  const createCheckout = useAction(api.payments.createCheckout);

  const handleCheckout = async () => {
    const { checkout_url } = await createCheckout({
      product_cart: [{ product_id: "prod_123", quantity: 1 }],
    });
    window.location.href = checkout_url;
  };

  return <button onClick={handleCheckout}>Buy Now</button>;
}
```

---

## Prompt for LLM

```text
You are an expert Convex developer assistant. Your task is to guide a user through integrating the @dodopayments/convex component into their existing Convex application.

The @dodopayments/convex adapter provides a Convex component for Dodo Payments' Checkout, Customer Portal, and Webhook functionalities, built using the official Convex component architecture pattern.

First, install the necessary package:

npm install @dodopayments/convex

Here's how you should structure your response:

1. Ask the user which functionalities they want to integrate.

"Which parts of the @dodopayments/convex component would you like to integrate into your project? You can choose one or more of the following:

- Checkout Function (for handling product checkouts)
- Customer Portal Function (for managing customer subscriptions/details)
- Webhook Handler (for receiving Dodo Payments webhook events)
- All (integrate all three)"

2. Based on the user's selection, provide detailed integration steps for each chosen functionality.

If Checkout Function is selected:

Purpose: This function handles different types of checkout flows and returns checkout URLs for programmatic handling.

Integration Steps:

Step 1: Add the component to your Convex configuration.

// convex/convex.config.ts
import { defineApp } from "convex/server";
import dodopayments from "@dodopayments/convex/convex.config";

const app = defineApp();
app.use(dodopayments);
export default app;

Step 2: Guide the user to set up environment variables in the Convex dashboard. Instruct them to open the dashboard by running:

npx convex dashboard

Then add the required environment variables (e.g., DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_ENVIRONMENT, DODO_PAYMENTS_WEBHOOK_SECRET) in **Settings → Environment Variables**. Do not use .env files for backend functions.

DODO_PAYMENTS_API_KEY=your-api-key
DODO_PAYMENTS_ENVIRONMENT=test_mode

Step 3: Create your payment functions file.

// convex/dodo.ts
import { DodoPayments } from "@dodopayments/convex";
import { components } from "./_generated/api";

export const dodo = new DodoPayments(components.dodopayments, {
  // This function maps your Convex user to a Dodo Payments customer
  // Customize it based on your authentication provider
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // User is not logged in
    }
    
    // Option 1: Use identity data directly
    return {
      dodoCustomerId: identity.subject, // Use a stable identifier for the customer ID
      customerData: { // Optional: additional customer information
        name: identity.name,
        email: identity.email,
      },
    };
    
    // Lookup user from your database
    const user = await ctx.db.query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", identity.subject))
      .first();
    if (!user) {
      return null; // User not found in database
    }

    return {
      dodoCustomerId: user.dodoCustomerId, // Use stored dodoCustomerId
      customerData: {
        name: user.name,
        email: user.email,
      },
    };
  },
  apiKey: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
});

// Export the API methods for use in your app
export const { checkout, customerPortal } = dodo.api();

Step 4: Create actions that use the checkout function.

// convex/payments.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { checkout } from "./dodo";

// Checkout session with full feature support
export const createCheckout = action({
  args: { 
    product_cart: v.array(v.object({
      product_id: v.string(),
      quantity: v.number(),
    })),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await checkout(ctx, {
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

Step 5: Use in your frontend.

// Your frontend component
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export function CheckoutButton() {
  const createCheckout = useAction(api.payments.createCheckout);

  const handleCheckout = async () => {
    const { checkout_url } = await createCheckout({
      product_cart: [{ product_id: "prod_123", quantity: 1 }],
    });
    window.location.href = checkout_url;
  };

  return <button onClick={handleCheckout}>Buy Now</button>;
}

Configuration Details:

- `checkout()`: Checkout session with full feature support using session checkout.
- Returns: `{"checkout_url": "https://checkout.dodopayments.com/..."}`

For complete API documentation, refer to:
- Checkout Sessions: https://docs.dodopayments.com/developer-resources/checkout-session
- One-time Payments: https://docs.dodopayments.com/api-reference/payments/post-payments
- Subscriptions: https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions

If Customer Portal Function is selected:

Purpose: This function allows customers to manage their subscriptions and payment methods.

Integration Steps:

Follow Steps 1-3 from the Checkout Function section, then:

Step 4: Create a customer portal action.

// convex/payments.ts (add to existing file)
import { action } from "./_generated/server";
import { v } from "convex/values";
import { customerPortal } from "./dodo";

export const getCustomerPortal = action({
  args: {
    send_email: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await customerPortal(ctx, args);
  },
});

Step 5: Use in your frontend.

// Your frontend component
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export function CustomerPortalButton() {
  const getPortal = useAction(api.payments.getCustomerPortal);

  const handlePortal = async () => {
    const { portal_url } = await getPortal({ send_email: false });
    window.location.href = portal_url;
  };

  return <button onClick={handlePortal}>Manage Subscription</button>;
}

Configuration Details:
- Requires authenticated user (via `identify` function).
- `send_email`: Optional boolean to send portal link via email.

If Webhook Handler is selected:

Purpose: This handler processes incoming webhook events from Dodo Payments, allowing your application to react to events like successful payments or subscription changes.

Integration Steps:

Step 1: Add the webhook secret to your environment variables in the Convex dashboard. You can open the dashboard by running:

Guide the user to open the Convex dashboard by running:

npx convex dashboard

In the dashboard, go to **Settings → Environment Variables** and add:

- `DODO_PAYMENTS_WEBHOOK_SECRET=whsec_...`

Do not use .env files for backend functions; always set secrets in the Convex dashboard.

Step 2: Create a file `convex/http.ts`:

// convex/http.ts
import { httpRouter } from "convex/server";
import { createDodoWebhookHandler } from "@dodopayments/convex";

const http = httpRouter();

http.route({
  path: "/dodopayments-webhook",
  method: "POST",
  handler: createDodoWebhookHandler({
    onPaymentSucceeded: async (payload) => {
      console.log("Payment succeeded:", payload.data.payment_id);
      // Add your logic here to handle the successful payment
    },
    onSubscriptionActive: async (payload) => {
      console.log("Subscription activated:", payload.data.subscription_id);
      // Add your logic here
    },
    // Add other event handlers as needed
  }),
});

export default http;

Now, you can set the webhook endpoint URL in your Dodo Payments dashboard to `https://<your-convex-deployment-url>/dodopayments-webhook`.

Environment Variable Setup:

Set up the following environment variables in your Convex dashboard (Settings → Environment Variables). You can open the dashboard by running:

npx convex dashboard

Set:

- `DODO_PAYMENTS_API_KEY=your-api-key`
- `DODO_PAYMENTS_ENVIRONMENT=test_mode`
- `DODO_PAYMENTS_WEBHOOK_SECRET=your-webhook-secret`

Usage in your component configuration:

apiKey: process.env.DODO_PAYMENTS_API_KEY!
environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode"

Important: Never commit sensitive environment variables directly into your code. Always use Convex environment variables for all sensitive information.

If the user needs assistance setting up environment variables or deployment, ask them about their specific setup and provide guidance accordingly.

Run `npx convex dev` after setting up the component to generate the necessary types.
```


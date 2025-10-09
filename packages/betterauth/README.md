# @dodopayments/better-auth

A Better Auth plugin for integrating Dodo Payments into your authentication flow.

## Features

- **Automatic Customer Management** - Creates Dodo Payments customers when users sign up
- **Secure Checkout Integration** - Type-safe checkout flows with product slug mapping
- **Modern Checkout Sessions** - Enhanced checkout experience with the latest Dodo Payments API
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
# use the webhook endpoint `/api/auth/dodopayments/webhooks` to generate a webhook secret
# from Dodo Payments Dashboard > Developer > Webhooks
DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret_here 
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
          // Checkout Sessions endpoint is available by default
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

### Creating a Checkout Session (Dynamic Checkout)

```typescript
// Create checkout with customer details
const { data: checkout, error } = await authClient.dodopayments.checkout({
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

### Creating a Modern Checkout Session

You can use the modern checkout sessions API directly; the endpoint is available by default:

```typescript
// Create modern checkout session with enhanced features
const { data: checkoutSession, error } = await authClient.dodopayments.checkout.session({
  // Use either slug OR product_cart. If slug is provided, it will be resolved
  // to a product_id using your checkout configuration.
  // slug: "premium-plan",
  product_cart: [
    {
      product_id: "pdt_xxxxxxxxxxxxxxxxxxxxx", // Your product ID
      quantity: 1,
    },
  ],
  // Note: customer information is auto-filled from the session when available.
  // If omitted and there's no session, you can provide it here; otherwise the
  // hosted checkout will collect it.
  customer: {
    email: "customer@example.com",
    name: "John Doe",
    phone_number: "+1234567890", // Optional
  },
  // Note: billing_address is optional for sessions; if omitted the hosted
  // checkout will capture it from the customer.
  billing_address: {
    street: "123 Market St",
    city: "San Francisco",
    state: "CA",
    country: "US",
    zipcode: "94103",
  },
  return_url: "https://yoursite.com/success",
  allowed_payment_method_types: ["credit", "debit", "apple_pay", "google_pay"],
  billing_currency: "USD",
  show_saved_payment_methods: true,
  discount_code: "SAVE10", // Optional
  metadata: {
    order_id: "order_123",
    campaign: "summer_sale",
  },
  customization: {
    theme: "light", // "light", "dark", or "system"
    show_order_details: true,
    show_on_demand_tag: false,
  },
  feature_flags: {
    allow_currency_selection: true,
    allow_discount_code: true,
    allow_phone_number_collection: true,
    allow_tax_id: false,
    always_create_new_customer: false,
  },
  subscription_data: {
    trial_period_days: 7, // Optional trial period
  },
  referenceId: "order_123", // Optional reference for your records
});

// Redirect to checkout URL
window.location.href = checkoutSession.url;
```

### Accessing Customer Portal

```typescript
// Redirect to customer portal (requires authentication)
const { data: customerPortal, error } =
  await authClient.dodopayments.customer.portal();
if (customerPortal && customerPortal.redirect) {
  window.location.href = customerPortal.url;
}
```

### Listing Customer Data

```typescript
// Get customer's subscriptions
const { data: subscriptions, error } =
  await authClient.dodopayments.customer.subscriptions.list({
    query: {
      limit: 10,
      page: 1,
      active: true, // Filter for active subscriptions only
    },
  });

// Get customer's payment history
const { data: payments, error } =
  await authClient.dodopayments.customer.payments.list({
    query: {
      limit: 10,
      page: 1,
      status: "succeeded", // Filter by payment status
    },
  });
```

## Webhooks

The webhooks plugin handles real-time payment events from Dodo Payments with secure signature verification. If you followed the default better-auth setup, the webhook endpoint will be `/api/auth/dodopayments/webhooks`. Generate a webhook secret for the URL `https://<your-domain>/api/auth/dodopayments/webhooks` and set it in your ENV as follows and use it in the `webhooks` plugin setup.

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

## Prompt for LLMs

```
You are a skilled developer helping to integrate the @dodopayments/better-auth adapter into a typescript web application with better-auth. This adapter enables seamless payment processing through Dodo Payments with automatic customer management, checkout flows, and webhook handling.

STAGE 1: BASIC SETUP

This stage covers the foundational setup needed before implementing any plugins. Complete this stage first.

STEP 1: Installation
Install the required dependencies:
npm install @dodopayments/better-auth dodopayments better-auth zod

STEP 2: Environment Variables Setup
You will need to complete these external setup tasks. You will provide the user with a TODO list for the actions they need to take outside of the code:

TODO LIST FOR USER:
1. Generate Dodo Payments API Key:
   - Go to your Dodo Payments Dashboard > Developer > API Keys
   - Create a new API key (or use existing)
   - Copy the API key value
   - Set environment variable: DODO_PAYMENTS_API_KEY=your_api_key_here

2. Generate Better Auth Secret:
   - Generate a random secret key (32+ characters)
   - Set environment variable: BETTER_AUTH_SECRET=your_better_auth_secret_here

3. Set Application URL:
   - For development: BETTER_AUTH_URL=http://localhost:3000
   - For production: BETTER_AUTH_URL=https://your-domain.com

4. Webhook Secret (only if implementing webhooks plugin):
   - This will be provided after you specify your domain name in Stage 2
   - Set environment variable: DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret_here

Add these environment variables to your .env file:
DODO_PAYMENTS_API_KEY=your_api_key_here
DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret_here
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret_here

STEP 3: Server Configuration
Create or update your better-auth setup file (src/lib/auth.ts):

import { BetterAuth } from "better-auth";
import { dodopayments } from "@dodopayments/better-auth";
import DodoPayments from "dodopayments";

// Create DodoPayments client
export const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode", // Change to "live_mode" for production
});

// Configure better-auth with dodopayments adapter
export const { auth, endpoints, client } = BetterAuth({
  plugins: [
    dodopayments({
      client: dodoPayments,
      createCustomerOnSignUp: true, // Auto-create customers on signup
      use: [], // We'll add plugins here in Stage 2
    }),
  ],
});

STEP 4: Client Configuration
Create or update your auth client file (src/lib/auth-client.ts):

import { createAuthClient } from "better-auth/react";
import { dodopaymentsClient } from "@dodopayments/better-auth";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [dodopaymentsClient()],
});

STAGE 2: PLUGIN IMPLEMENTATION

After completing Stage 1, you can selectively implement any of these plugins based on your needs. Each plugin is independent and can be added or removed as needed.

PLUGIN SELECTION:
Before implementing any plugins, ask the user which plugins they want to implement:

"Which plugins would you like to implement? You can choose any combination of:
1. CHECKOUT - Enables secure payment processing and checkout flows
2. PORTAL - Provides customer self-service portal for subscriptions and payments
3. WEBHOOKS - Handles real-time payment events from Dodo Payments

Please specify which plugins you want (e.g., 'checkout and webhooks', 'all three', 'just portal', etc.)"

If the user doesn't respond or you cannot prompt the user, implement all three plugins by default.

Based on the user's selection, implement only the requested plugins from the sections below:

CHECKOUT PLUGIN

Purpose: Enables secure payment processing with product slug mapping and session integration.

SETUP TODO LIST FOR USER:
1. Create products in Dodo Payments Dashboard:
   - Go to Dodo Payments Dashboard > Products
   - Create your products (e.g., subscription plans, one-time purchases)
   - Copy each product ID (starts with "pdt_")
   - Note down the product names for creating friendly slugs

2. Plan your checkout URLs:
   - Decide on your success URL (e.g., "/dashboard/success", "/thank-you")
   - Ensure this URL exists in your application

Configuration:
Add checkout to your imports in src/lib/auth.ts:
import { dodopayments, checkout } from "@dodopayments/better-auth";

Add checkout plugin to the use array in your dodopayments configuration:
use: [
  checkout({
    products: [
      {
        productId: "pdt_xxxxxxxxxxxxxxxxxxxxx", // Your actual product ID from Dodo Payments
        slug: "premium-plan", // Friendly slug for checkout
      },
      // Add more products as needed
    ],
    successUrl: "/dashboard/success", // Your success page URL
    authenticatedUsersOnly: true, // Require login for checkout
  }),
],

Usage Example:
const { data: checkout, error } = await authClient.dodopayments.checkout({
  slug: "premium-plan", // Use the slug from your configuration
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
  referenceId: "order_123", // Optional reference
});

if (checkout) {
  window.location.href = checkout.url;
}

Options:
- products: Array of products or async function returning products
- successUrl: URL to redirect after successful payment
- authenticatedUsersOnly: Require user authentication (default: false)

PORTAL PLUGIN

Purpose: Provides customer self-service capabilities for managing subscriptions and viewing payment history.

Configuration:
Add portal to your imports in src/lib/auth.ts:
import { dodopayments, portal } from "@dodopayments/better-auth";

Add portal plugin to the use array in your dodopayments configuration:
use: [
  portal(),
],

Usage Examples:
// Access customer portal
const { data: customerPortal, error } = await authClient.dodopayments.customer.portal();
if (customerPortal && customerPortal.redirect) {
  window.location.href = customerPortal.url;
}

// List customer subscriptions
const { data: subscriptions, error } = await authClient.dodopayments.customer.subscriptions.list({
  query: {
    limit: 10,
    page: 1,
    active: true,
  },
});

// List customer payments
const { data: payments, error } = await authClient.dodopayments.customer.payments.list({
  query: {
    limit: 10,
    page: 1,
    status: "succeeded",
  },
});

Note: All portal methods require user authentication.

WEBHOOKS PLUGIN

Purpose: Handles real-time payment events from Dodo Payments with secure signature verification.

BEFORE CONFIGURATION - Setup Webhook URL:
First, you need the user's domain name to generate the webhook URL and provide them with setup instructions.

STEP 1: Domain Name Input
Ask the user: What is your domain name? Please provide:
- For production: your domain name (e.g., "myapp.com", "api.mycompany.com")
- For staging: your staging domain (e.g., "staging.myapp.com")
- For development: use "localhost:3000" (or your local port)

STEP 2: After receiving the user's domain name, you will:
- Generate their webhook URL: https://[USER-DOMAIN]/api/auth/dodopayments/webhooks
- Provide them with a TODO list for webhook setup in Dodo Payments dashboard
- Give them the exact environment variable setup instructions

WEBHOOK SETUP TODO LIST (provide this after domain input):
1. Configure webhook in Dodo Payments Dashboard:
   - Go to Dodo Payments Dashboard > Developer > Webhooks
   - Click "Add Webhook" or "Create Webhook"
   - Enter webhook URL: https://[USER-DOMAIN]/api/auth/dodopayments/webhooks
   - Select events you want to receive (or select all)
   - Copy the generated webhook secret

2. Set webhook secret in your environment:
   - For production: Set DODO_PAYMENTS_WEBHOOK_SECRET in your hosting provider environment
   - For staging: Set DODO_PAYMENTS_WEBHOOK_SECRET in your staging environment
   - For development: Add DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret_here to your .env file

3. Deploy your application with the webhook secret configured

STEP 3: Add webhooks to your imports in src/lib/auth.ts:
import { dodopayments, webhooks } from "@dodopayments/better-auth";

STEP 4: Add webhooks plugin to the use array in your dodopayments configuration:
use: [
  webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
    // Generic handler for all webhook events
    onPayload: async (payload) => {
      console.log("Received webhook:", payload.event_type);
    },
    // Payment event handlers
    onPaymentSucceeded: async (payload) => {
      console.log("Payment succeeded:", payload);
    },
    onPaymentFailed: async (payload) => {
      console.log("Payment failed:", payload);
    },
    onPaymentProcessing: async (payload) => {
      console.log("Payment processing:", payload);
    },
    onPaymentCancelled: async (payload) => {
      console.log("Payment cancelled:", payload);
    },
    // Refund event handlers
    onRefundSucceeded: async (payload) => {
      console.log("Refund succeeded:", payload);
    },
    onRefundFailed: async (payload) => {
      console.log("Refund failed:", payload);
    },
    // Dispute event handlers
    onDisputeOpened: async (payload) => {
      console.log("Dispute opened:", payload);
    },
    onDisputeExpired: async (payload) => {
      console.log("Dispute expired:", payload);
    },
    onDisputeAccepted: async (payload) => {
      console.log("Dispute accepted:", payload);
    },
    onDisputeCancelled: async (payload) => {
      console.log("Dispute cancelled:", payload);
    },
    onDisputeChallenged: async (payload) => {
      console.log("Dispute challenged:", payload);
    },
    onDisputeWon: async (payload) => {
      console.log("Dispute won:", payload);
    },
    onDisputeLost: async (payload) => {
      console.log("Dispute lost:", payload);
    },
    // Subscription event handlers
    onSubscriptionActive: async (payload) => {
      console.log("Subscription active:", payload);
    },
    onSubscriptionOnHold: async (payload) => {
      console.log("Subscription on hold:", payload);
    },
    onSubscriptionRenewed: async (payload) => {
      console.log("Subscription renewed:", payload);
    },
    onSubscriptionPaused: async (payload) => {
      console.log("Subscription paused:", payload);
    },
    onSubscriptionPlanChanged: async (payload) => {
      console.log("Subscription plan changed:", payload);
    },
    onSubscriptionCancelled: async (payload) => {
      console.log("Subscription cancelled:", payload);
    },
    onSubscriptionFailed: async (payload) => {
      console.log("Subscription failed:", payload);
    },
    onSubscriptionExpired: async (payload) => {
      console.log("Subscription expired:", payload);
    },
    // License key event handlers
    onLicenseKeyCreated: async (payload) => {
      console.log("License key created:", payload);
    },
  }),
],

Supported Webhook Event Handlers:
- onPayload: Generic handler for all webhook events
- onPaymentSucceeded: Payment completed successfully
- onPaymentFailed: Payment failed
- onPaymentProcessing: Payment is being processed
- onPaymentCancelled: Payment was cancelled
- onRefundSucceeded: Refund completed successfully
- onRefundFailed: Refund failed
- onDisputeOpened: Dispute was opened
- onDisputeExpired: Dispute expired
- onDisputeAccepted: Dispute was accepted
- onDisputeCancelled: Dispute was cancelled
- onDisputeChallenged: Dispute was challenged
- onDisputeWon: Dispute was won
- onDisputeLost: Dispute was lost
- onSubscriptionActive: Subscription became active
- onSubscriptionOnHold: Subscription was put on hold
- onSubscriptionRenewed: Subscription was renewed
- onSubscriptionPaused: Subscription was paused
- onSubscriptionPlanChanged: Subscription plan was changed
- onSubscriptionCancelled: Subscription was cancelled
- onSubscriptionFailed: Subscription failed
- onSubscriptionExpired: Subscription expired
- onLicenseKeyCreated: License key was created

COMBINING SELECTED PLUGINS:

After implementing the user's selected plugins, update your src/lib/auth.ts file to include all chosen plugins in the imports and use array:

Example for all three plugins:
import { dodopayments, checkout, portal, webhooks } from "@dodopayments/better-auth";

use: [
  checkout({
    // checkout configuration
  }),
  portal(),
  webhooks({
    // webhook configuration
  }),
],

Example for just checkout and portal:
import { dodopayments, checkout, portal } from "@dodopayments/better-auth";

use: [
  checkout({
    // checkout configuration
  }),
  portal(),
],

Example for just webhooks:
import { dodopayments, webhooks } from "@dodopayments/better-auth";

use: [
  webhooks({
    // webhook configuration
  }),
],

IMPORTANT NOTES:
1. Complete Stage 1 before implementing any plugins
2. Ask the user which plugins they want to implement, or implement all three if no response
3. Only implement the plugins the user specifically requested
4. ALWAYS provide TODO lists for external actions the user needs to complete:
   - API key generation and environment variable setup
   - Product creation in Dodo Payments dashboard (for checkout plugin)
   - Webhook setup in Dodo Payments dashboard (for webhooks plugin)
   - Domain name collection for webhook URL generation
5. For webhook plugin: Ask for the user's domain name and generate the exact webhook URL: https://[user-domain]/api/auth/dodopayments/webhooks
6. All client methods return { data, error } objects for proper error handling
7. Use test_mode for development and live_mode for production
8. The webhook endpoint is automatically created and secured with signature verification (if webhooks plugin is selected)
9. Customer portal and subscription listing require user authentication (if portal plugin is selected)
10. Handle errors appropriately and test webhook functionality in development before going live
11. Present all external setup tasks as clear TODO lists with specific environment variable names
```

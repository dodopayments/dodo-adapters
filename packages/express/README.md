# `@dodo/express`

> For AI Agents, see [llm-prompt.txt](llm-prompt.txt)

A typescript library that exports middleware functions for Checkout, Customer Portal, and Webhook routes for easy integration with your Express.js app.

## Installation

You can install this package via npm or any other package manager of your choice:

```bash
npm install @dodo/express zod express
```

## Quick Start

All the examples below assume you're using Express.js with TypeScript support.

### 1. Checkout Route Handler

```typescript
// routes/checkout.ts
import { Router } from "express";
import { Checkout } from "@dodo/express";

const router = Router();

router.get(
  "/checkout",
  Checkout({
    // Can be omitted if DODO_PAYMENTS_API_KEY environment variable is set.
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    // URL to redirect to after successful checkout, can be omitted.
    successUrl: process.env.SUCCESS_URL!,
    // Omit or set to "live_mode" for production
    environment: "test_mode",
  }),
);

export default router;
```

#### Query Parameters

The checkout route supports the following query parameters:

- `productId` - Product identifier (required, e.g., `?productId=pdt_nZuwz45WAs64n3l07zpQR`)
- `quantity` - Quantity of the product (optional, e.g., `?quantity=1`)

**Customer Fields (optional):**

- `fullName` - Customer's full name (e.g., `?fullName=John%20Doe`)
- `firstName` - Customer's first name (e.g., `?firstName=John`)
- `lastName` - Customer's last name (e.g., `?lastName=Doe`)
- `email` - Customer's email address (e.g., `?email=john.doe@example.com`)
- `country` - Customer's country (e.g., `?country=US`)
- `addressLine` - Customer's address line (e.g., `?addressLine=123%20Main%20St`)
- `city` - Customer's city (e.g., `?city=Anytown`)
- `state` - Customer's state/province (e.g., `?state=CA`)
- `zipCode` - Customer's zip/postal code (e.g., `?zipCode=90210`)

**Disable Flags (optional, set to `true` to disable):**

- `disableFullName` - Disable full name field (e.g., `?disableFullName=true`)
- `disableFirstName` - Disable first name field (e.g., `?disableFirstName=true`)
- `disableLastName` - Disable last name field (e.g., `?disableLastName=true`)
- `disableEmail` - Disable email field (e.g., `?disableEmail=true`)
- `disableCountry` - Disable country field (e.g., `?disableCountry=true`)
- `disableAddressLine` - Disable address line field (e.g., `?disableAddressLine=true`)
- `disableCity` - Disable city field (e.g., `?disableCity=true`)
- `disableState` - Disable state field (e.g., `?disableState=true`)
- `disableZipCode` - Disable zip code field (e.g., `?disableZipCode=true`)

**Advanced Controls (optional):**

- `paymentCurrency` - Specify the payment currency (e.g., `?paymentCurrency=USD`)
- `showCurrencySelector` - Show currency selector (e.g., `?showCurrencySelector=true`)
- `paymentAmount` - Specify the payment amount (e.g., `?paymentAmount=1000` for $10.00)
- `showDiscounts` - Show discount fields (e.g., `?showDiscounts=true`)

**Metadata (optional):**
Any query parameter starting with `metadata_` will be passed as metadata to the checkout.
(e.g., `?metadata_userId=abc123&metadata_campaign=summer_sale`)

If the `productId` is missing, the handler will return a 400 response. Invalid query parameters will also result in a 400 response.

### 2. Customer Portal Route Handler

```typescript
// routes/customer-portal.ts
import { Router, Request } from "express";
import { CustomerPortal } from "@dodo/express";

const router = Router();

router.get(
  "/customer-portal",
  CustomerPortal({
    // Can be omitted if DODO_PAYMENTS_API_KEY environment variable is set.
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    // Omit or set to "live_mode" for production
    environment: "test_mode",
    // Write logic to get customerId from request here
    getCustomerId: async (req: Request) => {
      // Example: get customer ID from JWT token, session, or database
      // return await getCustomerIdFromAuth(req);
      return ""; // Replace with your implementation
    },
  }),
);

export default router;
```

### 3. Webhook Route Handler

```typescript
// routes/webhooks.ts
import { Router, raw } from "express";
import { Webhooks } from "@dodo/express";
import { WebhookPayload } from "@dodo/core";

const router = Router();

// Important: Use raw middleware to preserve the original request body
router.use("/webhook/dodo-payments", raw({ type: "application/json" }));

router.post(
  "/webhook/dodo-payments",
  Webhooks({
    webhookKey: process.env.DODO_WEBHOOK_SECRET!,
    onPayload: async (payload: WebhookPayload) => {
      // handle the payload
      console.log("Received webhook:", payload);
    },
    // ... other event handlers for granular control
  }),
);

export default router;
```

#### Important: Raw Body Middleware

For webhook verification to work properly, you must use the `raw` middleware to preserve the original request body. This is crucial for webhook signature verification.

```typescript
import express, { raw } from "express";

const app = express();

// Use raw middleware specifically for webhook routes
app.use("/webhook", raw({ type: "application/json" }));

// Use json middleware for other routes
app.use(express.json());
```

#### Supported Webhook Event Handlers

The `Webhooks` function accepts an object with various `onEventName` properties, where `EventName` corresponds to the type of webhook event. Each handler is an `async` function that receives the parsed payload for that specific event type. Below is a comprehensive list of all supported event handlers with their function signatures:

- `onPayload?: (payload: WebhookPayload) => Promise<void>;`
- `onPaymentSucceeded?: (payload: WebhookPayload) => Promise<void>;`
- `onPaymentFailed?: (payload: WebhookPayload) => Promise<void>;`
- `onPaymentProcessing?: (payload: WebhookPayload) => Promise<void>;`
- `onPaymentCancelled?: (payload: WebhookPayload) => Promise<void>;`
- `onRefundSucceeded?: (payload: WebhookPayload) => Promise<void>;`
- `onRefundFailed?: (payload: WebhookPayload) => Promise<void>;`
- `onDisputeOpened?: (payload: WebhookPayload) => Promise<void>;`
- `onDisputeExpired?: (payload: WebhookPayload) => Promise<void>;`
- `onDisputeAccepted?: (payload: WebhookPayload) => Promise<void>;`
- `onDisputeCancelled?: (payload: WebhookPayload) => Promise<void>;`
- `onDisputeChallenged?: (payload: WebhookPayload) => Promise<void>;`
- `onDisputeWon?: (payload: WebhookPayload) => Promise<void>;`
- `onDisputeLost?: (payload: WebhookPayload) => Promise<void>;`
- `onSubscriptionActive?: (payload: WebhookPayload) => Promise<void>;`
- `onSubscriptionOnHold?: (payload: WebhookPayload) => Promise<void>;`
- `onSubscriptionRenewed?: (payload: WebhookPayload) => Promise<void>;`
- `onSubscriptionPaused?: (payload: WebhookPayload) => Promise<void>;`
- `onSubscriptionPlanChanged?: (payload: WebhookPayload) => Promise<void>;`
- `onSubscriptionCancelled?: (payload: WebhookPayload) => Promise<void>;`
- `onSubscriptionFailed?: (payload: WebhookPayload) => Promise<void>;`
- `onSubscriptionExpired?: (payload: WebhookPayload) => Promise<void>;`
- `onLicenseKeyCreated?: (payload: WebhookPayload) => Promise<void>;`

### Complete Express.js Integration Example

Here's a complete example of how to integrate all the handlers into your Express.js application:

```typescript
// app.ts
import express, { raw } from "express";
import { Checkout, CustomerPortal, Webhooks } from "@dodo/express";
import { WebhookPayload } from "@dodo/core";

const app = express();

// Raw middleware for webhook routes (must come before json middleware)
app.use("/api/webhook", raw({ type: "application/json" }));

// JSON middleware for other routes
app.use(express.json());

// Checkout route
app.get(
  "/checkout",
  Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    successUrl: process.env.SUCCESS_URL,
    environment: "test_mode",
  }),
);

// Customer portal route
app.get(
  "/customer-portal",
  CustomerPortal({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: "test_mode",
    getCustomerId: async (req) => {
      // Your authentication logic here
      return "customer_id";
    },
  }),
);

// Webhook route
app.post(
  "/api/webhook/dodo-payments",
  Webhooks({
    webhookKey: process.env.DODO_WEBHOOK_SECRET!,
    onPayload: async (payload: WebhookPayload) => {
      console.log("Received webhook:", payload);
    },
    onPaymentSucceeded: async (payload: WebhookPayload) => {
      console.log("Payment succeeded:", payload);
    },
  }),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Development

This library is built with:

- **TypeScript** - Type safety and better developer experience
- **tsup** - Fast TypeScript bundler

To build this package, install the turborepo cli and run:

```bash
turbo run build --filter=@dodo/express
```

To run in development mode:

```bash
turbo run dev --filter=@dodo/express
```

## Environment Variables

You can set `DODO_PAYMENTS_API_KEY` environment variable to use your API key and omit the `bearerToken` parameter.

```env
DODO_PAYMENTS_API_KEY=your-api-key
DODO_WEBHOOK_SECRET=your-webhook-secret
SUCCESS_URL=https://yourapp.com/success
```

## TypeScript Support

This package includes full TypeScript support with type definitions for all functions and configurations. Make sure to install the required peer dependencies:

```bash
npm install @types/express --save-dev
```

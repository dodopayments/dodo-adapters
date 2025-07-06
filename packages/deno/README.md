# `@dodo/deno`

> For AI Agents, see [llm-prompt.txt](llm-prompt.txt)

A TypeScript library that exports request handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your Deno application.

## Installation

You can install this package via npm, or import it directly using Deno's import maps:

```bash
npm install @dodo/deno zod standardwebhooks
```

Or with Deno import maps (`deno.json`):

```json
{
  "imports": {
    "@dodo/deno": "npm:@dodo/deno",
    "zod": "npm:zod",
    "standardwebhooks": "npm:standardwebhooks"
  }
}
```

## Quick Start

All examples below assume you're using Deno with the standard HTTP server.

### 1. Checkout Request Handler

```typescript
// routes/checkout.ts
import { Checkout } from "@dodo/deno";

const checkoutHandler = Checkout({
  // Can be omitted if DODO_PAYMENTS_API_KEY environment variable is set.
  bearerToken: Deno.env.get("DODO_PAYMENTS_API_KEY")!,
  // URL to redirect to after successful checkout, can be omitted.
  successUrl: Deno.env.get("SUCCESS_URL")!,
  // Omit or set to "live_mode" for production
  environment: "test_mode",
});

// Using with Deno's built-in HTTP server
Deno.serve({ port: 8000 }, async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/checkout") {
    return await checkoutHandler(req);
  }

  return new Response("Not Found", { status: 404 });
});
```

Or with Fresh framework:

```typescript
// routes/checkout.ts
import { Handlers } from "$fresh/server.ts";
import { Checkout } from "@dodo/deno";

const checkoutHandler = Checkout({
  bearerToken: Deno.env.get("DODO_PAYMENTS_API_KEY")!,
  successUrl: Deno.env.get("SUCCESS_URL")!,
  environment: "test_mode",
});

export const handler: Handlers = {
  GET: checkoutHandler,
};
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

### 2. Customer Portal Request Handler

```typescript
// routes/customer-portal.ts
import { CustomerPortal } from "@dodo/deno";

const customerPortalHandler = CustomerPortal({
  // Can be omitted if DODO_PAYMENTS_API_KEY environment variable is set.
  bearerToken: Deno.env.get("DODO_PAYMENTS_API_KEY")!,
  // Omit or set to "live_mode" for production
  environment: "test_mode",
  // Write logic to get customerId from request here
  getCustomerId: async (req: Request) => {
    // Example: Extract customer ID from authentication token or session
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Your authentication logic here
    // This is just an example - implement your actual auth logic
    const token = authHeader.replace("Bearer ", "");
    const customerId = await validateTokenAndGetCustomerId(token);
    return customerId;
  },
});

// Using with Deno's built-in HTTP server
Deno.serve({ port: 8000 }, async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/customer-portal") {
    return await customerPortalHandler(req);
  }

  return new Response("Not Found", { status: 404 });
});
```

### 3. Webhook Request Handler

```typescript
// routes/webhook.ts
import { Webhooks } from "@dodo/deno";
import { WebhookPayload } from "@dodo/core";

const webhookHandler = Webhooks({
  webhookKey: Deno.env.get("DODO_WEBHOOK_SECRET")!,
  onPayload: async (payload: WebhookPayload) => {
    // Handle the payload
    console.log("Received webhook:", payload);
  },
  // ... other event handlers for granular control
});

// Using with Deno's built-in HTTP server
Deno.serve({ port: 8000 }, async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/api/webhook/dodo-payments") {
    return await webhookHandler(req);
  }

  return new Response("Not Found", { status: 404 });
});
```

Or with Fresh framework:

```typescript
// routes/api/webhook/dodo-payments.ts
import { Handlers } from "$fresh/server.ts";
import { Webhooks } from "@dodo/deno";
import { WebhookPayload } from "@dodo/core";

const webhookHandler = Webhooks({
  webhookKey: Deno.env.get("DODO_WEBHOOK_SECRET")!,
  onPayload: async (payload: WebhookPayload) => {
    console.log("Received webhook:", payload);
  },
});

export const handler: Handlers = {
  POST: webhookHandler,
};
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

## Deno-Specific Features

### Permissions

The Deno adapter requires the following permissions:

- `--allow-net` - For making HTTP requests to Dodo Payments API
- `--allow-env` - For reading environment variables (API keys, secrets)

Example run command:

```bash
deno run --allow-net --allow-env main.ts
```

### Environment Variables

Set up the following environment variables in your Deno deployment:

```bash
# Required for Checkout and Customer Portal
DODO_PAYMENTS_API_KEY=your-api-key

# Optional for Checkout
SUCCESS_URL=https://your-site.com/success

# Required for Webhooks
DODO_WEBHOOK_SECRET=your-webhook-secret
```

### Deno Deploy

For Deno Deploy, you can set environment variables in the dashboard:

1. Go to your Deno Deploy project
2. Navigate to Settings > Environment Variables
3. Add your environment variables:
   - `DODO_PAYMENTS_API_KEY`
   - `SUCCESS_URL` (optional)
   - `DODO_WEBHOOK_SECRET`

### Fresh Framework Integration

If you're using Fresh, you can create route handlers as shown in the examples above. The handlers work seamlessly with Fresh's routing system.

### Oak Framework Integration

```typescript
// main.ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Checkout, CustomerPortal, Webhooks } from "@dodo/deno";

const router = new Router();

const checkoutHandler = Checkout({
  bearerToken: Deno.env.get("DODO_PAYMENTS_API_KEY")!,
  environment: "test_mode",
});

const customerPortalHandler = CustomerPortal({
  bearerToken: Deno.env.get("DODO_PAYMENTS_API_KEY")!,
  environment: "test_mode",
  getCustomerId: async (req) => {
    // Your auth logic here
    return "customer_id";
  },
});

const webhookHandler = Webhooks({
  webhookKey: Deno.env.get("DODO_WEBHOOK_SECRET")!,
  onPayload: async (payload) => {
    console.log("Webhook received:", payload);
  },
});

router.get("/checkout", async (context) => {
  const response = await checkoutHandler(context.request.originalRequest);
  context.response = response;
});

router.get("/customer-portal", async (context) => {
  const response = await customerPortalHandler(context.request.originalRequest);
  context.response = response;
});

router.post("/api/webhook/dodo-payments", async (context) => {
  const response = await webhookHandler(context.request.originalRequest);
  context.response = response;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
```

## Development

This library is built with:

- **TypeScript** - Type safety and better developer experience
- **Deno** - Secure runtime for JavaScript and TypeScript
- **tsup** - Fast TypeScript bundler for npm compatibility

To build this package:

```bash
deno run --allow-read --allow-write build.ts
```

To run in development mode:

```bash
deno run --allow-read --allow-write --watch build.ts
```

## Environment Variables

You can set `DODO_PAYMENTS_API_KEY` environment variable to use your API key and omit the `bearerToken` parameter.

```bash
export DODO_PAYMENTS_API_KEY=your-api-key
export DODO_WEBHOOK_SECRET=your-webhook-secret
export SUCCESS_URL=https://your-site.com/success
```

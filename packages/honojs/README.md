# `@dodo/honojs`

> For AI Agents, see [llm-prompt.txt](llm-prompt.txt)

A TypeScript library that exports handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your Hono.js app.

## Installation

You can install this package via npm, yarn, or bun:

```bash
npm install @dodo/honojs zod hono
```

**Using Bun (Recommended for fast development):**

```bash
bun add @dodo/honojs zod hono
```

## Quick Start

All the examples below assume you're using Hono.js for your API routes.

### 1. Checkout Route Handler

```typescript
// routes/checkout.ts
import { Hono } from "hono";
import { Checkout } from "@dodo/honojs";

const app = new Hono();

app.get("/checkout", Checkout({
  // Can be omitted if DODO_PAYMENTS_API_KEY environment variable is set.
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  // URL to redirect to after successful checkout, can be omitted.
  successUrl: process.env.SUCCESS_URL!,
  // Omit or set to "live_mode" for production
  environment: "test_mode",
}));

export default app;
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
import { Hono } from "hono";
import { CustomerPortal } from "@dodo/honojs";

const app = new Hono();

app.get("/customer-portal", CustomerPortal({
  // Can be omitted if DODO_PAYMENTS_API_KEY environment variable is set.
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  // Omit or set to "live_mode" for production
  environment: "test_mode",
  // Write logic to get customerId from Hono.js context here
  getCustomerId: async (c) => {
    // Example: Extract customer ID from JWT token or session
    // return c.get("customerId") || "";
    return "";
  },
}));

export default app;
```

### 3. Webhook Route Handler

```typescript
// routes/webhook.ts
import { Hono } from "hono";
import { Webhooks } from "@dodo/honojs";
import { WebhookPayload } from "@dodo/core";

const app = new Hono();

app.post("/webhook/dodo-payments", Webhooks({
  webhookKey: process.env.DODO_WEBHOOK_SECRET!,
  onPayload: async (payload: WebhookPayload) => {
    // handle the payload
    console.log("Received webhook:", payload);
  },
  // ... other event handlers for granular control
}));

export default app;
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

### 4. Complete Hono.js App Example

```typescript
// main.ts
import { Hono } from "hono";
import { Checkout, CustomerPortal, Webhooks } from "@dodo/honojs";
import { WebhookPayload } from "@dodo/core";

const app = new Hono();

// Checkout route
app.get("/checkout", Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  successUrl: process.env.SUCCESS_URL!,
  environment: "test_mode",
}));

// Customer portal route
app.get("/customer-portal", CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode",
  getCustomerId: async (c) => {
    // Implement your customer ID extraction logic here
    return c.get("customerId") || "";
  },
}));

// Webhook route
app.post("/webhook/dodo-payments", Webhooks({
  webhookKey: process.env.DODO_WEBHOOK_SECRET!,
  onPayload: async (payload: WebhookPayload) => {
    console.log("Received webhook:", payload);
  },
  onPaymentSucceeded: async (payload) => {
    console.log("Payment succeeded:", payload.data.payment_id);
  },
}));

export default app;
```

## Development with Bun

Bun provides excellent performance for TypeScript development. Here's how to set up your project with Bun:

### Project Setup

```bash
bun init
bun add @dodo/honojs hono zod
bun add -d @types/bun
```

### Development Server

```bash
bun run dev
```

### Running Tests

```bash
bun test
```

### Building for Production

```bash
bun build ./main.ts --outdir ./dist
```

### Example `bun.lockb` Integration

When you use `bun add`, it automatically creates a `bun.lockb` file for faster dependency resolution. This provides:

- **Faster installs**: Up to 100x faster than npm
- **Smaller disk usage**: More efficient dependency storage
- **Better security**: Built-in integrity checking

## Development

This library is built with:

- **TypeScript** - Type safety and better developer experience
- **tsup** - Fast TypeScript bundler
- **Hono.js** - Lightweight and ultrafast web framework

To build this package, install the turborepo cli and run:

```bash
turbo run build --filter=@dodo/honojs
```

To run in development mode:

```bash
turbo run dev --filter=@dodo/honojs
```

### Using with Bun in Monorepo

If you're using Bun in a monorepo setup:

```bash
bun install
bun run build --filter=@dodo/honojs
```

## Environment Variables

You can set `DODO_PAYMENTS_API_KEY` environment variable to use your API key and omit the `bearerToken` parameter.

```env
DODO_PAYMENTS_API_KEY=your-api-key
SUCCESS_URL=https://yourapp.com/success
DODO_WEBHOOK_SECRET=your-webhook-secret
```

## Key Differences from Next.js Adapter

The Hono.js adapter is designed to work seamlessly with Hono.js's lightweight architecture:

1. **Context Parameter**: Uses Hono.js `Context` instead of Next.js `NextRequest`
2. **Response Handling**: Uses Hono.js response methods like `c.text()` and `c.redirect()`
3. **Header Processing**: Adapted to work with Hono.js header format
4. **Framework Agnostic**: Can be deployed on any runtime that supports Hono.js (Bun, Cloudflare Workers, etc.)

## Deployment

### Bun Runtime

```bash
bun build ./main.ts --outdir ./dist
bun run ./dist/main.js
```

### Cloudflare Workers

```bash
npm run build
wrangler publish
```

### Node.js

```bash
npm run build
node ./dist/main.js
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

This project is licensed under the MIT License.
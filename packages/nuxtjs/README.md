# `@dodo/nuxtjs`

> For AI Agents, see [llm-prompt.txt](llm-prompt.txt)

A TypeScript library that exports event handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your Nuxt.js app using Nitro's server engine.

## Installation

You can install this package via npm or any other package manager of your choice:

```bash
npm install @dodo/nuxtjs zod
```

## Quick Start

All the examples below assume you're using Nuxt.js 3+ with server-side routes.

### 1. Checkout Route Handler

```typescript
// server/api/checkout.get.ts
import { Checkout } from "@dodo/nuxtjs";

export default Checkout({
  // Can be omitted if DODO_PAYMENTS_API_KEY environment variable is set.
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  // URL to redirect to after successful checkout, can be omitted.
  successUrl: process.env.SUCCESS_URL!,
  // Omit or set to "live_mode" for production
  environment: "test_mode",
});
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
// server/api/customer-portal.get.ts
import { CustomerPortal } from "@dodo/nuxtjs";
import { H3Event } from "h3";

export default CustomerPortal({
  // Can be omitted if DODO_PAYMENTS_API_KEY environment variable is set.
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  // Omit or set to "live_mode" for production
  environment: "test_mode",
  // Write logic to get customerId from event here
  getCustomerId: async (event: H3Event) => {
    // Example: get customer ID from session, JWT token, or database
    // const session = await getSession(event);
    // return session.customerId;
    return ""; // Replace with your customer ID logic
  },
});
```

### 3. Webhook Route Handler

```typescript
// server/api/webhook/dodo-payments.post.ts
import { Webhooks } from "@dodo/nuxtjs";
import { WebhookPayload } from "@dodo/core";

export default Webhooks({
  webhookKey: process.env.DODO_WEBHOOK_SECRET!,
  onPayload: async (payload: WebhookPayload) => {
    // handle the payload
    console.log("Received webhook:", payload);
  },
  // ... other event handlers for granular control
});
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

## Nuxt.js Integration Notes

### Server Routes

All examples use Nuxt.js 3+ server routes under the `server/api/` directory:

- `server/api/checkout.get.ts` - Handles GET requests to `/api/checkout`
- `server/api/customer-portal.get.ts` - Handles GET requests to `/api/customer-portal`
- `server/api/webhook/dodo-payments.post.ts` - Handles POST requests to `/api/webhook/dodo-payments`

### H3 Event Handler

The adapter uses Nitro's H3 event system. Each handler function receives an `H3Event` object which provides access to:

- Request query parameters via `getQuery(event)`
- Request headers via `getHeaders(event)`
- Request body via `readBody(event)`
- Response utilities like `sendRedirect(event, url)` and `createError(options)`

### Error Handling

The adapter uses H3's `createError` function for consistent error handling:

```typescript
throw createError({
  statusCode: 400,
  statusMessage: "Invalid request parameters",
});
```

## Development

This library is built with:

- **TypeScript** - Type safety and better developer experience
- **tsup** - Fast TypeScript bundler
- **H3** - Nitro's server engine for event handling

To build this package, install the turborepo cli and run:

```bash
turbo run build --filter=@dodo/nuxtjs
```

To run in development mode:

```bash
turbo run dev --filter=@dodo/nuxtjs
```

## Environment Variables

You can set `DODO_PAYMENTS_API_KEY` environment variable to use your API key and omit the `bearerToken` parameter.

```env
DODO_PAYMENTS_API_KEY=your-api-key
```

## Dependencies

This package depends on:

- **@dodo/core** - Core functionality and schemas
- **Nuxt.js 3+** - For server-side routes
- **Nitro** - Nuxt's server engine
- **Zod** - Runtime type validation

## Differences from Next.js Adapter

- Uses H3 event handlers instead of Next.js Request/Response objects
- Server routes are placed in `server/api/` directory
- Uses Nitro's error handling system with `createError`
- Event object provides unified access to request data
- Built-in TypeScript support for H3 events

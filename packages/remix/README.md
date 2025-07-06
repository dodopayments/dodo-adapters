# `@dodo/remix`

> For AI Agents, see [llm-prompt.txt](llm-prompt.txt)

A typescript library that exports handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your Remix app.

## Installation

You can install this package via npm or any other package manager of your choice:

```bash
npm install @dodo/remix zod @remix-run/server-runtime
```

## Quick Start

All the examples below assume you're using Remix with standard routing.

### 1. Checkout Route Handler

```typescript
// app/routes/checkout.ts
import { Checkout } from "@dodo/remix";
import { LoaderFunctionArgs } from "@remix-run/server-runtime";

export const loader = Checkout({
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

If the `productId` is missing, the handler will throw a 400 response. Invalid query parameters will also result in a 400 response.

### 2. Customer Portal Route Handler

```typescript
// app/routes/customer-portal.ts
import { CustomerPortal } from "@dodo/remix";
import { LoaderFunctionArgs } from "@remix-run/server-runtime";

export const loader = CustomerPortal({
  // Can be omitted if DODO_PAYMENTS_API_KEY environment variable is set.
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  // Omit or set to "live_mode" for production
  environment: "test_mode",
  // Write logic to get customerId from request here
  getCustomerId: async (request: Request) => {
    // Example: get customer ID from session, auth token, etc.
    // const session = await getSession(request.headers.get("Cookie"));
    // return session.customerId;
    return ""; // Replace with your logic
  },
});
```

### 3. Webhook Route Handler

```typescript
// app/routes/api.webhook.dodo-payments.ts
import { Webhooks } from "@dodo/remix";
import { WebhookPayload } from "@dodo/core";
import { ActionFunctionArgs } from "@remix-run/server-runtime";

export const action = Webhooks({
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

## Development

This library is built with:

- **TypeScript** - Type safety and better developer experience
- **tsup** - Fast TypeScript bundler

To build this package, install the turborepo cli and run:

```bash
turbo run build --filter=@dodo/remix
```

To run in development mode:

```bash
turbo run dev --filter=@dodo/remix
```

## Environment Variables

You can set `DODO_PAYMENTS_API_KEY` environment variable to use your API key and omit the `bearerToken` parameter.

```env
DODO_PAYMENTS_API_KEY=your-api-key
```

## Remix Routing

This adapter is designed to work with Remix's file-based routing system. The examples above show the recommended file structure:

- **Checkout**: `app/routes/checkout.ts` - Creates a `/checkout` route
- **Customer Portal**: `app/routes/customer-portal.ts` - Creates a `/customer-portal` route
- **Webhooks**: `app/routes/api.webhook.dodo-payments.ts` - Creates a `/api/webhook/dodo-payments` route

You can customize these paths by placing the files in different locations according to your routing needs.

## Key Differences from Next.js

- Uses Remix's `loader` functions for GET requests instead of Next.js route handlers
- Uses Remix's `action` functions for POST requests instead of Next.js route handlers
- Throws responses using `throw new Response()` instead of returning them
- Uses `throw redirect()` instead of `redirect()` for redirects
- Request headers are accessed directly from the Request object instead of Next.js headers helper

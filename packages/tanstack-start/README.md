# `@dodo/tanstack-start`

> For AI Agents, see [llm-prompt.txt](llm-prompt.txt)

A typescript library that exports Handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your TanStack Start app.

## Installation

You can install this package via npm or any other package manager of your choice:

```bash
npm install @dodo/tanstack-start zod @tanstack/start
```

## Quick Start

All the examples below assume you're using TanStack Start with API routes.

### 1. Checkout Route Handler

```typescript
// app/routes/api/checkout.ts
import { json } from "@tanstack/start";
import { Checkout } from "@dodo/tanstack-start";

export const GET = Checkout({
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
// app/routes/api/customer-portal.ts
import { CustomerPortal } from "@dodo/tanstack-start";

export const GET = CustomerPortal({
  // Can be omitted if DODO_PAYMENTS_API_KEY environment variable is set.
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  // Omit or set to "live_mode" for production
  environment: "test_mode",
  // Write logic to get customerId from request here
  getCustomerId: async (req: Request) => {
    // Extract customer ID from headers, cookies, or other request data
    // This is just an example - implement your own logic
    const authHeader = req.headers.get("authorization");
    // ... your custom logic to get customer ID
    return ""; // Return the customer ID
  },
});
```

### 3. Webhook Route Handler

```typescript
// app/routes/api/webhook/dodo-payments.ts
import { Webhooks } from "@dodo/tanstack-start";
import { WebhookPayload } from "@dodo/core";

export const POST = Webhooks({
  webhookSecret: process.env.DODO_WEBHOOK_SECRET!,
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

## TanStack Start Specific Notes

### Route File Structure

TanStack Start uses a file-based routing system. The examples above show the recommended file structure for API routes:

- **Checkout**: `app/routes/api/checkout.ts`
- **Customer Portal**: `app/routes/api/customer-portal.ts`
- **Webhooks**: `app/routes/api/webhook/dodo-payments.ts`

### Request/Response Handling

Unlike Next.js, TanStack Start uses the standard Web API `Request` and `Response` objects. The handlers in this package are designed to work with these standard interfaces, making them compatible with TanStack Start's API route system.

### Authentication Integration

For the Customer Portal handler, you'll need to implement your own authentication logic in the `getCustomerId` function. This might involve:

- Parsing JWT tokens from headers
- Reading session cookies
- Validating API keys
- Integrating with your authentication provider

Example with JWT:

```typescript
import { verify } from "jsonwebtoken";

export const GET = CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode",
  getCustomerId: async (req: Request) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No valid authorization header");
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    return decoded.customerId;
  },
});
```

## Development

This library is built with:

- **TypeScript** - Type safety and better developer experience
- **tsup** - Fast TypeScript bundler

To build this package, install the turborepo cli and run:

```bash
turbo run build --filter=@dodo/tanstack-start
```

To run in development mode:

```bash
turbo run dev --filter=@dodo/tanstack-start
```

## Environment Variables

You can set `DODO_PAYMENTS_API_KEY` environment variable to use your API key and omit the `bearerToken` parameter.

```env
DODO_PAYMENTS_API_KEY=your-api-key
DODO_WEBHOOK_SECRET=your-webhook-secret
SUCCESS_URL=https://your-app.com/success
```

## Differences from Next.js Adapter

The main differences from the Next.js adapter are:

1. **Standard Web APIs**: Uses `Request` and `Response` instead of Next.js specific types
2. **File Structure**: Different routing structure following TanStack Start conventions
3. **No Server Components**: Pure API route handlers without Next.js server component features
4. **Authentication**: More manual authentication integration for customer portal

## Migration from Next.js

If you're migrating from the Next.js adapter:

1. Update your imports from `@dodo/nextjs` to `@dodo/tanstack-start`
2. Move your route files to the TanStack Start routing structure
3. Update your `getCustomerId` function to work with standard `Request` objects
4. Remove any Next.js specific imports (like `NextRequest`, `NextResponse`)

The handler configurations remain the same, making migration straightforward.

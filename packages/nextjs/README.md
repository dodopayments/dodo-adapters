# `@dodopayments/nextjs`

> For AI Agents, see [llm-prompt.txt](llm-prompt.txt)

A typescript library that exports Handlers for Checkout, Customer Portal, and Webhook routes for easy integration with your Next.js app.

## Installation

You can install this package via npm or any other package manager of your choice:

```bash
npm install @dodopayments/nextjs
```

## Quick Start

All the examples below assume you're using Next.js App Router.

## Static vs Dynamic Checkout

### Static Checkout (GET):
- Used for simple, single-product payments.
- Parameters are passed as query parameters in the URL.
- Best for straightforward use cases where the product and quantity are known in advance.

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

## Dynamic Checkout** (POST):
- Parameters are sent as a JSON body in a POST request.
- Supports both one-time and recurring payments.
- For a complete list of supported and POST body fields, refer to the below documentation.
[Docs - One Time Payment Product](https://docs.dodopayments.com/api-reference/payments/post-payments)

[Docs - Subscription Product](https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions)

### 1. Checkout Route Handler

```typescript
// app/checkout/route.ts
import { Checkout } from "@dodopayments/nextjs";

export const GET = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  returnUrl: process.env.RETURN_URL!,
  environment: "test_mode",
  type: "static", // explicitly specify type (optional, defaults to 'static')
});

export const POST = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  returnUrl: process.env.RETURN_URL!,
  environment: "test_mode",
  type: "dynamic", // explicitly specify type for dynamic checkout
});
```

> **Note:**
> - Use `GET` for static checkout (single product, simple use cases).
> - Use `POST` for dynamic checkout (subscriptions, carts, advanced features).
> - The `type` property can be set to either `"static"` or `"dynamic"`. If not provided, it defaults to `"static"`.


---

### 2. Customer Portal Route Handler

```typescript
// app/customer-portal/route.ts
import { CustomerPortal } from "@dodopayments/nextjs";

export const GET = CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode",
});
```

#### Query Parameters

- `customer_id` (required): The customer ID for the portal session (e.g., `?customer_id=cus_123`)
- `send_email` (optional, boolean): If set to `true`, sends an email to the customer with the portal link.

Returns 400 if `customer_id` is missing.

---

### 3. Webhook Route Handler

```typescript
// app/api/webhook/dodo-payments/route.ts
import { Webhooks } from "@dodopayments/nextjs";

export const POST = Webhooks({
  webhookKey: process.env.DODO_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    // handle the payload
  },
  // ... other event handlers for granular control
});
```

#### Webhook Handler Details

- **Method:** Only POST requests are supported. Other methods return 405.
- **Signature Verification:** The handler verifies the webhook signature using the `webhookKey` and returns 401 if verification fails.
- **Payload Validation:** The payload is validated with Zod. Returns 400 for invalid payloads.
- **Error Handling:**
  - 401: Invalid signature
  - 400: Invalid payload
  - 500: Internal error during verification
- **Event Routing:** Calls the appropriate event handler based on the payload type.

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
turbo run build --filter=@dodopayments/nextjs
```

To run in development mode:

```bash
turbo run dev --filter=@dodopayments/nextjs
```

## Environment Variables

To keep your API keys and secrets secure, always use environment variables instead of hardcoding them. You can customize the variable names, but ensure you reference the correct names in your code.

**Example `.env` file:**
```env
DODO_PAYMENTS_API_KEY=your-api-key
DODO_WEBHOOK_SECRET=your-webhook-secret
```

**Usage in your code:**
```typescript
bearerToken: process.env.DODO_PAYMENTS_API_KEY!
webhookKey: process.env.DODO_WEBHOOK_SECRET!
```

> **Tip:** Never commit your `.env` file or secrets to version control. Use environment variables for all sensitive information.

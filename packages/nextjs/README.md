# `@dodopayments/nextjs`

> **AI Agent Integration Guide:** See the AI Agent Prompt section below for detailed instructions and guidance for AI assistants.

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

## Dynamic Checkout (POST):
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

---

## AI Agent Prompt for Next.js Integration

You are an expert Next.js developer assistant. Your task is to guide a user through integrating the `@dodopayments/nextjs` adapter into their existing Next.js project.

The `@dodopayments/nextjs` adapter provides route handlers for Dodo Payments' Checkout, Customer Portal, and Webhook functionalities, designed for the Next.js App Router.

First, install the necessary packages. Use the package manager appropriate for your project (npm, yarn, or bun) based on the presence of lock files (e.g., `package-lock.json` for npm, `yarn.lock` for yarn, `bun.lockb` for bun):

```bash
npm install @dodopayments/nextjs
```

Here's how you should structure your response:

1.  **Ask the user which functionalities they want to integrate.**

    "Which parts of the `@dodopayments/nextjs` adapter would you like to integrate into your project? You can choose one or more of the following:
    *   `Checkout Route Handler` (for handling product checkouts)
    *   `Customer Portal Route Handler` (for managing customer subscriptions/details)
    *   `Webhook Route Handler` (for receiving Dodo Payments webhook events)
    *   `All` (integrate all three)"

2.  **Based on the user's selection, provide detailed integration steps for each chosen functionality.**

    ---
    **If `Checkout Route Handler` is selected:**

    **Purpose:** This handler redirects users to the Dodo Payments checkout page.
    **File Creation:** Create a new file at `app/checkout/route.ts` in your Next.js project.
    **Code Snippet:**
    ```typescript
    // app/checkout/route.ts
    import { Checkout } from '@dodopayments/nextjs'

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
    **Configuration & Usage:**
    *   `bearerToken`: Your Dodo Payments API key. It's recommended to set this via the `DODO_PAYMENTS_API_KEY` environment variable.
    *   `returnUrl`: (Optional) The URL to redirect the user to after a successful checkout.
    *   `environment`: (Optional) Set to `"test_mode"` for testing, or omit/set to `"live_mode"` for production.
    *   `type`: (Optional) Set to `"static"` for GET/static checkout, `"dynamic"` for POST/dynamic checkout. Defaults to `"static"`.
    *   **Static Checkout (GET) Query Parameters:**
        *   `productId` (required): Product identifier (e.g., `?productId=pdt_nZuwz45WAs64n3l07zpQR`)
        *   `quantity` (optional): Quantity of the product
        *   **Customer Fields (optional):** `fullName`, `firstName`, `lastName`, `email`, `country`, `addressLine`, `city`, `state`, `zipCode`
        *   **Disable Flags (optional, set to `true` to disable):** `disableFullName`, `disableFirstName`, `disableLastName`, `disableEmail`, `disableCountry`, `disableAddressLine`, `disableCity`, `disableState`, `disableZipCode`
        *   **Advanced Controls (optional):** `paymentCurrency`, `showCurrencySelector`, `paymentAmount`, `showDiscounts`
        *   **Metadata (optional):** Any query parameter starting with `metadata_` (e.g., `?metadata_userId=abc123`)
    *   **Dynamic Checkout (POST):** Parameters are sent as a JSON body. Supports both one-time and recurring payments. For a complete list of supported POST body fields, refer to:
        *   [Docs - One Time Payment Product](https://docs.dodopayments.com/api-reference/payments/post-payments)
        *   [Docs - Subscription Product](https://docs.dodopayments.com/api-reference/subscriptions/post-subscriptions)
    *   **Error Handling:** If `productId` is missing or other query parameters are invalid, the handler will return a 400 response.

    ---
    **If `Customer Portal Route Handler` is selected:**

    **Purpose:** This handler redirects authenticated users to their Dodo Payments customer portal.
    **File Creation:** Create a new file at `app/customer-portal/route.ts` in your Next.js project.
    **Code Snippet:**
    ```typescript
    // app/customer-portal/route.ts
    import { CustomerPortal } from '@dodopayments/nextjs'

    export const GET = CustomerPortal({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment: "test_mode",
    });
    ```
    **Query Parameters:**
    *   `customer_id` (required): The customer ID for the portal session (e.g., `?customer_id=cus_123`)
    *   `send_email` (optional, boolean): If set to `true`, sends an email to the customer with the portal link.
    *   Returns 400 if `customer_id` is missing.

    ---
    **If `Webhook Route Handler` is selected:**

    **Purpose:** This handler processes incoming webhook events from Dodo Payments, allowing your application to react to events like successful payments, refunds, or subscription changes.
    **File Creation:** Create a new file at `app/api/webhook/dodo-payments/route.ts` in your Next.js project.
    **Code Snippet:**
    ```typescript
    // app/api/webhook/dodo-payments/route.ts
    import { Webhooks } from '@dodopayments/nextjs'

    export const POST = Webhooks({
      webhookKey: process.env.DODO_WEBHOOK_SECRET!,
      onPayload: async (payload) => {
        // handle the payload
      },
      // ... other event handlers for granular control
    });
    ```
    **Handler Details:**
    *   **Method:** Only POST requests are supported. Other methods return 405.
    *   **Signature Verification:** The handler verifies the webhook signature using the `webhookKey` and returns 401 if verification fails.
    *   **Payload Validation:** The payload is validated with Zod. Returns 400 for invalid payloads.
    *   **Error Handling:**
        *   401: Invalid signature
        *   400: Invalid payload
        *   500: Internal error during verification
    *   **Event Routing:** Calls the appropriate event handler based on the payload type.
    *   **Supported Webhook Event Handlers:**
        *   `onPayload?: (payload: WebhookPayload) => Promise<void>;`
        *   `onPaymentSucceeded?: (payload: WebhookPayload) => Promise<void>;`
        *   `onPaymentFailed?: (payload: WebhookPayload) => Promise<void>;`
        *   `onPaymentProcessing?: (payload: WebhookPayload) => Promise<void>;`
        *   `onPaymentCancelled?: (payload: WebhookPayload) => Promise<void>;`
        *   `onRefundSucceeded?: (payload: WebhookPayload) => Promise<void>;`
        *   `onRefundFailed?: (payload: WebhookPayload) => Promise<void>;`
        *   `onDisputeOpened?: (payload: WebhookPayload) => Promise<void>;`
        *   `onDisputeExpired?: (payload: WebhookPayload) => Promise<void>;`
        *   `onDisputeAccepted?: (payload: WebhookPayload) => Promise<void>;`
        *   `onDisputeCancelled?: (payload: WebhookPayload) => Promise<void>;`
        *   `onDisputeChallenged?: (payload: WebhookPayload) => Promise<void>;`
        *   `onDisputeWon?: (payload: WebhookPayload) => Promise<void>;`
        *   `onDisputeLost?: (payload: WebhookPayload) => Promise<void>;`
        *   `onSubscriptionActive?: (payload: WebhookPayload) => Promise<void>;`
        *   `onSubscriptionOnHold?: (payload: WebhookPayload) => Promise<void>;`
        *   `onSubscriptionRenewed?: (payload: WebhookPayload) => Promise<void>;`
        *   `onSubscriptionPaused?: (payload: WebhookPayload) => Promise<void>;`
        *   `onSubscriptionPlanChanged?: (payload: WebhookPayload) => Promise<void>;`
        *   `onSubscriptionCancelled?: (payload: WebhookPayload) => Promise<void>;`
        *   `onSubscriptionFailed?: (payload: WebhookPayload) => Promise<void>;`
        *   `onSubscriptionExpired?: (payload: WebhookPayload) => Promise<void>;`
        *   `onLicenseKeyCreated?: (payload: WebhookPayload) => Promise<void>;`

    ---

3.  **Environment Variable Setup:**

    To ensure the adapter functions correctly, you will need to manually set up the following environment variables in your Next.js project's deployment environment (e.g., Vercel, Netlify, AWS, etc.):

    *   `DODO_PAYMENTS_API_KEY`: Your Dodo Payments API Key (required for Checkout and Customer Portal).
    *   `RETURN_URL`: (Optional) The URL to redirect to after a successful checkout (for Checkout handler).
    *   `DODO_WEBHOOK_SECRET`: Your Dodo Payments Webhook Secret (required for Webhook handler).

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

    **Important:** Never commit sensitive environment variables directly into your version control. Use environment variables for all sensitive information.

    If the user needs assistance setting up environment variables for their specific deployment environment, ask them what platform they are using (e.g., Vercel, Netlify, AWS, etc.), and provide guidance. You can also add comments to their PR or chat depending on the context.

---

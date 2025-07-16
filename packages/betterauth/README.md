# `@dodopayments/betterauth`

A TypeScript library that provides a BetterAuth plugin for integrating Dodo Payments functionality directly into your authentication system.

## Installation

```bash
npm install @dodopayments/betterauth
```

## Quick Start

```typescript
import { betterAuth } from "better-auth";
import { dodo, checkout, portal, webhooks } from "@dodopayments/betterauth";
import DodoPayments from "dodopayments";

// Initialize Dodo Payments client
const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode",
});

// Configure BetterAuth with Dodo plugin
const auth = betterAuth({
  database: {
    // Your database configuration
  },
  plugins: [
    dodo({
      client,
      createCustomerOnSignUp: true,
      webhookSecret: process.env.DODO_WEBHOOK_SECRET,
      use: [
        checkout({
          products: [
            { productId: "pdt_123", slug: "premium-plan" },
            { productId: "pdt_456", slug: "basic-plan" },
          ],
          successUrl: "https://yourapp.com/success",
          requireAuth: true,
        }),
        portal({
          redirectUrl: "https://yourapp.com/dashboard",
        }),
        webhooks({
          onPaymentSucceeded: async (payload) => {
            console.log("Payment succeeded:", payload);
            // Handle successful payment
          },
          onSubscriptionActive: async (payload) => {
            console.log("Subscription activated:", payload);
            // Handle subscription activation
          },
          // Add more webhook handlers as needed
        }),
      ],
    }),
  ],
});
```

## Available Plugins

### Checkout Plugin

Provides checkout functionality with both static and dynamic options:

```typescript
checkout({
  products: [{ productId: "pdt_123", slug: "premium-plan" }],
  successUrl: "https://yourapp.com/success",
  requireAuth: true,
  theme: "light",
  environment: "test_mode",
});
```

**Endpoints:**

- `GET /checkout` - Redirect to checkout page
- `POST /checkout` - Dynamic checkout with JSON body

**Query Parameters (GET):**

- `productId` or `slug` - Product identifier (required)
- `quantity` - Product quantity (optional)
- `theme` - UI theme: "light" or "dark" (optional)

### Portal Plugin

Provides customer portal and account management:

```typescript
portal({
  redirectUrl: "https://yourapp.com/dashboard",
  theme: "light",
});
```

**Endpoints:**

- `GET /customer/portal` - Redirect to customer portal
- `GET /customer/state` - Get customer information
- `GET /customer/subscriptions/list` - List customer subscriptions
- `GET /customer/orders/list` - List customer orders

### Webhooks Plugin

Handles Dodo Payments webhook events:

```typescript
webhooks({
  onPaymentSucceeded: async (payload) => {
    // Handle successful payment
  },
  onSubscriptionActive: async (payload) => {
    // Handle subscription activation
  },
  onRefundSucceeded: async (payload) => {
    // Handle successful refund
  },
  // ... other event handlers
});
```

**Endpoints:**

- `POST /webhooks/dodo` - Process incoming webhooks

**Supported Events:**

- Payment events: `succeeded`, `failed`, `processing`, `cancelled`
- Subscription events: `active`, `renewed`, `cancelled`, `expired`, etc.
- Refund events: `succeeded`, `failed`
- Dispute events: `opened`, `won`, `lost`, etc.
- License key events: `created`

### Usage Plugin (Placeholder)

Future support for usage-based billing:

```typescript
usage({
  enableMetering: true,
  meterEvents: ["api_call", "storage_usage"],
});
```

**Endpoints:**

- `POST /usage/ingest` - Ingest usage events

## Configuration Options

### Main Configuration

```typescript
interface DodoOptions {
  client: DodoPayments; // Dodo Payments client instance
  createCustomerOnSignUp?: boolean; // Auto-create customers on signup
  getCustomerCreateParams?: Function; // Custom customer creation parameters
  use: DodoPlugin[]; // Array of plugins to use
  environment?: "test_mode" | "live_mode"; // Environment
  webhookSecret?: string; // Webhook signature verification secret
}
```

### Customer Creation

When `createCustomerOnSignUp` is enabled, the plugin automatically creates Dodo customers when users sign up:

```typescript
dodo({
  client,
  createCustomerOnSignUp: true,
  getCustomerCreateParams: async (user) => ({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id,
      source: "betterauth",
    },
  }),
  // ... other options
});
```

## Environment Variables

```env
DODO_PAYMENTS_API_KEY=your-api-key
DODO_WEBHOOK_SECRET=your-webhook-secret
```

## Error Handling

The plugin includes comprehensive error handling:

- `DodoAuthError` - Base error class
- `ProductNotFoundError` - Product not found
- `CustomerNotFoundError` - Customer not found
- `UnauthorizedError` - Authentication required

## Integration Examples

### Next.js App Router

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { dodo, checkout, portal, webhooks } from "@dodopayments/betterauth";

export const auth = betterAuth({
  // ... your auth configuration
  plugins: [
    dodo({
      client: new DodoPayments({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
        environment: "test_mode",
      }),
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [{ productId: "pdt_123", slug: "premium" }],
          successUrl: "/dashboard",
          requireAuth: true,
        }),
        portal(),
        webhooks({
          onPaymentSucceeded: async (payload) => {
            // Update user subscription status
          },
        }),
      ],
    }),
  ],
});
```

### React Hook Usage

```typescript
// components/CheckoutButton.tsx
import { useAuth } from "@/lib/auth";

export function CheckoutButton({ productSlug }: { productSlug: string }) {
  const handleCheckout = () => {
    // Redirect to checkout endpoint
    window.location.href = `/checkout?slug=${productSlug}`;
  };

  return (
    <button onClick={handleCheckout}>
      Checkout
    </button>
  );
}
```

## TypeScript Support

The package includes comprehensive TypeScript definitions:

```typescript
import type {
  DodoOptions,
  CheckoutPluginConfig,
  PortalPluginConfig,
  WebhooksPluginConfig,
  Product,
  CustomerCreateParams,
} from "@dodopayments/betterauth";
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run type checking
npm run check-types

# Format code
npm run format
```

## License

Apache-2.0

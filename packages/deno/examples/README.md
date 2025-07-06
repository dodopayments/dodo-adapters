# Dodo Payments Deno Examples

This directory contains examples demonstrating how to use the `@dodo/deno` adapter with different Deno frameworks and setups.

## Prerequisites

Before running any examples, make sure you have:

1. **Deno installed** - Visit [deno.land](https://deno.land) for installation instructions
2. **Dodo Payments API credentials** - Get them from your [Dodo Payments Dashboard](https://dashboard.dodopayments.com)

## Environment Variables

Create a `.env` file in the example directory you want to run:

```bash
# Required
DODO_PAYMENTS_API_KEY=your_api_key_here
DODO_WEBHOOK_SECRET=your_webhook_secret_here

# Optional
SUCCESS_URL=https://your-site.com/success
```

## Examples

### 1. Basic Server (`basic-server.ts`)

A simple example using Deno's built-in HTTP server without any frameworks.

**Features:**
- Checkout handler
- Customer portal handler
- Webhook handler
- Basic HTML page with navigation

**Run:**
```bash
cd packages/deno/examples
deno run --allow-net --allow-env basic-server.ts
```

**Visit:** http://localhost:8000

### 2. Fresh Framework (`fresh-example/`)

A complete Fresh framework example with separate route files.

**Features:**
- Fresh route handlers
- TypeScript configuration
- Import maps for dependencies

**Files:**
- `routes/checkout.ts` - Checkout route handler
- `routes/customer-portal.ts` - Customer portal route handler
- `routes/api/webhook/dodo-payments.ts` - Webhook route handler
- `deno.json` - Configuration with import maps

**Run:**
```bash
cd packages/deno/examples/fresh-example
deno task start
```

**Visit:** http://localhost:8000

## Testing the Examples

### Testing Checkout

Visit the checkout URL with a product ID:
```
http://localhost:8000/checkout?productId=pdt_your_product_id
```

**Query Parameters:**
- `productId` (required) - Your product ID from Dodo Payments
- `quantity` (optional) - Number of items
- `fullName`, `email`, etc. (optional) - Customer information

### Testing Customer Portal

Visit the customer portal URL:
```
http://localhost:8000/customer-portal
```

**Note:** You'll need to implement proper authentication in the `getCustomerId` function.

### Testing Webhooks

Set up a webhook in your Dodo Payments dashboard pointing to:
```
http://localhost:8000/api/webhook/dodo-payments
```

**For local testing**, you can use tools like [ngrok](https://ngrok.com/) to expose your local server:
```bash
ngrok http 8000
```

Then use the ngrok URL in your webhook settings.

## Common Issues

### Permission Errors

Make sure to run Deno with the required permissions:
```bash
deno run --allow-net --allow-env your-script.ts
```

### Environment Variables

Ensure your `.env` file is in the correct location and contains valid API keys.

### Webhook Verification

For webhook testing, ensure:
1. Your webhook secret matches the one in your Dodo Payments dashboard
2. Your webhook URL is publicly accessible (use ngrok for local testing)
3. The webhook endpoint accepts POST requests

## Customization

### Adding Authentication

Implement proper authentication in the `getCustomerId` function:

```typescript
getCustomerId: async (req: Request) => {
  // Your authentication logic here
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new Error("No authorization token");
  }
  
  // Verify token and extract customer ID
  const customerId = await verifyTokenAndGetCustomerId(token);
  return customerId;
}
```

### Handling Specific Webhook Events

Add specific event handlers to your webhook configuration:

```typescript
const webhookHandler = Webhook({
  webhookKey: Deno.env.get("DODO_WEBHOOK_SECRET")!,
  onPaymentSucceeded: async (payload) => {
    // Handle successful payment
    await updateOrderStatus(payload.data.order_id, "paid");
  },
  onSubscriptionActive: async (payload) => {
    // Handle subscription activation
    await enablePremiumFeatures(payload.data.customer_id);
  },
});
```

## Deployment

### Deno Deploy

1. Push your code to GitHub
2. Connect your repository to Deno Deploy
3. Set environment variables in the Deno Deploy dashboard
4. Deploy your application

### Other Platforms

Ensure your deployment platform supports:
- Deno runtime
- Environment variables
- Network access for API calls

## Support

For issues with the examples:
1. Check the main [README](../README.md) for detailed documentation
2. Verify your environment variables are set correctly
3. Ensure your Dodo Payments credentials are valid
4. Check the console for error messages
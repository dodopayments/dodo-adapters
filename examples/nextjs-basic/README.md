# Next.js Basic Example - Dodo Payments Adapter

This is a minimal example demonstrating how to use the `@dodopayments/nextjs` adapter in a Next.js application with App Router.

## Overview

This example showcases all three main functionalities of the Dodo Payments NextJS adapter:

- **Checkout Handler**: Handles product checkouts with both static (GET) and dynamic (POST) modes
- **Customer Portal Handler**: Manages customer portal access
- **Webhook Handler**: Processes Dodo Payments webhook events

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Dodo Payments account with API keys

### Installation

1. Clone the repository and navigate to this example:

   ```bash
   cd examples/nextjs-basic
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` with your actual Dodo Payments credentials:
   ```env
   DODO_PAYMENTS_API_KEY=your-actual-api-key
   DODO_WEBHOOK_SECRET=your-actual-webhook-secret
   RETURN_URL=http://localhost:3000/success
   ```

### Running the Example

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the example.

## API Routes

### Checkout - `/checkout`

**Static Checkout (GET)**:

- URL: `/checkout?productId=YOUR_PRODUCT_ID`
- Optional parameters: `quantity`, customer fields, metadata, etc.

**Dynamic Checkout (POST)**:

- URL: `/checkout`
- Send JSON body with payment details

### Customer Portal - `/customer-portal`

**URL**: `/customer-portal?customer_id=YOUR_CUSTOMER_ID`

Optional parameters:

- `send_email=true` - Send email to customer with portal link

### Webhook - `/api/webhook/dodo-payments`

**Method**: POST

Configure this URL in your Dodo Payments dashboard webhook settings.

**Note**: This example uses a simplified webhook implementation that doesn't use the `Webhooks` utility from the adapter to avoid build-time issues. For production use, you should implement proper webhook signature verification.

## File Structure

```
app/
├── layout.tsx                          # App layout
├── page.tsx                           # Homepage with examples
├── checkout/
│   └── route.ts                       # Checkout handler
├── customer-portal/
│   └── route.ts                       # Customer portal handler
└── api/
    └── webhook/
        └── dodo-payments/
            └── route.ts               # Webhook handler
```

## Environment Variables

| Variable                | Description                               | Required           |
| ----------------------- | ----------------------------------------- | ------------------ |
| `DODO_PAYMENTS_API_KEY` | Your Dodo Payments API key                | Yes                |
| `DODO_WEBHOOK_SECRET`   | Webhook secret for signature verification | Yes (for webhooks) |
| `RETURN_URL`            | URL to redirect after successful checkout | Optional           |

## Testing

1. **Checkout**: Visit `/checkout?productId=YOUR_PRODUCT_ID` with a valid product ID
2. **Customer Portal**: Visit `/customer-portal?customer_id=YOUR_CUSTOMER_ID` with a valid customer ID
3. **Webhook**: Use a tool like ngrok to expose your local server and configure the webhook URL in Dodo Payments dashboard

## Testing

This example includes comprehensive e2e tests using Playwright.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI mode
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed
```

### Test Structure

The tests are organized in the `tests/` directory:

- `homepage.spec.ts` - Tests the main homepage functionality
- `checkout.spec.ts` - Tests both GET and POST checkout endpoints
- `customer-portal.spec.ts` - Tests the customer portal endpoint

### Test Coverage

The tests cover:

✅ **Homepage**: Title, content sections, navigation links
✅ **Checkout Endpoint**: GET/POST requests, parameter handling
✅ **Customer Portal**: GET requests, parameter validation
🚫 **Webhook Endpoint**: Skipped (requires webhook setup)

### Prerequisites for Testing

1. Install dependencies: `npm install`
2. Install Playwright browsers: `npx playwright install`
3. Ensure the Next.js app is running on `localhost:3000`

The Playwright config is set to automatically start the dev server if it's not already running.

## Next Steps

- Add proper error handling and loading states
- Implement success/failure pages
- Add authentication for customer portal access
- Set up proper logging for webhook events
- Add webhook endpoint tests with proper mocking
- Deploy to your preferred hosting platform

## Documentation

For more detailed information about the adapter, see:

- [Dodo Payments NextJS Adapter Documentation](https://docs.dodopayments.com/developer-resources/nextjs-adaptor)
- [Dodo Payments API Reference](https://docs.dodopayments.com/api-reference)

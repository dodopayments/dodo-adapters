# Testing Utilities

This package provides utilities for testing webhook events from Dodo Payments.

## Installation

```bash
npm install @dodopayments/core
```

## Usage

### Creating Mock Webhook Events

The testing utilities provide factory functions to create mock webhook events for all supported event types:

```javascript
const { 
  createMockPayment, 
  createMockSubscription, 
  createMockRefund, 
  createMockDispute, 
  createMockLicenseKey
} = require("@dodopayments/core/testing");

// Create a mock payment event
const mockPayment = createMockPayment({
  total_amount: 2999,
  currency: "USD"
});

// Create a mock subscription event
const mockSubscription = createMockSubscription({
  status: "active",
  recurring_pre_tax_amount: 999
});

// Create a mock refund event
const mockRefund = createMockRefund({
  amount: 1500,
  is_partial: true
});

// Create a mock dispute event
const mockDispute = createMockDispute({
  dispute_status: "dispute_opened",
  dispute_stage: "dispute_opened"
});

// Create a mock license key event
const mockLicenseKey = createMockLicenseKey({
  status: "active",
  key: "LICENSE-KEY-12345"
});
```

### Creating Complete Webhook Requests

You can also create complete webhook requests with valid signatures for testing your webhook handlers:

```javascript
const { 
  createMockPayment,
  createMockWebhookRequest
} = require("@dodopayments/core/testing");
const { Webhook: StandardWebhook } = require("standardwebhooks");

// Create a complete webhook payload with the correct structure
const mockPayment = createMockPayment({ total_amount: 2999 });
const webhookPayload = {
  business_id: "biz_123456789",
  type: "payment.succeeded",
  timestamp: new Date().toISOString(),
  data: mockPayment
};

// Create a complete webhook request
const WEBHOOK_SECRET = "whsec_testsecret123";
const webhookRequest = createMockWebhookRequest(webhookPayload, WEBHOOK_SECRET);

// Verify the webhook signature (as would be done in your webhook handler)
const standardWebhook = new StandardWebhook(WEBHOOK_SECRET);

try {
  standardWebhook.verify(webhookRequest.body, {
    "webhook-id": webhookRequest.headers["webhook-id"],
    "webhook-timestamp": webhookRequest.headers["webhook-timestamp"],
    "webhook-signature": webhookRequest.headers["webhook-signature"],
  });
  
  console.log("Webhook signature verified successfully!");
} catch (error) {
  console.error("Webhook signature verification failed:", error);
}
```

## API Reference

### `createMockPayment(overrides?)`

Creates a mock payment event.

### `createMockSubscription(overrides?)`

Creates a mock subscription event.

### `createMockRefund(overrides?)`

Creates a mock refund event.

### `createMockDispute(overrides?)`

Creates a mock dispute event.

### `createMockLicenseKey(overrides?)`

Creates a mock license key event.

### `createMockWebhookHeaders(payload, secret, msgId?)`

Creates valid webhook headers with a signature for testing.

### `createMockWebhookRequest(payload, secret)`

Creates a complete webhook request with headers and body for testing.
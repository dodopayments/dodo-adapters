# @dodopayments/testing

Testing utilities for Dodo Payments integration libraries.

## Installation

```bash
npm install --save-dev @dodopayments/testing
```

## Usage

This package provides factory functions and utilities for testing Dodo Payments integrations:

```typescript
import { 
  createMockPayment, 
  createMockSubscription,
  createMockWebhookRequest,
  verifyWebhookSignature
} from '@dodopayments/testing';

// Create mock payment data
const mockPayment = createMockPayment({
  total_amount: 2000,
  currency: 'EUR'
});

// Create a complete webhook request for testing
const { headers, body } = createMockWebhookRequest(
  {
    business_id: 'biz_123',
    type: 'payment.succeeded',
    timestamp: new Date().toISOString(),
    data: mockPayment
  },
  'whsec_testsecret123'
);

// Verify webhook signatures in your tests
const isValid = verifyWebhookSignature(body, headers, 'whsec_testsecret123');
```

## Available Utilities

- `createMockPayment()` - Create mock payment data
- `createMockSubscription()` - Create mock subscription data
- `createMockRefund()` - Create mock refund data
- `createMockDispute()` - Create mock dispute data
- `createMockLicenseKey()` - Create mock license key data
- `createMockWebhookRequest()` - Create complete webhook requests with proper headers
- `verifyWebhookSignature()` - Verify webhook signatures
- `createMockWebhookErrorScenario()` - Simulate various error scenarios
- `createMockWebhookBatch()` - Create batches of webhook events for load testing

## License

Apache-2.0
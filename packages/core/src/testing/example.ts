import { 
  createMockPayment, 
  createMockSubscription, 
  createMockRefund, 
  createMockDispute, 
  createMockLicenseKey,
  createMockWebhookRequest,
  createMockPaymentWebhookEvent,
  createMockSubscriptionWebhookEvent,
  createMockRefundWebhookEvent,
  createMockDisputeWebhookEvent,
  createMockLicenseKeyWebhookEvent,
  verifyWebhookSignature,
  createMockWebhookErrorScenario,
  createMockWebhookBatch
} from "./webhook";
import { Webhook as StandardWebhook } from "standardwebhooks";

// Example: Creating a mock payment event
const mockPayment = createMockPayment({
  total_amount: 2999,
  currency: "USD",
  customer: {
    customer_id: "cus_123456789",
    email: "customer@example.com",
    name: "John Doe"
  }
});

console.log("Mock Payment:", mockPayment);

// Example: Creating a mock subscription event
const mockSubscription = createMockSubscription({
  status: "active",
  recurring_pre_tax_amount: 999,
  customer: {
    customer_id: "cus_123456789",
    email: "customer@example.com",
    name: "John Doe"
  }
});

console.log("Mock Subscription:", mockSubscription);

// Example: Creating a mock refund event
const mockRefund = createMockRefund({
  amount: 1500,
  is_partial: true,
  reason: "Customer request"
});

console.log("Mock Refund:", mockRefund);

// Example: Creating a mock dispute event
const mockDispute = createMockDispute({
  dispute_status: "dispute_opened",
  dispute_stage: "dispute_opened",
  amount: "2999"
});

console.log("Mock Dispute:", mockDispute);

// Example: Creating a mock license key event
const mockLicenseKey = createMockLicenseKey({
  status: "active",
  key: "LICENSE-KEY-12345"
});

console.log("Mock License Key:", mockLicenseKey);

// Example: Creating complete webhook events (new functionality)
const paymentWebhookEvent = createMockPaymentWebhookEvent({
  type: "payment.failed"
});

console.log("Payment Webhook Event:", paymentWebhookEvent);

const subscriptionWebhookEvent = createMockSubscriptionWebhookEvent({
  type: "subscription.cancelled"
});

console.log("Subscription Webhook Event:", subscriptionWebhookEvent);

const refundWebhookEvent = createMockRefundWebhookEvent({
  type: "refund.failed"
});

console.log("Refund Webhook Event:", refundWebhookEvent);

const disputeWebhookEvent = createMockDisputeWebhookEvent({
  type: "dispute.won"
});

console.log("Dispute Webhook Event:", disputeWebhookEvent);

const licenseKeyWebhookEvent = createMockLicenseKeyWebhookEvent({
  type: "license_key.created"
});

console.log("License Key Webhook Event:", licenseKeyWebhookEvent);

// Example: Creating a complete webhook request for testing
const WEBHOOK_SECRET = "whsec_testsecret123";

// Create a complete webhook payload with the correct structure
const webhookPayload = {
  business_id: "biz_123456789",
  type: "payment.succeeded" as const,
  timestamp: new Date().toISOString(),
  data: mockPayment
};

const webhookRequest = createMockWebhookRequest(webhookPayload, WEBHOOK_SECRET);

console.log("Webhook Headers:", webhookRequest.headers);
console.log("Webhook Body:", webhookRequest.body);

// Example: Verifying a webhook signature (as would be done in your webhook handler)
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

// Example: Using the new verification utility function
const isValid = verifyWebhookSignature(webhookRequest.body, webhookRequest.headers, WEBHOOK_SECRET);
console.log("Webhook signature verified with utility function:", isValid);

// Example: Creating error scenarios for testing error handling
const invalidSignatureScenario = createMockWebhookErrorScenario('invalid_signature', WEBHOOK_SECRET);
console.log("Invalid signature scenario:", invalidSignatureScenario);

const missingHeadersScenario = createMockWebhookErrorScenario('missing_headers', WEBHOOK_SECRET);
console.log("Missing headers scenario:", missingHeadersScenario);

// Example: Creating a batch of webhook events for load testing
const webhookBatch = createMockWebhookBatch(5, 'payment', WEBHOOK_SECRET);
console.log(`Created batch of ${webhookBatch.length} webhook events`);

webhookBatch.forEach((event, index) => {
  const isValid = verifyWebhookSignature(event.body, event.headers, WEBHOOK_SECRET);
  console.log(`Batch event ${index + 1} signature valid:`, isValid);
});
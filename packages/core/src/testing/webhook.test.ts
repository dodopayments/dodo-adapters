import { describe, it, expect } from "vitest";
import { 
  createMockPayment, 
  createMockSubscription, 
  createMockRefund, 
  createMockDispute, 
  createMockLicenseKey,
  createMockWebhookHeaders,
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
import { WebhookPayloadSchema } from "../schemas/webhook";

describe("Webhook Testing Utilities", () => {
  const SECRET = "whsec_testsecret123";

  it("should create a valid mock payment payload", () => {
    const mockPayment = createMockPayment({
      total_amount: 2000,
      currency: "EUR"
    });

    expect(mockPayment.payload_type).toBe("Payment");
    expect(mockPayment.total_amount).toBe(2000);
    expect(mockPayment.currency).toBe("EUR");
    // The created_at field is a string that can be parsed as a date
    expect(typeof mockPayment.created_at).toBe("string");
    expect(new Date(mockPayment.created_at)).toBeInstanceOf(Date);

    // Validate against the actual schema
    const result = WebhookPayloadSchema.safeParse({
      business_id: "biz_123",
      type: "payment.succeeded",
      timestamp: new Date().toISOString(),
      data: mockPayment
    });
    expect(result.success).toBe(true);
  });

  it("should create a valid mock subscription payload", () => {
    const mockSubscription = createMockSubscription({
      status: "active",
      payment_frequency_interval: "Year"
    });

    expect(mockSubscription.payload_type).toBe("Subscription");
    expect(mockSubscription.status).toBe("active");
    expect(mockSubscription.payment_frequency_interval).toBe("Year");
    // The created_at field is a string that can be parsed as a date
    expect(typeof mockSubscription.created_at).toBe("string");
    expect(new Date(mockSubscription.created_at)).toBeInstanceOf(Date);

    // Validate against the actual schema
    const result = WebhookPayloadSchema.safeParse({
      business_id: "biz_123",
      type: "subscription.active",
      timestamp: new Date().toISOString(),
      data: mockSubscription
    });
    expect(result.success).toBe(true);
  });

  it("should create a valid mock refund payload", () => {
    const mockRefund = createMockRefund({
      amount: 500,
      is_partial: true
    });

    expect(mockRefund.payload_type).toBe("Refund");
    expect(mockRefund.amount).toBe(500);
    expect(mockRefund.is_partial).toBe(true);
    // The created_at field is a string that can be parsed as a date
    expect(typeof mockRefund.created_at).toBe("string");
    expect(new Date(mockRefund.created_at)).toBeInstanceOf(Date);

    // Validate against the actual schema
    const result = WebhookPayloadSchema.safeParse({
      business_id: "biz_123",
      type: "refund.succeeded",
      timestamp: new Date().toISOString(),
      data: mockRefund
    });
    expect(result.success).toBe(true);
  });

  it("should create a valid mock dispute payload", () => {
    const mockDispute = createMockDispute({
      dispute_status: "dispute_won",
      dispute_stage: "dispute_won"
    });

    expect(mockDispute.payload_type).toBe("Dispute");
    expect(mockDispute.dispute_status).toBe("dispute_won");
    expect(mockDispute.dispute_stage).toBe("dispute_won");
    // The created_at field is a string that can be parsed as a date
    expect(typeof mockDispute.created_at).toBe("string");
    expect(new Date(mockDispute.created_at)).toBeInstanceOf(Date);

    // Validate against the actual schema
    const result = WebhookPayloadSchema.safeParse({
      business_id: "biz_123",
      type: "dispute.won",
      timestamp: new Date().toISOString(),
      data: mockDispute
    });
    expect(result.success).toBe(true);
  });

  it("should create a valid mock license key payload", () => {
    const mockLicenseKey = createMockLicenseKey({
      status: "expired",
      key: "TEST-KEY-123"
    });

    expect(mockLicenseKey.payload_type).toBe("LicenseKey");
    expect(mockLicenseKey.status).toBe("expired");
    expect(mockLicenseKey.key).toBe("TEST-KEY-123");
    // The created_at field is a string that can be parsed as a date
    expect(typeof mockLicenseKey.created_at).toBe("string");
    expect(new Date(mockLicenseKey.created_at)).toBeInstanceOf(Date);

    // Validate against the actual schema
    const result = WebhookPayloadSchema.safeParse({
      business_id: "biz_123",
      type: "license_key.created",
      timestamp: new Date().toISOString(),
      data: mockLicenseKey
    });
    expect(result.success).toBe(true);
  });

  it("should create valid webhook headers", () => {
    const payload = JSON.stringify({ test: "data" });
    const headers = createMockWebhookHeaders(payload, SECRET);

    expect(headers["webhook-id"]).toBeDefined();
    expect(headers["webhook-timestamp"]).toBeDefined();
    expect(headers["webhook-signature"]).toBeDefined();
  });

  it("should create a complete webhook request", () => {
    const mockPayment = createMockPayment({ total_amount: 1500 });
    const webhookPayload = {
      business_id: "biz_123",
      type: "payment.succeeded" as const,
      timestamp: new Date().toISOString(),
      data: mockPayment
    };
    const request = createMockWebhookRequest(webhookPayload, SECRET);

    expect(request.headers).toBeDefined();
    expect(request.body).toBe(JSON.stringify(webhookPayload));
    expect(request.headers["webhook-id"]).toBeDefined();
    expect(request.headers["webhook-timestamp"]).toBeDefined();
    expect(request.headers["webhook-signature"]).toBeDefined();
  });

  it("should verify webhook signatures", () => {
    const mockPayment = createMockPayment({ total_amount: 1500 });
    const webhookPayload = {
      business_id: "biz_123",
      type: "payment.succeeded" as const,
      timestamp: new Date().toISOString(),
      data: mockPayment
    };
    const { headers, body } = createMockWebhookRequest(webhookPayload, SECRET);
    
    // Verify the signature using the standardwebhooks library
    const standardWebhook = new StandardWebhook(SECRET);
    
    expect(() => {
      standardWebhook.verify(body, {
        "webhook-id": headers["webhook-id"],
        "webhook-timestamp": headers["webhook-timestamp"],
        "webhook-signature": headers["webhook-signature"],
      });
    }).not.toThrow();
  });

  // New tests for complete webhook events
  it("should create a valid payment webhook event", () => {
    const webhookEvent = createMockPaymentWebhookEvent({
      type: "payment.failed"
    });

    expect(webhookEvent.type).toBe("payment.failed");
    expect(webhookEvent.data.payload_type).toBe("Payment");
    expect(webhookEvent.timestamp).toBeDefined();
    expect(webhookEvent.business_id).toBeDefined();

    // Validate against the actual schema
    const result = WebhookPayloadSchema.safeParse(webhookEvent);
    expect(result.success).toBe(true);
  });

  it("should create a valid subscription webhook event", () => {
    const webhookEvent = createMockSubscriptionWebhookEvent({
      type: "subscription.cancelled"
    });

    expect(webhookEvent.type).toBe("subscription.cancelled");
    expect(webhookEvent.data.payload_type).toBe("Subscription");
    expect(webhookEvent.timestamp).toBeDefined();
    expect(webhookEvent.business_id).toBeDefined();

    // Validate against the actual schema
    const result = WebhookPayloadSchema.safeParse(webhookEvent);
    expect(result.success).toBe(true);
  });

  it("should create a valid refund webhook event", () => {
    const webhookEvent = createMockRefundWebhookEvent({
      type: "refund.failed"
    });

    expect(webhookEvent.type).toBe("refund.failed");
    expect(webhookEvent.data.payload_type).toBe("Refund");
    expect(webhookEvent.timestamp).toBeDefined();
    expect(webhookEvent.business_id).toBeDefined();

    // Validate against the actual schema
    const result = WebhookPayloadSchema.safeParse(webhookEvent);
    expect(result.success).toBe(true);
  });

  it("should create a valid dispute webhook event", () => {
    const webhookEvent = createMockDisputeWebhookEvent({
      type: "dispute.won"
    });

    expect(webhookEvent.type).toBe("dispute.won");
    expect(webhookEvent.data.payload_type).toBe("Dispute");
    expect(webhookEvent.timestamp).toBeDefined();
    expect(webhookEvent.business_id).toBeDefined();

    // Validate against the actual schema
    const result = WebhookPayloadSchema.safeParse(webhookEvent);
    expect(result.success).toBe(true);
  });

  it("should create a valid license key webhook event", () => {
    const webhookEvent = createMockLicenseKeyWebhookEvent({
      type: "license_key.created"
    });

    expect(webhookEvent.type).toBe("license_key.created");
    expect(webhookEvent.data.payload_type).toBe("LicenseKey");
    expect(webhookEvent.timestamp).toBeDefined();
    expect(webhookEvent.business_id).toBeDefined();

    // Validate against the actual schema
    const result = WebhookPayloadSchema.safeParse(webhookEvent);
    expect(result.success).toBe(true);
  });

  // Test for signature verification utility
  it("should verify webhook signatures with utility function", () => {
    const mockPayment = createMockPayment({ total_amount: 1500 });
    const webhookPayload = {
      business_id: "biz_123",
      type: "payment.succeeded" as const,
      timestamp: new Date().toISOString(),
      data: mockPayment
    };
    const { headers, body } = createMockWebhookRequest(webhookPayload, SECRET);
    
    // Verify the signature using our utility function
    const isValid = verifyWebhookSignature(body, headers, SECRET);
    expect(isValid).toBe(true);
  });

  it("should reject invalid webhook signatures", () => {
    const mockPayment = createMockPayment({ total_amount: 1500 });
    const webhookPayload = {
      business_id: "biz_123",
      type: "payment.succeeded" as const,
      timestamp: new Date().toISOString(),
      data: mockPayment
    };
    const { headers, body } = createMockWebhookRequest(webhookPayload, SECRET);
    
    // Test with wrong secret
    const isValid = verifyWebhookSignature(body, headers, "whsec_wrongsecret");
    expect(isValid).toBe(false);
  });

  // Tests for error scenario utilities
  it("should create error scenarios for testing", () => {
    // Test invalid signature scenario
    const invalidSignatureScenario = createMockWebhookErrorScenario('invalid_signature', SECRET);
    expect(invalidSignatureScenario.headers["webhook-signature"]).toBe("invalid_signature");
    
    // Test missing headers scenario
    const missingHeadersScenario = createMockWebhookErrorScenario('missing_headers', SECRET);
    expect(Object.keys(missingHeadersScenario.headers).length).toBe(0);
    
    // Test malformed payload scenario
    const malformedPayloadScenario = createMockWebhookErrorScenario('malformed_payload', SECRET);
    expect(malformedPayloadScenario.body).toBe("invalid json");
    
    // Test expired timestamp scenario
    const expiredTimestampScenario = createMockWebhookErrorScenario('expired_timestamp', SECRET);
    expect(expiredTimestampScenario.headers["webhook-timestamp"]).toBeDefined();
  });

  it("should create a batch of webhook events", () => {
    const batch = createMockWebhookBatch(5, 'payment', SECRET);
    
    expect(batch.length).toBe(5);
    expect(batch[0].headers).toBeDefined();
    expect(batch[0].body).toBeDefined();
    expect(batch[0].headers["webhook-id"]).toBeDefined();
  });

  it("should create batches of different event types", () => {
    const paymentBatch = createMockWebhookBatch(3, 'payment', SECRET);
    const subscriptionBatch = createMockWebhookBatch(3, 'subscription', SECRET);
    const refundBatch = createMockWebhookBatch(3, 'refund', SECRET);
    
    expect(paymentBatch.length).toBe(3);
    expect(subscriptionBatch.length).toBe(3);
    expect(refundBatch.length).toBe(3);
  });
});
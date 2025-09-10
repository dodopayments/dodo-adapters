import { 
  createMockPayment, 
  createMockSubscription, 
  createMockRefund, 
  createMockDispute, 
  createMockLicenseKey,
  createMockWebhookHeaders,
  createMockWebhookRequest
} from "./webhook";
import { Webhook as StandardWebhook } from "standardwebhooks";
import { WebhookPayloadSchema } from "../schemas/webhook";

// Mock testing functions since we're not in a test environment
const describe = (name: string, fn: () => void) => {
  console.log(`Running test suite: ${name}`);
  fn();
};

const it = (name: string, fn: () => void) => {
  console.log(`  Running test: ${name}`);
  try {
    fn();
    console.log("    ✓ Test passed");
  } catch (error) {
    console.log(`    ✗ Test failed: ${error}`);
  }
};

const expect = (value: any) => {
  return {
    toBe: (expected: any) => {
      if (value !== expected) {
        throw new Error(`Expected ${expected} but got ${value}`);
      }
    },
    toBeInstanceOf: (expected: any) => {
      if (!(value instanceof expected)) {
        throw new Error(`Expected instance of ${expected.name} but got ${value.constructor.name}`);
      }
    },
    toBeDefined: () => {
      if (value === undefined) {
        throw new Error("Expected value to be defined");
      }
    }
  };
};

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
    expect(mockPayment.created_at).toBeInstanceOf(Date);

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
    expect(mockSubscription.created_at).toBeInstanceOf(Date);

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
    expect(mockRefund.created_at).toBeInstanceOf(Date);

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
    expect(mockDispute.created_at).toBeInstanceOf(Date);

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
    expect(mockLicenseKey.created_at).toBeInstanceOf(Date);

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
    
    let errorOccurred = false;
    try {
      standardWebhook.verify(body, {
        "webhook-id": headers["webhook-id"],
        "webhook-timestamp": headers["webhook-timestamp"],
        "webhook-signature": headers["webhook-signature"],
      });
    } catch (error) {
      errorOccurred = true;
    }
    
    expect(errorOccurred).toBe(false);
  });
});
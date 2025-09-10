import { Webhook as StandardWebhook } from "standardwebhooks";
import { 
  Payment, 
  Subscription, 
  Refund, 
  Dispute, 
  LicenseKey,
  WebhookPayload
} from "../schemas/webhook";

// Helper function to generate mock timestamps
const mockTimestamp = (): string => new Date().toISOString();

// Helper function to generate random IDs
const mockId = (prefix: string): string => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Specific factory functions for each webhook event type
export const createMockPayment = (overrides?: Partial<Payment>): Payment => {
  return {
    payload_type: "Payment",
    billing: {
      city: "New York",
      country: "US",
      state: "NY",
      street: "123 Main St",
      zipcode: "10001"
    },
    brand_id: mockId("brand"),
    business_id: mockId("biz"),
    card_issuing_country: "US",
    card_last_four: "1234",
    card_network: "Visa",
    card_type: "credit",
    created_at: mockTimestamp(),
    currency: "USD",
    customer: {
      customer_id: mockId("cus"),
      email: "customer@example.com",
      name: "John Doe"
    },
    digital_products_delivered: false,
    discount_id: null,
    disputes: null,
    error_code: null,
    error_message: null,
    metadata: null,
    payment_id: mockId("pay"),
    payment_link: null,
    payment_method: "card",
    payment_method_type: "credit_card",
    product_cart: [],
    refunds: null,
    settlement_amount: 1000,
    settlement_currency: "USD",
    settlement_tax: null,
    status: "succeeded",
    subscription_id: null,
    tax: null,
    total_amount: 1000,
    updated_at: null,
    ...overrides
  } as Payment;
};

export const createMockSubscription = (overrides?: Partial<Subscription>): Subscription => {
  return {
    payload_type: "Subscription",
    addons: null,
    billing: {
      city: "New York",
      country: "US",
      state: "NY",
      street: "123 Main St",
      zipcode: "10001"
    },
    cancel_at_next_billing_date: false,
    cancelled_at: null,
    created_at: mockTimestamp(),
    currency: "USD",
    customer: {
      customer_id: mockId("cus"),
      email: "customer@example.com",
      name: "John Doe"
    },
    discount_id: null,
    metadata: null,
    next_billing_date: null,
    on_demand: false,
    payment_frequency_count: 1,
    payment_frequency_interval: "Month",
    previous_billing_date: null,
    product_id: mockId("prod"),
    quantity: 1,
    recurring_pre_tax_amount: 1000,
    status: "active",
    subscription_id: mockId("sub"),
    subscription_period_count: 1,
    subscription_period_interval: "Month",
    tax_inclusive: true,
    trial_period_days: 0,
    ...overrides
  } as Subscription;
};

export const createMockRefund = (overrides?: Partial<Refund>): Refund => {
  return {
    payload_type: "Refund",
    amount: 1000,
    business_id: mockId("biz"),
    created_at: mockTimestamp(),
    currency: "USD",
    is_partial: false,
    payment_id: mockId("pay"),
    reason: null,
    refund_id: mockId("ref"),
    status: "succeeded",
    ...overrides
  } as Refund;
};

export const createMockDispute = (overrides?: Partial<Dispute>): Dispute => {
  return {
    payload_type: "Dispute",
    amount: "1000",
    business_id: mockId("biz"),
    created_at: mockTimestamp(),
    currency: "USD",
    dispute_id: mockId("dis"),
    dispute_stage: "dispute_opened",
    dispute_status: "dispute_opened",
    payment_id: mockId("pay"),
    remarks: null,
    ...overrides
  } as Dispute;
};

export const createMockLicenseKey = (overrides?: Partial<LicenseKey>): LicenseKey => {
  return {
    payload_type: "LicenseKey",
    activations_limit: 5,
    business_id: mockId("biz"),
    created_at: mockTimestamp(),
    customer_id: mockId("cus"),
    expires_at: null,
    id: mockId("lic"),
    instances_count: 0,
    key: mockId("key"),
    payment_id: mockId("pay"),
    product_id: mockId("prod"),
    status: "active",
    subscription_id: null,
    ...overrides
  } as LicenseKey;
};

// Factory functions for complete webhook events
export const createMockPaymentWebhookEvent = (overrides?: Partial<WebhookPayload>): WebhookPayload => {
  return {
    business_id: mockId("biz"),
    type: "payment.succeeded",
    timestamp: mockTimestamp(), // Changed back to string
    data: createMockPayment(),
    ...overrides
  } as WebhookPayload;
};

export const createMockSubscriptionWebhookEvent = (overrides?: Partial<WebhookPayload>): WebhookPayload => {
  return {
    business_id: mockId("biz"),
    type: "subscription.active",
    timestamp: mockTimestamp(), // Changed back to string
    data: createMockSubscription(),
    ...overrides
  } as WebhookPayload;
};

export const createMockRefundWebhookEvent = (overrides?: Partial<WebhookPayload>): WebhookPayload => {
  return {
    business_id: mockId("biz"),
    type: "refund.succeeded",
    timestamp: mockTimestamp(), // Changed back to string
    data: createMockRefund(),
    ...overrides
  } as WebhookPayload;
};

export const createMockDisputeWebhookEvent = (overrides?: Partial<WebhookPayload>): WebhookPayload => {
  return {
    business_id: mockId("biz"),
    type: "dispute.opened",
    timestamp: mockTimestamp(), // Changed back to string
    data: createMockDispute(),
    ...overrides
  } as WebhookPayload;
};

export const createMockLicenseKeyWebhookEvent = (overrides?: Partial<WebhookPayload>): WebhookPayload => {
  return {
    business_id: mockId("biz"),
    type: "license_key.created",
    timestamp: mockTimestamp(), // Changed back to string
    data: createMockLicenseKey(),
    ...overrides
  } as WebhookPayload;
};

// Helper function to create mock webhook headers
export const createMockWebhookHeaders = (payload: string, secret: string, msgId?: string): Record<string, string> => {
  const timestamp = new Date();
  const messageId = msgId || mockId("wh");
  const standardWebhook = new StandardWebhook(secret);
  
  // Use the sign method with correct parameters
  const signature = standardWebhook.sign(messageId, timestamp, payload);
  
  return {
    "webhook-id": messageId,
    "webhook-timestamp": Math.floor(timestamp.getTime() / 1000).toString(),
    "webhook-signature": signature,
  };
};

// Helper function to create a complete mock webhook request
export const createMockWebhookRequest = <T>(
  payload: T,
  secret: string
): { headers: Record<string, string>; body: string } => {
  const body = JSON.stringify(payload);
  const headers = createMockWebhookHeaders(body, secret);
  
  return { headers, body };
};

// Utility function to verify a webhook signature
export const verifyWebhookSignature = (body: string, headers: Record<string, string>, secret: string): boolean => {
  try {
    const standardWebhook = new StandardWebhook(secret);
    standardWebhook.verify(body, {
      "webhook-id": headers["webhook-id"],
      "webhook-timestamp": headers["webhook-timestamp"],
      "webhook-signature": headers["webhook-signature"],
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Utility function to simulate common webhook error scenarios
export const createMockWebhookErrorScenario = (
  scenario: 'invalid_signature' | 'missing_headers' | 'malformed_payload' | 'expired_timestamp',
  secret: string
): { headers: Record<string, string>; body: string } => {
  const mockPayment = createMockPayment();
  const webhookPayload = {
    business_id: mockId("biz"),
    type: "payment.succeeded" as const,
    timestamp: mockTimestamp(), // Changed back to string
    data: mockPayment
  };
  
  const body = JSON.stringify(webhookPayload);
  
  switch (scenario) {
    case 'invalid_signature':
      return {
        headers: {
          "webhook-id": mockId("wh"),
          "webhook-timestamp": Math.floor(new Date().getTime() / 1000).toString(),
          "webhook-signature": "invalid_signature"
        },
        body
      };
      
    case 'missing_headers':
      return {
        headers: {},
        body
      };
      
    case 'malformed_payload':
      return {
        headers: createMockWebhookHeaders('invalid json', secret),
        body: 'invalid json'
      };
      
    case 'expired_timestamp':
      // Create a timestamp from 1 hour ago (older than the 5-minute tolerance)
      const expiredTimestamp = new Date(Date.now() - 60 * 60 * 1000);
      const messageId = mockId("wh");
      const standardWebhook = new StandardWebhook(secret);
      const signature = standardWebhook.sign(messageId, expiredTimestamp, body);
      
      return {
        headers: {
          "webhook-id": messageId,
          "webhook-timestamp": Math.floor(expiredTimestamp.getTime() / 1000).toString(),
          "webhook-signature": signature,
        },
        body
      };
      
    default:
      return createMockWebhookRequest(webhookPayload, secret);
  }
};

// Utility function to create a batch of webhook events for load testing
export const createMockWebhookBatch = (
  count: number,
  eventType: 'payment' | 'subscription' | 'refund' | 'dispute' | 'license_key' = 'payment',
  secret: string
): Array<{ headers: Record<string, string>; body: string }> => {
  const batch = [];
  
  for (let i = 0; i < count; i++) {
    let webhookEvent;
    
    switch (eventType) {
      case 'payment':
        webhookEvent = createMockPaymentWebhookEvent();
        break;
      case 'subscription':
        webhookEvent = createMockSubscriptionWebhookEvent();
        break;
      case 'refund':
        webhookEvent = createMockRefundWebhookEvent();
        break;
      case 'dispute':
        webhookEvent = createMockDisputeWebhookEvent();
        break;
      case 'license_key':
        webhookEvent = createMockLicenseKeyWebhookEvent();
        break;
      default:
        webhookEvent = createMockPaymentWebhookEvent();
    }
    
    batch.push(createMockWebhookRequest(webhookEvent, secret));
  }
  
  return batch;
};
import { Webhook as StandardWebhook } from "standardwebhooks";
import { 
  Payment, 
  Subscription, 
  Refund, 
  Dispute, 
  LicenseKey
} from "../schemas/webhook";

// Helper function to generate mock timestamps
const mockTimestamp = (): Date => new Date();

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
  };
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
  };
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
  };
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
  };
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
  };
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
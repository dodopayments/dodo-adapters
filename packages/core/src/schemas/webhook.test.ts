import { describe, it, expect } from "vitest";
import { WebhookPayloadSchema } from "./webhook";

const ts = "2024-01-01T00:00:00.000Z";

const mkSubscription = () => ({
  payload_type: "Subscription" as const,
  addons: [],
  billing: {
    city: null,
    country: "US",
    state: null,
    street: null,
    zipcode: null,
  },
  brand_id: "brand_1",
  cancel_at_next_billing_date: false,
  created_at: ts,
  credit_entitlement_cart: [],
  currency: "USD",
  customer: { customer_id: "cus_1", email: "a@b.com", name: "A" },
  metadata: {},
  meter_credit_entitlement_cart: [],
  meters: [],
  next_billing_date: ts,
  on_demand: false,
  payment_frequency_count: 1,
  payment_frequency_interval: "Month",
  previous_billing_date: ts,
  product_id: "prod_1",
  quantity: 1,
  recurring_pre_tax_amount: 1000,
  status: "active",
  subscription_id: "sub_1",
  subscription_period_count: 1,
  subscription_period_interval: "Month",
  tax_inclusive: false,
  trial_period_days: 0,
});

const mkPayment = () => ({
  payload_type: "Payment" as const,
  billing: {
    city: null,
    country: "US",
    state: null,
    street: null,
    zipcode: null,
  },
  brand_id: "brand_1",
  business_id: "biz_1",
  created_at: ts,
  currency: "USD",
  customer: { customer_id: "cus_1", email: "a@b.com", name: "A" },
  digital_products_delivered: false,
  disputes: [
    {
      amount: "1000",
      business_id: "biz_1",
      created_at: ts,
      currency: "USD",
      dispute_id: "dis_1",
      dispute_stage: "pre_dispute",
      dispute_status: "dispute_opened",
      payment_id: "pay_1",
    },
  ],
  is_update_payment_method: false,
  metadata: {},
  payment_id: "pay_1",
  payment_provider: "dodo",
  refunds: [],
  retry_attempt: 0,
  settlement_amount: 1000,
  settlement_currency: "USD",
  total_amount: 1000,
});

const mkCreditLedgerEntry = () => ({
  payload_type: "CreditLedgerEntry" as const,
  id: "cle_1",
  amount: "1",
  balance_after: "1",
  balance_before: "0",
  brand_id: "brand_1",
  business_id: "biz_1",
  created_at: ts,
  credit_entitlement_id: "ce_1",
  customer_id: "cus_1",
  is_credit: true,
  metadata: {},
  overage_after: "0",
  overage_before: "0",
  transaction_type: "overage_reset",
});

const mkEntitlementGrant = () => ({
  payload_type: "EntitlementGrant" as const,
  id: "eg_1",
  brand_id: "brand_1",
  business_id: "biz_1",
  created_at: ts,
  customer_id: "cus_1",
  entitlement_id: "ent_1",
  integration_type: "license_key",
  metadata: {},
  status: "Delivered",
  updated_at: ts,
  license_key: { activations_used: 0, key: "XYZ" },
});

describe("WebhookPayloadSchema", () => {
  it("parses newly-added subscription event types", () => {
    for (const type of [
      "subscription.paused",
      "subscription.unpaused",
      "subscription.update_payment_method",
    ]) {
      const result = WebhookPayloadSchema.safeParse({
        business_id: "biz_1",
        type,
        timestamp: ts,
        data: mkSubscription(),
      });
      expect(result.success, `${type} should parse`).toBe(true);
    }
  });

  it("parses payment payloads with the new SDK fields (payment_provider, discounts)", () => {
    const result = WebhookPayloadSchema.safeParse({
      business_id: "biz_1",
      type: "payment.succeeded",
      timestamp: ts,
      data: {
        ...mkPayment(),
        payment_provider: "stripe",
        discounts: [
          {
            amount: 540,
            business_id: "biz_1",
            code: "SAVE",
            created_at: ts,
            discount_id: "dis_1",
            metadata: {},
            position: 0,
            preserve_on_plan_change: false,
            restricted_to: [],
            times_used: 1,
            type: "percentage",
          },
        ],
      },
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.type === "payment.succeeded") {
      expect(result.data.data.payment_provider).toBe("stripe");
      expect(result.data.data.discounts?.[0]?.discount_id).toBe("dis_1");
    }
  });

  it("parses a payment with an embedded dispute (smaller Dispute shape)", () => {
    // Payment.disputes[] uses the smaller `Dispute` shape, which has no
    // brand_id/customer/payment_provider. mkPayment() supplies exactly that.
    const result = WebhookPayloadSchema.safeParse({
      business_id: "biz_1",
      type: "payment.succeeded",
      timestamp: ts,
      data: mkPayment(),
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.type === "payment.succeeded") {
      expect(result.data.data.disputes[0]?.dispute_id).toBe("dis_1");
    }
  });

  it("parses credit.overage_reset", () => {
    const result = WebhookPayloadSchema.safeParse({
      business_id: "biz_1",
      type: "credit.overage_reset",
      timestamp: ts,
      data: mkCreditLedgerEntry(),
    });
    expect(result.success).toBe(true);
  });

  it("parses entitlement_grant.* events", () => {
    for (const type of [
      "entitlement_grant.created",
      "entitlement_grant.delivered",
      "entitlement_grant.failed",
      "entitlement_grant.revoked",
    ]) {
      const result = WebhookPayloadSchema.safeParse({
        business_id: "biz_1",
        type,
        timestamp: ts,
        data: mkEntitlementGrant(),
      });
      expect(result.success, `${type} should parse`).toBe(true);
    }
  });

  it("parses payout.* events (permissive data)", () => {
    for (const type of [
      "payout.not_initiated",
      "payout.on_hold",
      "payout.in_progress",
      "payout.failed",
      "payout.success",
    ]) {
      const result = WebhookPayloadSchema.safeParse({
        business_id: "biz_1",
        type,
        timestamp: ts,
        data: { payout_id: "po_1", amount: 1000 },
      });
      expect(result.success, `${type} should parse`).toBe(true);
    }
  });

  it("does NOT reject unknown/future event types (fallback branch)", () => {
    const result = WebhookPayloadSchema.safeParse({
      business_id: "biz_1",
      type: "some.future.event",
      timestamp: ts,
      data: { anything: true },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("some.future.event");
    }
  });

  it("still parses an existing known event type end-to-end", () => {
    const result = WebhookPayloadSchema.safeParse({
      business_id: "biz_1",
      type: "subscription.active",
      timestamp: ts,
      data: mkSubscription(),
    });
    expect(result.success).toBe(true);
  });

  it("transforms timestamp strings into Date objects", () => {
    const result = WebhookPayloadSchema.safeParse({
      business_id: "biz_1",
      type: "payment.succeeded",
      timestamp: ts,
      data: mkPayment(),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timestamp).toBeInstanceOf(Date);
    }
  });
});

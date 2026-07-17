import { describe, expect, it } from "vitest";

import { checkoutSessionPayloadSchema } from "./checkout";

describe("checkoutSessionPayloadSchema", () => {
  const minimal = { product_cart: [{ product_id: "prod_123", quantity: 1 }] };

  it("accepts a minimal payload", () => {
    expect(checkoutSessionPayloadSchema.safeParse(minimal).success).toBe(true);
  });

  it("accepts explicit null for nullable top-level fields (SDK parity)", () => {
    const result = checkoutSessionPayloadSchema.safeParse({
      ...minimal,
      customer: null,
      billing_address: null,
      subscription_data: null,
      metadata: null,
      discount_codes: null,
      allowed_payment_method_types: null,
      return_url: null,
      cancel_url: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts explicit null in nested billing address and customer fields", () => {
    const result = checkoutSessionPayloadSchema.safeParse({
      ...minimal,
      customer: { email: "a@b.com", name: null, phone_number: null },
      billing_address: {
        country: "US",
        street: null,
        city: null,
        state: null,
        zipcode: null,
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts explicit null for nullable product cart item fields", () => {
    const result = checkoutSessionPayloadSchema.safeParse({
      product_cart: [
        {
          product_id: "prod_123",
          quantity: 1,
          addons: null,
          amount: null,
          credit_entitlements: null,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("allows string, number, and boolean metadata values (SDK Metadata)", () => {
    const result = checkoutSessionPayloadSchema.safeParse({
      ...minimal,
      metadata: { plan: "pro", seats: 5, trial: true },
    });
    expect(result.success).toBe(true);
  });

  it("rejects null for customization and feature_flags (not nullable in SDK)", () => {
    expect(
      checkoutSessionPayloadSchema.safeParse({
        ...minimal,
        customization: null,
      }).success,
    ).toBe(false);
    expect(
      checkoutSessionPayloadSchema.safeParse({
        ...minimal,
        feature_flags: null,
      }).success,
    ).toBe(false);
  });
});

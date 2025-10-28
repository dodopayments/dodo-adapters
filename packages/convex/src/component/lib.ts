import { action } from "../component/_generated/server";
import { v } from "convex/values";
import {
  buildCheckoutUrl,
  type CheckoutSessionPayload,
} from "@dodopayments/core/checkout";
import DodoPayments from "dodopayments";

const checkoutSessionPayloadValidator = v.object({
  product_cart: v.array(
    v.object({
      product_id: v.string(),
      quantity: v.number(),
    }),
  ),
  customer: v.optional(
    v.object({
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      phone_number: v.optional(v.string()),
    }),
  ),
  billing_address: v.optional(
    v.object({
      street: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      country: v.string(),
      zipcode: v.optional(v.string()),
    }),
  ),
  return_url: v.optional(v.string()),
  allowed_payment_method_types: v.optional(v.array(v.string())),
  billing_currency: v.optional(v.string()),
  show_saved_payment_methods: v.optional(v.boolean()),
  confirm: v.optional(v.boolean()),
  discount_code: v.optional(v.string()),
  metadata: v.optional(v.record(v.string(), v.string())),
  customization: v.optional(
    v.object({
      theme: v.optional(v.string()),
      show_order_details: v.optional(v.boolean()),
      show_on_demand_tag: v.optional(v.boolean()),
    }),
  ),
  feature_flags: v.optional(
    v.object({
      allow_currency_selection: v.optional(v.boolean()),
      allow_discount_code: v.optional(v.boolean()),
      allow_phone_number_collection: v.optional(v.boolean()),
      allow_tax_id: v.optional(v.boolean()),
      always_create_new_customer: v.optional(v.boolean()),
    }),
  ),
  subscription_data: v.optional(
    v.object({
      trial_period_days: v.optional(v.number()),
    }),
  ),
});

export const checkout = action({
  args: {
    payload: checkoutSessionPayloadValidator,
    apiKey: v.string(),
    environment: v.union(v.literal("test_mode"), v.literal("live_mode")),
  },
  returns: v.object({ checkout_url: v.string() }),
  handler: async (
    _,
    { payload, apiKey, environment },
  ): Promise<{ checkout_url: string }> => {
    const checkoutUrl = await buildCheckoutUrl({
      sessionPayload: payload as CheckoutSessionPayload,
      bearerToken: apiKey,
      environment,
      type: "session",
    });
    return { checkout_url: checkoutUrl };
  },
});

export const customerPortal = action({
  args: {
    dodoCustomerId: v.string(),
    send_email: v.optional(v.boolean()),
    apiKey: v.string(),
    environment: v.union(v.literal("test_mode"), v.literal("live_mode")),
  },
  returns: v.object({ portal_url: v.string() }),
  handler: async (
    _,
    { dodoCustomerId, send_email, apiKey, environment },
  ): Promise<{ portal_url: string }> => {
    if (!dodoCustomerId) {
      throw new Error("dodoCustomerId is required for customerPortal.");
    }

    const dodopayments = new DodoPayments({
      bearerToken: apiKey,
      environment,
    });

    const params = {
      send_email: Boolean(send_email),
    };

    const session = await dodopayments.customers.customerPortal.create(
      dodoCustomerId,
      params,
    );
    return { portal_url: session.link };
  },
});

import { mutation } from "../component/_generated/server";
import { v } from "convex/values";
import { buildCheckoutUrl, type CheckoutSessionPayload } from "@dodopayments/core/checkout";
import DodoPayments from "dodopayments";

// Component functions following the official Convex component pattern
// Each function is directly accessible as components.dodopayments.lib.functionName

// Modern session checkout (recommended)
export const checkout = mutation({
  args: {
    payload: v.any(), // CheckoutSessionPayload
  },
  returns: v.object({ checkout_url: v.string() }),
  handler: async (_, { payload }) => {
    const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
    const environment = process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode";

    if (!bearerToken || !environment) {
      throw new Error("Dodo Payments environment variables are not set in your Convex dashboard.");
    }

    const checkoutUrl = await buildCheckoutUrl({
      sessionPayload: payload as CheckoutSessionPayload,
      bearerToken,
      environment,
      type: "session",
    });
    return { checkout_url: checkoutUrl };
  },
});

// Alias for checkout (session checkout)
export const sessionCheckout = mutation({
  args: {
    payload: v.any(), // CheckoutSessionPayload
  },
  returns: v.object({ checkout_url: v.string() }),
  handler: async (_, { payload }) => {
    const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
    const environment = process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode";

    if (!bearerToken || !environment) {
      throw new Error("Dodo Payments environment variables are not set in your Convex dashboard.");
    }

    const checkoutUrl = await buildCheckoutUrl({
      sessionPayload: payload as CheckoutSessionPayload,
      bearerToken,
      environment,
      type: "session",
    });
    return { checkout_url: checkoutUrl };
  },
});

// Static checkout with query parameters
export const staticCheckout = mutation({
  args: {
    productId: v.string(),
    quantity: v.optional(v.string()),
    returnUrl: v.optional(v.string()),
  },
  returns: v.object({ checkout_url: v.string() }),
  handler: async (_, args) => {
    const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
    const environment = process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode";

    if (!bearerToken || !environment) {
      throw new Error("Dodo Payments environment variables are not set in your Convex dashboard.");
    }

    const checkoutUrl = await buildCheckoutUrl({
      queryParams: args,
      bearerToken,
      environment,
      type: "static",
    });
    return { checkout_url: checkoutUrl };
  },
});

// Dynamic checkout with API body
export const dynamicCheckout = mutation({
  args: {
    product_id: v.optional(v.string()),
    product_cart: v.optional(v.array(v.object({
      product_id: v.string(),
      quantity: v.number(),
    }))),
    billing: v.object({
      city: v.string(),
      country: v.string(),
      state: v.string(),
      street: v.string(),
      zipcode: v.string(),
    }),
    customer: v.object({
      customer_id: v.optional(v.string()),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
    }),
  },
  returns: v.object({ checkout_url: v.string() }),
  handler: async (_, args) => {
    const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
    const environment = process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode";

    if (!bearerToken || !environment) {
      throw new Error("Dodo Payments environment variables are not set in your Convex dashboard.");
    }

    const checkoutUrl = await buildCheckoutUrl({
      body: args,
      bearerToken,
      environment,
      type: "dynamic",
    });
    return { checkout_url: checkoutUrl };
  },
});

// Customer portal
export const customerPortal = mutation({
  args: {
    customerId: v.string(),
    send_email: v.optional(v.boolean()),
  },
  returns: v.object({ portal_url: v.string() }),
  handler: async (_, { customerId, send_email }) => {
    const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
    const environment = process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode";

    if (!bearerToken || !environment) {
      throw new Error("Dodo Payments environment variables are not set in your Convex dashboard.");
    }

    if (!customerId) {
      throw new Error("customerId is required for customerPortal.");
    }

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });
    const params = {
      send_email: Boolean(send_email),
    };
    const session = await dodopayments.customers.customerPortal.create(customerId, params);
    return { portal_url: session.link };
  },
});
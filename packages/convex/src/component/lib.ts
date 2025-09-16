import { action } from "../component/_generated/server";
import { v } from "convex/values";
import { 
  buildCheckoutUrl, 
  type CheckoutSessionPayload,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
  type CheckoutSessionResponse 
} from "@dodopayments/core/checkout";
import DodoPayments from "dodopayments";
import { z } from "zod";

const checkoutSessionPayloadValidator = v.object({
  product_cart: v.array(v.object({
    product_id: v.string(),
    quantity: v.number(),
  })),
  customer: v.optional(v.object({
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    phone_number: v.optional(v.string()),
  })),
  billing_address: v.optional(v.object({
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.string(),
    zipcode: v.optional(v.string()),
  })),
  return_url: v.optional(v.string()),
  allowed_payment_method_types: v.optional(v.array(v.string())),
  billing_currency: v.optional(v.string()),
  show_saved_payment_methods: v.optional(v.boolean()),
  confirm: v.optional(v.boolean()),
  discount_code: v.optional(v.string()),
  metadata: v.optional(v.record(v.string(), v.string())),
  customization: v.optional(v.object({
    theme: v.optional(v.string()),
    show_order_details: v.optional(v.boolean()),
    show_on_demand_tag: v.optional(v.boolean()),
  })),
  feature_flags: v.optional(v.object({
    allow_currency_selection: v.optional(v.boolean()),
    allow_discount_code: v.optional(v.boolean()),
    allow_phone_number_collection: v.optional(v.boolean()),
    allow_tax_id: v.optional(v.boolean()),
    always_create_new_customer: v.optional(v.boolean()),
  })),
  subscription_data: v.optional(v.object({
    trial_period_days: v.optional(v.number()),
  })),
});

// Type for static checkout query parameters based on checkoutQuerySchema
type StaticCheckoutArgs = z.infer<typeof checkoutQuerySchema>;

// Type for dynamic checkout body based on dynamicCheckoutBodySchema
type DynamicCheckoutArgs = z.infer<typeof dynamicCheckoutBodySchema>;

// Convex validator for dynamic checkout body
const dynamicCheckoutValidator = v.object({
  product_id: v.string(),
  quantity: v.optional(v.number()),
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
  discount_id: v.optional(v.string()),
  addons: v.optional(v.array(v.object({
    addon_id: v.string(),
    quantity: v.number(),
  }))),
  metadata: v.optional(v.record(v.string(), v.string())),
  currency: v.optional(v.string()),
  allowed_payment_method_types: v.optional(v.array(v.string())),
  billing_currency: v.optional(v.string()),
  discount_code: v.optional(v.string()),
  on_demand: v.optional(v.boolean()),
  return_url: v.optional(v.string()),
  show_saved_payment_methods: v.optional(v.boolean()),
  tax_id: v.optional(v.string()),
  trial_period_days: v.optional(v.number()),
});


export const checkout = action({
  args: {
    payload: checkoutSessionPayloadValidator,
    apiKey: v.string(),
    environment: v.union(v.literal("test_mode"), v.literal("live_mode")),
  },
  returns: v.object({ checkout_url: v.string() }),
  handler: async (_, { payload, apiKey, environment }): Promise<{ checkout_url: string }> => {
    const checkoutUrl = await buildCheckoutUrl({
      sessionPayload: payload as CheckoutSessionPayload,
      bearerToken: apiKey,
      environment,
      type: "session",
    });
    return { checkout_url: checkoutUrl };
  },
});


export const sessionCheckout = action({
  args: {
    payload: checkoutSessionPayloadValidator,
    apiKey: v.string(),
    environment: v.union(v.literal("test_mode"), v.literal("live_mode")),
  },
  returns: v.object({ checkout_url: v.string() }),
  handler: async (_, { payload, apiKey, environment }): Promise<{ checkout_url: string }> => {
    const checkoutUrl = await buildCheckoutUrl({
      sessionPayload: payload as CheckoutSessionPayload,
      bearerToken: apiKey,
      environment,
      type: "session",
    });
    return { checkout_url: checkoutUrl };
  },
});

export const staticCheckout = action({
  args: {
    productId: v.string(),
    quantity: v.optional(v.string()),
    returnUrl: v.optional(v.string()),
    // Customer fields
    fullName: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    country: v.optional(v.string()),
    addressLine: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    // Disable flags
    disableFullName: v.optional(v.string()),
    disableFirstName: v.optional(v.string()),
    disableLastName: v.optional(v.string()),
    disableEmail: v.optional(v.string()),
    disableCountry: v.optional(v.string()),
    disableAddressLine: v.optional(v.string()),
    disableCity: v.optional(v.string()),
    disableState: v.optional(v.string()),
    disableZipCode: v.optional(v.string()),
    // Advanced controls
    paymentCurrency: v.optional(v.string()),
    showCurrencySelector: v.optional(v.string()),
    paymentAmount: v.optional(v.string()),
    showDiscounts: v.optional(v.string()),
    apiKey: v.string(),
    environment: v.union(v.literal("test_mode"), v.literal("live_mode")),
  },
  returns: v.object({ checkout_url: v.string() }),
  handler: async (_, { apiKey, environment, ...args }): Promise<{ checkout_url: string }> => {
    const checkoutUrl = await buildCheckoutUrl({
      queryParams: args as StaticCheckoutArgs,
      bearerToken: apiKey,
      environment,
      type: "static",
    });
    return { checkout_url: checkoutUrl };
  },
});

export const dynamicCheckout = action({
  args: {
    ...dynamicCheckoutValidator.fields,
    apiKey: v.string(),
    environment: v.union(v.literal("test_mode"), v.literal("live_mode")),
  },
  returns: v.object({ checkout_url: v.string() }),
  handler: async (_, { apiKey, environment, ...args }): Promise<{ checkout_url: string }> => {
    const checkoutUrl = await buildCheckoutUrl({
      body: args as DynamicCheckoutArgs,
      bearerToken: apiKey,
      environment,
      type: "dynamic",
    });
    return { checkout_url: checkoutUrl };
  },
});


export const customerPortal = action({
  args: {
    customerId: v.string(),
    send_email: v.optional(v.boolean()),
    apiKey: v.string(),
    environment: v.union(v.literal("test_mode"), v.literal("live_mode")),
  },
  returns: v.object({ portal_url: v.string() }),
  handler: async (_, { customerId, send_email, apiKey, environment }): Promise<{ portal_url: string }> => {
    if (!customerId) {
      throw new Error("customerId is required for customerPortal.");
    }

    const dodopayments = new DodoPayments({
      bearerToken: apiKey,
      environment,
    });
    
    const params = {
      send_email: Boolean(send_email),
    };
    
    const session = await dodopayments.customers.customerPortal.create(customerId, params);
    return { portal_url: session.link };
  },
});
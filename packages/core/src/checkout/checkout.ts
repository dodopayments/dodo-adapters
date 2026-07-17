import { z } from "zod/v3";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CheckoutHandlerConfig = Pick<
  ClientOptions,
  "bearerToken" | "environment"
> & { returnUrl?: string; type?: "dynamic" | "static" | "session" };

export const checkoutQuerySchema = z
  .object({
    productId: z.string(),
    quantity: z.string().optional(),
    // Customer fields
    fullName: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    country: z.string().optional(),
    addressLine: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    // Disable flags
    disableFullName: z.string().optional(),
    disableFirstName: z.string().optional(),
    disableLastName: z.string().optional(),
    disableEmail: z.string().optional(),
    disableCountry: z.string().optional(),
    disableAddressLine: z.string().optional(),
    disableCity: z.string().optional(),
    disableState: z.string().optional(),
    disableZipCode: z.string().optional(),
    // Advanced controls
    paymentCurrency: z.string().optional(),
    showCurrencySelector: z.string().optional(),
    paymentAmount: z.string().optional(),
    showDiscounts: z.string().optional(),
    // Metadata (allow any key starting with metadata_)
    // We'll handle metadata separately in the handler
  })
  .catchall(z.unknown());

// Add Zod schema for dynamic checkout body
export const dynamicCheckoutBodySchema = z
  .object({
    // For subscription
    product_id: z.string().optional(),
    quantity: z.number().optional(),

    // For one-time payment
    product_cart: z
      .array(
        z.object({
          product_id: z.string(),
          quantity: z.number(),
        }),
      )
      .optional(),

    // Common fields
    billing: z.object({
      city: z.string(),
      country: z.string(),
      state: z.string(),
      street: z.string(),
      zipcode: z.string(),
    }),
    customer: z.object({
      customer_id: z.string().optional(),
      email: z.string().optional(),
      name: z.string().optional(),
    }),
    discount_id: z.string().optional(),
    addons: z
      .array(
        z.object({
          addon_id: z.string(),
          quantity: z.number(),
        }),
      )
      .optional(),
    metadata: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .optional(),
    currency: z.string().optional(),

    // Discount codes (legacy + stacked).
    // `discount_code` is deprecated but still supported for backward
    // compatibility. `discount_codes` is the new stacked-discount field (max
    // 20, applied in order). The two cannot be combined in the same request.
    discount_code: z.string().optional(),
    // Lazy-evaluated so we can share the schema definition below.
    discount_codes: z
      .array(z.string().min(1, "Discount code cannot be empty"))
      .max(20, "At most 20 stacked discount codes are allowed")
      .optional(),
    // Allow any additional fields (for future compatibility)
  })
  .catchall(z.unknown());

// ========================================
// SHARED DISCOUNT CODE HELPERS
// ========================================

/**
 * Max number of stacked discount codes accepted by the Dodo Payments API.
 * Mirrors the `discount_codes` array constraint on `/checkouts`, `/payments`,
 * `/subscriptions`, and `/subscriptions/{id}/change-plan`.
 */
export const MAX_STACKED_DISCOUNT_CODES = 20;

/**
 * Stacked discount codes schema: max 20, applied in order.
 * The Dodo API treats `discount_codes` and the legacy singular `discount_code`
 * as mutually exclusive — combining them in the same request is a validation
 * error. The legacy `discount_code` field remains fully supported.
 */
export const discountCodesSchema = z
  .array(z.string().min(1, "Discount code cannot be empty"))
  .max(
    MAX_STACKED_DISCOUNT_CODES,
    `At most ${MAX_STACKED_DISCOUNT_CODES} stacked discount codes are allowed`,
  );

// ========================================
// CHECKOUT SESSIONS SCHEMAS & TYPES
// ========================================

// Per-checkout-session credit entitlement override.
// Allows callers to override the product-level `credits_amount` for a single
// session without cloning the underlying product. The referenced
// `credit_entitlement_id` must already be attached to the product.
export const checkoutSessionCreditEntitlementOverrideSchema = z.object({
  credit_entitlement_id: z.string().min(1, "credit_entitlement_id is required"),
  credits_amount: z
    .string()
    .min(1, "credits_amount is required (string for precision)"),
});

// Product cart item schema for checkout sessions
export const checkoutSessionProductCartItemSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  addons: z
    .array(
      z.object({
        addon_id: z.string(),
        quantity: z.number().int().nonnegative(),
      }),
    )
    .nullable()
    .optional(),
  amount: z
    .number()
    .int()
    .nonnegative(
      "Amount must be a non-negative integer (for pay-what-you-want products)",
    )
    .nullable()
    .optional(),
  // Per-checkout-session credit entitlement overrides. Each entry overrides
  // the `credits_amount` granted by the referenced credit entitlement when
  // this checkout session is fulfilled. The credit_entitlement_id must
  // already be attached to the product.
  credit_entitlements: z
    .array(checkoutSessionCreditEntitlementOverrideSchema)
    .nullable()
    .optional(),
});

// Customer information schema for checkout sessions
// Supports both creating new customers and attaching existing ones
export const checkoutSessionCustomerSchema = z
  .union([
    z.object({
      email: z.string().email(),
      name: z.string().min(1).nullable().optional(),
      phone_number: z.string().nullable().optional(),
    }),
    z.object({
      customer_id: z.string(),
    }),
  ])
  .nullable()
  .optional();

// Billing address schema for checkout sessions
export const checkoutSessionBillingAddressSchema = z
  .object({
    street: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    country: z.string().length(2, "Country must be a 2-letter ISO code"),
    zipcode: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

// Payment method types enum.
export const paymentMethodTypeSchema = z.enum([
  "ach",
  "affirm",
  "afterpay_clearpay",
  "alfamart",
  "ali_pay",
  "ali_pay_hk",
  "alma",
  "amazon_pay",
  "apple_pay",
  "atome",
  "bacs",
  "bancontact_card",
  "becs",
  "benefit",
  "bizum",
  "blik",
  "boleto",
  "bca_bank_transfer",
  "bni_va",
  "bri_va",
  "card_redirect",
  "cimb_va",
  "classic",
  "credit",
  "crypto_currency",
  "cashapp",
  "dana",
  "danamon_va",
  "debit",
  "duit_now",
  "efecty",
  "eft",
  "eps",
  "fps",
  "evoucher",
  "giropay",
  "givex",
  "google_pay",
  "go_pay",
  "gcash",
  "ideal",
  "interac",
  "indomaret",
  "klarna",
  "kakao_pay",
  "local_bank_redirect",
  "mandiri_va",
  "knet",
  "mb_way",
  "mobile_pay",
  "momo",
  "momo_atm",
  "multibanco",
  "online_banking_thailand",
  "online_banking_czech_republic",
  "online_banking_finland",
  "online_banking_fpx",
  "online_banking_poland",
  "online_banking_slovakia",
  "oxxo",
  "pago_efectivo",
  "permata_bank_transfer",
  "open_banking_uk",
  "pay_bright",
  "paypal",
  "paze",
  "pix",
  "pay_safe_card",
  "przelewy24",
  "prompt_pay",
  "pse",
  "red_compra",
  "red_pagos",
  "samsung_pay",
  "sepa",
  "sepa_bank_transfer",
  "sofort",
  "sunbit",
  "swish",
  "touch_n_go",
  "trustly",
  "twint",
  "upi_collect",
  "upi_intent",
  "vipps",
  "viet_qr",
  "venmo",
  "walley",
  "we_chat_pay",
  "seven_eleven",
  "lawson",
  "mini_stop",
  "family_mart",
  "seicomart",
  "pay_easy",
  "local_bank_transfer",
  "mifinity",
  "open_banking_pis",
  "direct_carrier_billing",
  "instant_bank_transfer",
  "billie",
  "zip",
  "revolut_pay",
  "naver_pay",
  "payco",
  "satispay",
]);

// Color configuration for a single theme mode. All color fields accept
// standard CSS color formats (hex, rgb/rgba, hsl/hsla, named colors, etc.).
export const checkoutSessionThemeModeConfigSchema = z.object({
  bg_primary: z.string().nullable().optional(),
  bg_secondary: z.string().nullable().optional(),
  border_primary: z.string().nullable().optional(),
  border_secondary: z.string().nullable().optional(),
  button_primary: z.string().nullable().optional(),
  button_primary_hover: z.string().nullable().optional(),
  button_secondary: z.string().nullable().optional(),
  button_secondary_hover: z.string().nullable().optional(),
  button_text_primary: z.string().nullable().optional(),
  button_text_secondary: z.string().nullable().optional(),
  input_focus_border: z.string().nullable().optional(),
  text_error: z.string().nullable().optional(),
  text_placeholder: z.string().nullable().optional(),
  text_primary: z.string().nullable().optional(),
  text_secondary: z.string().nullable().optional(),
  text_success: z.string().nullable().optional(),
});

// Custom theme configuration with colors for light and dark modes.
export const checkoutSessionThemeConfigSchema = z.object({
  dark: checkoutSessionThemeModeConfigSchema.nullable().optional(),
  font_primary_url: z.string().nullable().optional(),
  font_secondary_url: z.string().nullable().optional(),
  font_size: z
    .enum(["xs", "sm", "md", "lg", "xl", "2xl"])
    .nullable()
    .optional(),
  font_weight: z
    .enum(["normal", "medium", "bold", "extraBold"])
    .nullable()
    .optional(),
  light: checkoutSessionThemeModeConfigSchema.nullable().optional(),
  pay_button_text: z.string().nullable().optional(),
  radius: z.string().nullable().optional(),
});

// Customization options schema
export const checkoutSessionCustomizationSchema = z
  .object({
    force_language: z.string().nullable().optional(),
    show_on_demand_tag: z.boolean().optional(),
    show_order_details: z.boolean().optional(),
    theme: z.enum(["dark", "light", "system"]).nullable().optional(),
    theme_config: checkoutSessionThemeConfigSchema.nullable().optional(),
  })
  .optional();

// Feature flags schema
export const checkoutSessionFeatureFlagsSchema = z
  .object({
    allow_currency_selection: z.boolean().optional(),
    allow_customer_editing_business_name: z.boolean().optional(),
    allow_customer_editing_city: z.boolean().optional(),
    allow_customer_editing_country: z.boolean().optional(),
    allow_customer_editing_email: z.boolean().optional(),
    allow_customer_editing_name: z.boolean().optional(),
    allow_customer_editing_state: z.boolean().optional(),
    allow_customer_editing_street: z.boolean().optional(),
    allow_customer_editing_tax_id: z.boolean().optional(),
    allow_customer_editing_zipcode: z.boolean().optional(),
    allow_discount_code: z.boolean().optional(),
    allow_editing_addons: z.boolean().optional(),
    allow_phone_number_collection: z.boolean().optional(),
    allow_tax_id: z.boolean().optional(),
    always_create_new_customer: z.boolean().optional(),
    redirect_immediately: z.boolean().optional(),
    require_phone_number: z.boolean().optional(),
  })
  .optional();

// On-demand subscription schema
export const checkoutSessionOnDemandSchema = z
  .object({
    mandate_only: z.boolean(),
    adaptive_currency_fees_inclusive: z.boolean().nullable().optional(),
    product_currency: z.string().nullable().optional(),
    product_description: z.string().nullable().optional(),
    product_price: z.number().int().nullable().optional(),
  })
  .optional();

// Subscription data schema
export const checkoutSessionSubscriptionDataSchema = z
  .object({
    on_demand: checkoutSessionOnDemandSchema.nullable(),
    trial_period_days: z.number().int().nonnegative().nullable().optional(),
  })
  .nullable()
  .optional();

// Custom field definition schema for checkout sessions
export const checkoutSessionCustomFieldSchema = z.object({
  field_type: z.enum([
    "text",
    "number",
    "email",
    "url",
    "date",
    "dropdown",
    "boolean",
  ]),
  key: z.string(),
  label: z.string(),
  options: z.array(z.string()).nullable().optional(),
  placeholder: z.string().nullable().optional(),
  required: z.boolean().optional(),
});

// Main checkout session payload schema
//
// NOTE: The `discount_code` (deprecated, singular) and `discount_codes`
// (stacked, max 20) fields are mutually exclusive — they cannot both be
// provided in the same request. This is enforced at runtime by
// `assertDiscountFieldsExclusive` (called from `createCheckoutSession` and
// `buildCheckoutUrl`) rather than by a `.superRefine` on the schema, so
// downstream consumers can still call `.extend()` on the base ZodObject.
export const checkoutSessionPayloadSchema = z.object({
  // Required fields
  product_cart: z
    .array(checkoutSessionProductCartItemSchema)
    .min(1, "At least one product is required"),

  // Optional fields
  allowed_payment_method_types: z
    .array(paymentMethodTypeSchema)
    .nullable()
    .optional(),
  billing_address: checkoutSessionBillingAddressSchema,
  billing_currency: z
    .string()
    .length(3, "Currency must be a 3-letter ISO code")
    .nullable()
    .optional(),
  // URL to redirect to if the customer cancels/goes back; back button is
  // hidden when unset.
  cancel_url: z.string().nullable().optional(),
  confirm: z.boolean().optional(),
  // Custom fields to collect from the customer during checkout (max 5).
  custom_fields: z
    .array(checkoutSessionCustomFieldSchema)
    .nullable()
    .optional(),
  customer: checkoutSessionCustomerSchema,
  // Business/legal name shown on the invoice for B2B purchases with a tax id.
  customer_business_name: z.string().nullable().optional(),
  customization: checkoutSessionCustomizationSchema,
  /**
   * @deprecated Use `discount_codes` instead. The singular `discount_code`
   * field continues to work for backward compatibility but cannot be
   * combined with the new `discount_codes` array in the same request.
   */
  discount_code: z.string().nullable().optional(),
  /**
   * Stacked discount codes to apply, in order of application. Up to 20
   * codes. Cannot be combined with the deprecated singular `discount_code`
   * in the same request.
   */
  discount_codes: discountCodesSchema.nullable().optional(),
  feature_flags: checkoutSessionFeatureFlagsSchema,
  force_3ds: z.boolean().nullable().optional(),
  // Override the merchant mandate floor (in INR paise) for INR e-mandates.
  mandate_min_amount_inr_paise: z.number().int().nullable().optional(),
  // SDK `Metadata` allows string, number, and boolean values.
  metadata: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .nullable()
    .optional(),
  // When confirm is true, only require zipcode; other address fields optional.
  minimal_address: z.boolean().optional(),
  // Only allowed when `confirm` is true; requires an existing customer id.
  payment_method_id: z.string().nullable().optional(),
  product_collection_id: z.string().nullable().optional(),
  return_url: z.string().url().nullable().optional(),
  short_link: z.boolean().optional(),
  show_saved_payment_methods: z.boolean().optional(),
  subscription_data: checkoutSessionSubscriptionDataSchema,
  // VAT/tax number. Requires billing_address with country.
  tax_id: z.string().nullable().optional(),
});

/**
 * Runtime check enforcing the API constraint that `discount_code` (legacy,
 * singular) and `discount_codes` (stacked array) cannot both be provided in
 * the same request. Throws a descriptive Error on conflict; no-ops otherwise.
 */
export function assertDiscountFieldsExclusive(input: {
  discount_code?: string | null;
  discount_codes?: string[] | null;
}) {
  if (
    input.discount_code != null &&
    input.discount_code !== "" &&
    input.discount_codes != null &&
    input.discount_codes.length > 0
  ) {
    throw new Error(
      "Cannot use both `discount_code` and `discount_codes` in the same request. The singular `discount_code` is deprecated — prefer `discount_codes`.",
    );
  }
}

// Checkout session response schema.
// `checkout_url` is null when a `payment_method_id` is provided (confirm-mode
// sessions that create a PaymentIntent at creation time); in that case
// `client_secret`, `payment_id`, and `publishable_key` are returned instead.
export const checkoutSessionResponseSchema = z.object({
  session_id: z.string().min(1, "Session ID is required"),
  checkout_url: z.string().url("Invalid checkout URL").nullable().optional(),
  client_secret: z.string().nullable().optional(),
  payment_id: z.string().nullable().optional(),
  publishable_key: z.string().nullable().optional(),
});

// Type exports for external use
export type CheckoutSessionPayload = z.infer<
  typeof checkoutSessionPayloadSchema
>;
export type CheckoutSessionResponse = z.infer<
  typeof checkoutSessionResponseSchema
>;
export type CheckoutSessionProductCartItem = z.infer<
  typeof checkoutSessionProductCartItemSchema
>;
export type CheckoutSessionCreditEntitlementOverride = z.infer<
  typeof checkoutSessionCreditEntitlementOverrideSchema
>;
export type DiscountCodes = z.infer<typeof discountCodesSchema>;
export type CheckoutSessionCustomer = z.infer<
  typeof checkoutSessionCustomerSchema
>;
export type CheckoutSessionBillingAddress = z.infer<
  typeof checkoutSessionBillingAddressSchema
>;
export type CheckoutSessionCustomization = z.infer<
  typeof checkoutSessionCustomizationSchema
>;
export type CheckoutSessionThemeConfig = z.infer<
  typeof checkoutSessionThemeConfigSchema
>;
export type CheckoutSessionThemeModeConfig = z.infer<
  typeof checkoutSessionThemeModeConfigSchema
>;
export type CheckoutSessionCustomField = z.infer<
  typeof checkoutSessionCustomFieldSchema
>;
export type CheckoutSessionFeatureFlags = z.infer<
  typeof checkoutSessionFeatureFlagsSchema
>;
export type CheckoutSessionOnDemand = z.infer<
  typeof checkoutSessionOnDemandSchema
>;
export type CheckoutSessionSubscriptionData = z.infer<
  typeof checkoutSessionSubscriptionDataSchema
>;
export type PaymentMethodType = z.infer<typeof paymentMethodTypeSchema>;

// Configuration type for checkout session handler
export type CheckoutSessionHandlerConfig = Pick<
  ClientOptions,
  "bearerToken" | "environment"
>;

/**
 * Creates a new Dodo Payments Checkout Session using the modern /checkouts endpoint.
 * This function provides a clean, type-safe interface to the Checkout Sessions API.
 *
 * @param payload - The checkout session data, validated against CheckoutSessionPayloadSchema
 * @param config - Dodo Payments client configuration (bearerToken, environment)
 * @returns Promise<CheckoutSessionResponse> - The checkout session with session_id and checkout_url
 *
 * @throws {Error} When payload validation fails or API request fails
 *
 * @example
 * ```typescript
 * const session = await createCheckoutSession({
 *   product_cart: [{ product_id: 'prod_123', quantity: 1 }],
 *   customer: { email: 'customer@example.com' },
 *   return_url: 'https://yoursite.com/success'
 * }, {
 *   bearerToken: process.env.DODO_PAYMENTS_API_KEY,
 *   environment: 'test_mode'
 * });
 *
 * ```
 */
export const createCheckoutSession = async (
  payload: CheckoutSessionPayload,
  config: CheckoutSessionHandlerConfig,
): Promise<CheckoutSessionResponse> => {
  // Validate the payload against the schema
  const validation = checkoutSessionPayloadSchema.safeParse(payload);
  if (!validation.success) {
    throw new Error(
      `Invalid checkout session payload: ${validation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ")}`,
    );
  }

  // Enforce the API-level constraint: the deprecated singular `discount_code`
  // cannot be combined with the stacked `discount_codes` array. Doing this
  // here (instead of via .superRefine on the schema) keeps the schema as a
  // plain ZodObject so consumers like @dodopayments/better-auth can still
  // call .extend() on it.
  assertDiscountFieldsExclusive(validation.data);

  // Initialize the DodoPayments client
  const dodopayments = new DodoPayments({
    bearerToken: config.bearerToken,
    environment: config.environment,
  });

  try {
    // Use the official SDK for creating checkout sessions
    const sdkPayload = {
      ...validation.data,
      ...(validation.data.billing_address && {
        billing_address: {
          ...validation.data.billing_address,
          country: validation.data.billing_address.country as any,
        },
      }),
    };

    const session = await dodopayments.checkoutSessions.create(
      sdkPayload as any,
    );

    // Validate and return the response
    const responseValidation = checkoutSessionResponseSchema.safeParse(session);
    if (!responseValidation.success) {
      throw new Error(
        `Invalid checkout session response from API: ${responseValidation.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ")}`,
      );
    }

    return responseValidation.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Dodo Payments Checkout Session API Error:", {
        message: error.message,
        payload: validation.data,
        config: {
          environment: config.environment,
          hasBearerToken: !!config.bearerToken,
        },
      });

      // Re-throw with a more user-friendly message
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }

    // Handle non-Error objects
    console.error("Unknown error creating checkout session:", error);
    throw new Error(
      "Failed to create checkout session due to an unknown error",
    );
  }
};

export const buildCheckoutUrl = async ({
  queryParams,
  body,
  sessionPayload,
  returnUrl,
  bearerToken,
  environment,
  type = "static",
}: CheckoutHandlerConfig & {
  queryParams?: z.infer<typeof checkoutQuerySchema>;
  body?: z.infer<typeof dynamicCheckoutBodySchema>;
  sessionPayload?: CheckoutSessionPayload;
}) => {
  if (type === "session") {
    if (!sessionPayload) {
      throw new Error("sessionPayload is required when type is 'session'");
    }

    // Use sessionPayload.return_url if provided, otherwise fall back to config's returnUrl
    const finalPayload = {
      ...sessionPayload,
      return_url: sessionPayload.return_url ?? returnUrl,
    };

    const session = await createCheckoutSession(finalPayload, {
      bearerToken,
      environment,
    });

    // `checkout_url` is null for confirm-mode sessions (payment_method_id).
    // buildCheckoutUrl must return a redirectable URL, so treat that as an error.
    if (!session.checkout_url) {
      throw new Error(
        "No checkout_url returned from Dodo Payments API. This can happen for confirm-mode sessions created with a payment_method_id; use createCheckoutSession directly to access client_secret/payment_id.",
      );
    }

    return session.checkout_url;
  }

  // For dynamic, use body; for static, use queryParams
  const inputData = type === "dynamic" ? body : queryParams;
  // Use the correct schema for each type
  let parseResult;
  if (type === "dynamic") {
    parseResult = dynamicCheckoutBodySchema.safeParse(inputData);
  } else {
    parseResult = checkoutQuerySchema.safeParse(inputData);
  }
  const { success, data, error } = parseResult;

  if (!success) {
    throw new Error(
      `Invalid ${type === "dynamic" ? "body" : "query parameters"}.\n ${error.message}`,
    );
  }

  if (type !== "dynamic") {
    // Static checkout logic (old fields)
    const {
      productId,
      quantity,
      fullName,
      firstName,
      lastName,
      email,
      country,
      addressLine,
      city,
      state,
      zipCode,
      disableFullName,
      disableFirstName,
      disableLastName,
      disableEmail,
      disableCountry,
      disableAddressLine,
      disableCity,
      disableState,
      disableZipCode,
      paymentCurrency,
      showCurrencySelector,
      paymentAmount,
      showDiscounts,
      // metadata handled below
    } = data as z.infer<typeof checkoutQuerySchema>;

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    // Check that the product exists for this merchant
    if (!productId) throw new Error("Missing required field: productId");
    try {
      await dodopayments.products.retrieve(productId);
    } catch (err) {
      console.error(err);
      throw new Error("Product not found");
    }

    const url = new URL(
      `${environment === "test_mode" ? "https://test.checkout.dodopayments.com" : "https://checkout.dodopayments.com"}/buy/${productId}`,
    );
    url.searchParams.set("quantity", quantity ? String(quantity) : "1");
    if (returnUrl) url.searchParams.set("redirect_url", returnUrl);

    // Customer/billing fields
    if (fullName) url.searchParams.set("fullName", String(fullName));
    if (firstName) url.searchParams.set("firstName", String(firstName));
    if (lastName) url.searchParams.set("lastName", String(lastName));
    if (email) url.searchParams.set("email", String(email));
    if (country) url.searchParams.set("country", String(country));
    if (addressLine) url.searchParams.set("addressLine", String(addressLine));
    if (city) url.searchParams.set("city", String(city));
    if (state) url.searchParams.set("state", String(state));
    if (zipCode) url.searchParams.set("zipCode", String(zipCode));

    // Disable flags (must be set to 'true' to disable)
    if (disableFullName === "true")
      url.searchParams.set("disableFullName", "true");
    if (disableFirstName === "true")
      url.searchParams.set("disableFirstName", "true");
    if (disableLastName === "true")
      url.searchParams.set("disableLastName", "true");
    if (disableEmail === "true") url.searchParams.set("disableEmail", "true");
    if (disableCountry === "true")
      url.searchParams.set("disableCountry", "true");
    if (disableAddressLine === "true")
      url.searchParams.set("disableAddressLine", "true");
    if (disableCity === "true") url.searchParams.set("disableCity", "true");
    if (disableState === "true") url.searchParams.set("disableState", "true");
    if (disableZipCode === "true")
      url.searchParams.set("disableZipCode", "true");

    // Advanced controls
    if (paymentCurrency)
      url.searchParams.set("paymentCurrency", String(paymentCurrency));
    if (showCurrencySelector)
      url.searchParams.set(
        "showCurrencySelector",
        String(showCurrencySelector),
      );
    if (paymentAmount)
      url.searchParams.set("paymentAmount", String(paymentAmount));
    if (showDiscounts)
      url.searchParams.set("showDiscounts", String(showDiscounts));

    // Metadata: add all query params starting with metadata_
    for (const [key, value] of Object.entries(queryParams || {})) {
      if (key.startsWith("metadata_") && value && typeof value !== "object") {
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }

  // --- dynamic checkout logic ---
  // Use new schema field names
  const dyn = data as z.infer<typeof dynamicCheckoutBodySchema>;

  // Enforce the API-level mutual-exclusion between `discount_code` and
  // `discount_codes` (see comment on `assertDiscountFieldsExclusive`).
  assertDiscountFieldsExclusive({
    discount_code: dyn.discount_code,
    discount_codes: dyn.discount_codes,
  });

  const {
    product_id,
    product_cart,
    quantity,
    billing,
    customer,
    addons,
    metadata,
    allowed_payment_method_types,
    billing_currency,
    discount_code,
    discount_codes,
    on_demand,
    return_url: bodyReturnUrl,
    show_saved_payment_methods,
    tax_id,
    trial_period_days,
  } = dyn;

  const dodopayments = new DodoPayments({
    bearerToken,
    environment,
  });

  // Determine if this is a subscription or one-time payment
  let isSubscription = false;
  let productIdToFetch: string | undefined = product_id;
  if (!product_id && product_cart && product_cart.length > 0) {
    productIdToFetch = product_cart[0].product_id;
  }
  if (!productIdToFetch)
    throw new Error(
      "Missing required field: product_id or product_cart[0].product_id",
    );

  let product;
  try {
    product = await dodopayments.products.retrieve(productIdToFetch);
  } catch (err) {
    console.error(err);
    throw new Error("Product not found");
  }
  isSubscription = Boolean(product.is_recurring);
  // Required field validation
  if (isSubscription && !product_id)
    throw new Error("Missing required field: product_id for subscription");
  if (!billing) throw new Error("Missing required field: billing");
  if (!customer) throw new Error("Missing required field: customer");

  if (isSubscription) {
    // Use subscriptions.create for subscription products
    const subscriptionPayload: any = {
      billing: billing as any,
      customer: customer as any,
      product_id: product_id!,
      quantity: quantity ? Number(quantity) : 1,
    };
    if (metadata) subscriptionPayload.metadata = metadata;
    // Discount codes — `discount_codes` (stacked, up to 20) is preferred.
    // The deprecated singular `discount_code` is still supported for
    // backward compatibility but cannot be combined with `discount_codes`
    // in the same request (enforced at the schema layer).
    if (discount_codes && discount_codes.length > 0) {
      subscriptionPayload.discount_codes = discount_codes;
    } else if (discount_code) {
      subscriptionPayload.discount_code = discount_code;
    }
    if (addons) subscriptionPayload.addons = addons;
    if (allowed_payment_method_types)
      subscriptionPayload.allowed_payment_method_types =
        allowed_payment_method_types;
    if (billing_currency)
      subscriptionPayload.billing_currency = billing_currency;
    if (on_demand) subscriptionPayload.on_demand = on_demand;
    subscriptionPayload.payment_link = true;
    // Use bodyReturnUrl if present, otherwise use top-level returnUrl
    if (bodyReturnUrl) {
      subscriptionPayload.return_url = bodyReturnUrl;
    } else if (returnUrl) {
      subscriptionPayload.return_url = returnUrl;
    }
    if (show_saved_payment_methods)
      subscriptionPayload.show_saved_payment_methods =
        show_saved_payment_methods;
    if (tax_id) subscriptionPayload.tax_id = tax_id;
    if (trial_period_days)
      subscriptionPayload.trial_period_days = trial_period_days;
    let subscription;
    try {
      subscription =
        await dodopayments.subscriptions.create(subscriptionPayload);
    } catch (err) {
      console.error("Error when creating subscription", err);
      throw new Error(err instanceof Error ? err.message : String(err));
    }
    if (!subscription || !subscription.payment_link) {
      throw new Error(
        "No payment link returned from Dodo Payments API (subscription). Make sure to set payment_link as true in payload",
      );
    }
    return subscription.payment_link;
  } else {
    // Use payments.create for one-time products
    let cart = product_cart;
    if (!cart && product_id) {
      cart = [
        { product_id: product_id, quantity: quantity ? Number(quantity) : 1 },
      ];
    }
    if (!cart || cart.length === 0)
      throw new Error("Missing required field: product_cart or product_id");
    const paymentPayload: any = {
      billing: billing as any,
      customer: customer as any,
      product_cart: cart as any,
    };
    if (metadata) paymentPayload.metadata = metadata;
    paymentPayload.payment_link = true;
    if (allowed_payment_method_types)
      paymentPayload.allowed_payment_method_types =
        allowed_payment_method_types;
    if (billing_currency) paymentPayload.billing_currency = billing_currency;
    // Discount codes — `discount_codes` (stacked, up to 20) is preferred.
    // The deprecated singular `discount_code` is still supported for
    // backward compatibility but cannot be combined with `discount_codes`
    // in the same request (enforced at the schema layer).
    if (discount_codes && discount_codes.length > 0) {
      paymentPayload.discount_codes = discount_codes;
    } else if (discount_code) {
      paymentPayload.discount_code = discount_code;
    }
    // Use bodyReturnUrl if present, otherwise use top-level returnUrl
    if (bodyReturnUrl) {
      paymentPayload.return_url = bodyReturnUrl;
    } else if (returnUrl) {
      paymentPayload.return_url = returnUrl;
    }
    if (show_saved_payment_methods)
      paymentPayload.show_saved_payment_methods = show_saved_payment_methods;
    if (tax_id) paymentPayload.tax_id = tax_id;

    let payment;
    try {
      payment = await dodopayments.payments.create(paymentPayload as any);
    } catch (err) {
      console.error("Error when creating payment link", err);
      throw new Error(err instanceof Error ? err.message : String(err));
    }
    if (!payment || !payment.payment_link) {
      throw new Error(
        "No payment link returned from Dodo Payments API. Make sure to set payment_link as true in payload.",
      );
    }
    return payment.payment_link;
  }
};

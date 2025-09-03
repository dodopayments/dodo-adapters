import { z } from "zod";
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
    metadata: z.record(z.string(), z.string()).optional(),
    currency: z.string().optional(),
    // Allow any additional fields (for future compatibility)
  })
  .catchall(z.unknown());

// ========================================
// CHECKOUT SESSIONS SCHEMAS & TYPES
// ========================================

// Product cart item schema for checkout sessions
export const checkoutSessionProductCartItemSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

// Customer information schema for checkout sessions
export const checkoutSessionCustomerSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  phone_number: z.string().optional(),
}).optional();

// Billing address schema for checkout sessions
export const checkoutSessionBillingAddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().length(2, "Country must be a 2-letter ISO code"),
  zipcode: z.string().optional(),
}).optional();

// Payment method types enum based on Dodo Payments documentation
export const paymentMethodTypeSchema = z.enum([
  "credit",
  "debit", 
  "upi_collect",
  "upi_intent",
  "apple_pay",
  "google_pay",
  "amazon_pay",
  "klarna",
  "affirm",
  "afterpay_clearpay",
  "sepa",
  "ach"
]);

// Customization options schema
export const checkoutSessionCustomizationSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  show_order_details: z.boolean().optional(),
  show_on_demand_tag: z.boolean().optional(),
}).optional();

// Feature flags schema
export const checkoutSessionFeatureFlagsSchema = z.object({
  allow_currency_selection: z.boolean().optional(),
  allow_discount_code: z.boolean().optional(),
  allow_phone_number_collection: z.boolean().optional(),
  allow_tax_id: z.boolean().optional(),
  always_create_new_customer: z.boolean().optional(),
}).optional();

// Subscription data schema
export const checkoutSessionSubscriptionDataSchema = z.object({
  trial_period_days: z.number().int().nonnegative().optional(),
}).optional();

// Main checkout session payload schema
export const checkoutSessionPayloadSchema = z.object({
  // Required fields
  product_cart: z.array(checkoutSessionProductCartItemSchema).min(1, "At least one product is required"),
  
  // Optional fields
  customer: checkoutSessionCustomerSchema,
  billing_address: checkoutSessionBillingAddressSchema,
  return_url: z.string().url().optional(),
  allowed_payment_method_types: z.array(paymentMethodTypeSchema).optional(),
  billing_currency: z.string().length(3, "Currency must be a 3-letter ISO code").optional(),
  show_saved_payment_methods: z.boolean().optional(),
  confirm: z.boolean().optional(),
  discount_code: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  customization: checkoutSessionCustomizationSchema,
  feature_flags: checkoutSessionFeatureFlagsSchema,
  subscription_data: checkoutSessionSubscriptionDataSchema,
});

// Checkout session response schema
export const checkoutSessionResponseSchema = z.object({
  session_id: z.string().min(1, "Session ID is required"),
  checkout_url: z.string().url("Invalid checkout URL"),
});

// Type exports for external use
export type CheckoutSessionPayload = z.infer<typeof checkoutSessionPayloadSchema>;
export type CheckoutSessionResponse = z.infer<typeof checkoutSessionResponseSchema>;
export type CheckoutSessionProductCartItem = z.infer<typeof checkoutSessionProductCartItemSchema>;
export type CheckoutSessionCustomer = z.infer<typeof checkoutSessionCustomerSchema>;
export type CheckoutSessionBillingAddress = z.infer<typeof checkoutSessionBillingAddressSchema>;
export type CheckoutSessionCustomization = z.infer<typeof checkoutSessionCustomizationSchema>;
export type CheckoutSessionFeatureFlags = z.infer<typeof checkoutSessionFeatureFlagsSchema>;
export type CheckoutSessionSubscriptionData = z.infer<typeof checkoutSessionSubscriptionDataSchema>;
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
  config: CheckoutSessionHandlerConfig
): Promise<CheckoutSessionResponse> => {
  // Validate the payload against the schema
  const validation = checkoutSessionPayloadSchema.safeParse(payload);
  if (!validation.success) {
    throw new Error(
      `Invalid checkout session payload: ${validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')}`
    );
  }

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
    
    const session = await dodopayments.checkoutSessions.create(sdkPayload as any);

    // Validate and return the response
    const responseValidation = checkoutSessionResponseSchema.safeParse(session);
    if (!responseValidation.success) {
      throw new Error(
        `Invalid checkout session response from API: ${responseValidation.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ')}`
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
          hasBearerToken: !!config.bearerToken 
        }
      });
      
      // Re-throw with a more user-friendly message
      throw new Error(
        `Failed to create checkout session: ${error.message}`
      );
    }
    
    // Handle non-Error objects
    console.error("Unknown error creating checkout session:", error);
    throw new Error("Failed to create checkout session due to an unknown error");
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
    
    const session = await createCheckoutSession(sessionPayload, {
      bearerToken,
      environment,
    });
    
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
    if (discount_code) subscriptionPayload.discount_code = discount_code;
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
    if (discount_code) paymentPayload.discount_code = discount_code;
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

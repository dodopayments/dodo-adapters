import { z } from "zod";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CheckoutHandlerConfig = Pick<
  ClientOptions,
  "bearerToken" | "environment"
> & { returnUrl?: string; type?: "dynamic" | "static" };

export const checkoutQuerySchema = z.object({
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
});

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

export const buildCheckoutUrl = async ({
  queryParams,
  body,
  returnUrl,
  bearerToken,
  environment,
  type = "static",
}: CheckoutHandlerConfig & {
  queryParams?: z.infer<typeof checkoutQuerySchema>;
  body?: Record<string, unknown>;
}) => {
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
    payment_link,
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
    if (payment_link) subscriptionPayload.payment_link = payment_link;
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
      subscription = await dodopayments.subscriptions.create(
        subscriptionPayload as any,
      );
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
    if (payment_link) paymentPayload.payment_link = payment_link;
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

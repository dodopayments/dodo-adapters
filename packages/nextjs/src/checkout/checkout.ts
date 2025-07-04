import DodoPayments from "dodopayments";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { z } from "zod";

const checkoutQuerySchema = z.object({
  productId: z.string(),
  quantity: z.string().optional(),
  redirect_url: z.string().optional(),
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

export const Checkout = ({
  bearerToken,
  environment,
}: any) => {
  const getHandler = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams);
    const { success, data, error } = checkoutQuerySchema.safeParse(queryParams);

    if (!success) {
      if (error.errors.some((e: any) => e.path.toString() === "productId")) {
        return new Response("Please provide productId query parameter", {
          status: 400,
        });
      }
      return new Response(`Invalid query parameters.\n ${error.message}`, {
        status: 400,
      });
    }

    const {
      productId,
      quantity,
      redirect_url,
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
    } = data;

    const baseURL =
    environment === "test_mode"
      ? "https://test.dodopayments.com"
      : "https://live.dodopayments.com";

    const dodopayments = new DodoPayments({
      bearerToken,
      baseURL,
    });

    // check that the product exists for this merchant
    try {
      await dodopayments.products.retrieve(productId);
    } catch (err) {
      console.error(err);
      return new Response(`Product not found`, { status: 404 });
    }

   

    const url = new URL(`${baseURL}/buy/${productId}`);

    url.searchParams.set("quantity", quantity || "1");
    url.searchParams.set("redirect_url", redirect_url || "");

    // Customer/billing fields
    if (fullName) url.searchParams.set("fullName", fullName);
    if (firstName) url.searchParams.set("firstName", firstName);
    if (lastName) url.searchParams.set("lastName", lastName);
    if (email) url.searchParams.set("email", email);
    if (country) url.searchParams.set("country", country);
    if (addressLine) url.searchParams.set("addressLine", addressLine);
    if (city) url.searchParams.set("city", city);
    if (state) url.searchParams.set("state", state);
    if (zipCode) url.searchParams.set("zipCode", zipCode);

    // Disable flags (must be set to 'true' to disable)
    if (disableFullName === "true") url.searchParams.set("disableFullName", "true");
    if (disableFirstName === "true") url.searchParams.set("disableFirstName", "true");
    if (disableLastName === "true") url.searchParams.set("disableLastName", "true");
    if (disableEmail === "true") url.searchParams.set("disableEmail", "true");
    if (disableCountry === "true") url.searchParams.set("disableCountry", "true");
    if (disableAddressLine === "true") url.searchParams.set("disableAddressLine", "true");
    if (disableCity === "true") url.searchParams.set("disableCity", "true");
    if (disableState === "true") url.searchParams.set("disableState", "true");
    if (disableZipCode === "true") url.searchParams.set("disableZipCode", "true");

    // Advanced controls
    if (paymentCurrency) url.searchParams.set("paymentCurrency", paymentCurrency);
    if (showCurrencySelector) url.searchParams.set("showCurrencySelector", showCurrencySelector);
    if (paymentAmount) url.searchParams.set("paymentAmount", paymentAmount);
    if (showDiscounts) url.searchParams.set("showDiscounts", showDiscounts);

    // Metadata: add all query params starting with metadata_
    for (const [key, value] of Object.entries(queryParams)) {
      if (key.startsWith("metadata_") && value) {
        url.searchParams.set(key, value as string);
      }
    }

    redirect(url.toString());
  };

  return getHandler;
};
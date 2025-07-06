import { H3Event, sendRedirect, getQuery, createError } from "h3";
import {
  buildCheckoutUrl,
  type CheckoutHandlerConfig,
  checkoutQuerySchema,
} from "@dodo/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  const handler = async (event: H3Event) => {
    const queryParams = getQuery(event);

    // Convert query params to the format expected by the schema
    const queryParamsFormatted = Object.fromEntries(
      Object.entries(queryParams).map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] : value,
      ]),
    );

    const { success, data, error } =
      checkoutQuerySchema.safeParse(queryParamsFormatted);

    if (!success) {
      if (error.errors.some((e: any) => e.path.toString() === "productId")) {
        throw createError({
          statusCode: 400,
          statusMessage: "Please provide productId query parameter",
        });
      }
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid query parameters.\n ${error.message}`,
      });
    }

    let url = "";

    try {
      url = await buildCheckoutUrl({ queryParams: data, ...config });
    } catch (error: any) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message,
      });
    }

    return sendRedirect(event, url);
  };

  return handler;
};

import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
  checkoutSessionPayloadSchema,
} from "@dodopayments/core/checkout";
import { getQuery, readBody, sendRedirect, H3Event, createError } from "h3";

export function checkoutHandler(config: CheckoutHandlerConfig) {
  return async (event: H3Event) => {
    if (event.method === "POST") {
      const body = await readBody(event);

      if (config.type === "dynamic") {
        // Handle dynamic checkout
        const { success, data, error } =
          dynamicCheckoutBodySchema.safeParse(body);
        if (!success) {
          throw createError({
            statusCode: 400,
            statusMessage: "Invalid request body",
            data: error.format(),
          });
        }
        try {
          const url = await buildCheckoutUrl({
            body: data,
            ...config,
            type: "dynamic",
          });
          return { checkout_url: url };
        } catch (error: any) {
          throw createError({ statusCode: 400, statusMessage: error.message });
        }
      } else {
        // Handle checkout session
        const { success, data, error } =
          checkoutSessionPayloadSchema.safeParse(body);
        if (!success) {
          throw createError({
            statusCode: 400,
            statusMessage: "Invalid checkout session payload",
            data: error.format(),
          });
        }
        try {
          const url = await buildCheckoutUrl({
            sessionPayload: data,
            ...config,
            type: "session",
          });
          return { checkout_url: url };
        } catch (error: any) {
          throw createError({ statusCode: 400, statusMessage: error.message });
        }
      }
    } else {
      const queryParams = getQuery(event);

      if (!queryParams.productId) {
        throw createError({
          statusCode: 400,
          statusMessage: "Please provide productId query parameter",
        });
      }

      const { success, data, error } =
        checkoutQuerySchema.safeParse(queryParams);
      if (!success) {
        if (error.errors.some((e: any) => e.path.toString() === "productId")) {
          throw createError({
            statusCode: 400,
            statusMessage: "Please provide productId query parameter",
          });
        }
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid query parameters",
          data: error.format(),
        });
      }
      try {
        const url = await buildCheckoutUrl({ queryParams: data, ...config });
        return { checkout_url: url };
      } catch (error: any) {
        throw createError({ statusCode: 400, statusMessage: error.message });
      }
    }
  };
}

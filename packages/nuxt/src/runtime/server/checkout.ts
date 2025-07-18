import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema
} from "@dodopayments/core/checkout";
import { getQuery, readBody, sendRedirect, H3Event, createError } from "h3";

export function checkoutHandler(config: CheckoutHandlerConfig) {
  return async (event: H3Event) => {
    if (event.method === "POST") {
      const body = await readBody(event);
      const { success, data, error } = dynamicCheckoutBodySchema.safeParse(body);
      if (!success) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid request body",
          data: error.format()
        });
      }
      try {
        const url = await buildCheckoutUrl({ body: data, ...config, type: "dynamic" });
        return sendRedirect(event, url, 302);
      } catch (error: any) {
        throw createError({ statusCode: 400, statusMessage: error.message });
      }
    } else {
      const queryParams = getQuery(event);
      const { success, data, error } = checkoutQuerySchema.safeParse(queryParams);
      if (!success) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid query parameters",
          data: error.format()
        });
      }
      try {
        const url = await buildCheckoutUrl({ queryParams: data, ...config });
        return sendRedirect(event, url, 302);
      } catch (error: any) {
        throw createError({ statusCode: 400, statusMessage: error.message });
      }
    }
  };
}

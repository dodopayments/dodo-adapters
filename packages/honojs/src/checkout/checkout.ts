import { Context } from "hono";
import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
} from "@dodo/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  const honoHandler = async (c: Context) => {
    const url = new URL(c.req.url);
    const queryParams = Object.fromEntries(url.searchParams);

    const { success, data, error } = checkoutQuerySchema.safeParse(queryParams);

    if (!success) {
      if (error.errors.some((e: any) => e.path.toString() === "productId")) {
        return c.text("Please provide productId query parameter", 400);
      }
      return c.text(`Invalid query parameters.\n ${error.message}`, 400);
    }

    let checkoutUrl = "";

    try {
      checkoutUrl = await buildCheckoutUrl({ queryParams: data, ...config });
    } catch (error: any) {
      return c.text(error.message, 400);
    }

    return c.redirect(checkoutUrl);
  };

  return honoHandler;
};

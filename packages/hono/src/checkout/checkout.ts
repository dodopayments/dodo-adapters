import { Context } from "hono";
import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
} from "@dodopayments/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  const getHandler = async (c: Context) => {
    const queryParams = c.req.query();

    if (!queryParams.productId) {
      return c.text("Please provide productId query parameter", 400);
    }

    const { success, data, error } = checkoutQuerySchema.safeParse(queryParams);

    if (!success) {
      if (error.errors.some((e: any) => e.path.toString() === "productId")) {
        return c.text("Please provide productId query parameter", 400);
      }
      return c.text(`Invalid query parameters.\n ${error.message}`, 400);
    }

    let url = "";

    try {
      url = await buildCheckoutUrl({ queryParams: data, ...config });
    } catch (error: any) {
      return c.text(error.message, 400);
    }

    return c.redirect(url);
  };

  const postHandler = async (c: Context) => {
    let body: any;
    try {
      body = await c.req.json();
    } catch (e) {
      return c.text("Invalid JSON body", 400);
    }

    const { success, data, error } = dynamicCheckoutBodySchema.safeParse(body);

    if (!success) {
      return c.text(`Invalid request body.\n ${error.message}`, 400);
    }

    let url = "";
    try {
      url = await buildCheckoutUrl({ body: data, ...config});
    } catch (error: any) {
      return c.text(error.message, 400);
    }
    return c.redirect(url);
  };

  return (c: Context) => {
    if (c.req.method === "POST") {
      return postHandler(c);
    }
    return getHandler(c);
  };
};

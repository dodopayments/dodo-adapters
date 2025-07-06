import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
} from "@dodo/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig): RequestHandler => {
  return async ({ url }) => {
    const { searchParams } = url;
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

    let checkoutUrl = "";

    try {
      checkoutUrl = await buildCheckoutUrl({ queryParams: data, ...config });
    } catch (error: any) {
      return new Response(error.message, { status: 400 });
    }

    throw redirect(302, checkoutUrl);
  };
};

import type { APIRoute } from "astro";
import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
} from "@dodo/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig): APIRoute => {
  return async ({ request, redirect }) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
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

    return redirect(checkoutUrl);
  };
};

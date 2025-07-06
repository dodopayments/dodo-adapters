import { redirect } from "@remix-run/server-runtime";
import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
} from "@dodo/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  const loader = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);

    const { success, data, error } = checkoutQuerySchema.safeParse(queryParams);

    if (!success) {
      if (error.errors.some((e: any) => e.path.toString() === "productId")) {
        throw new Response("Please provide productId query parameter", {
          status: 400,
        });
      }
      throw new Response(`Invalid query parameters.\n ${error.message}`, {
        status: 400,
      });
    }

    let checkoutUrl = "";

    try {
      checkoutUrl = await buildCheckoutUrl({ queryParams: data, ...config });
    } catch (error: any) {
      throw new Response(error.message, { status: 400 });
    }

    throw redirect(checkoutUrl);
  };

  return loader;
};

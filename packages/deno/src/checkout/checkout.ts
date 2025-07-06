import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
} from "@dodo/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams);

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

    return new Response(null, {
      status: 302,
      headers: {
        Location: checkoutUrl,
      },
    });
  };

  return handler;
};
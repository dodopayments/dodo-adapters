import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
  checkoutSessionPayloadSchema,
} from "@dodopayments/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  const getHandler = async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);

    if (!queryParams.productId) {
      return new Response("Please provide productId query parameter", {
        status: 400,
      });
    }

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

    return Response.json({ checkout_url: checkoutUrl });
  };

  const postHandler = async (request: Request): Promise<Response> => {
    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return new Response("Invalid JSON body", { status: 400 });
    }

    if (config.type === "dynamic") {
      // Handle dynamic checkout
      const { success, data, error } =
        dynamicCheckoutBodySchema.safeParse(body);

      if (!success) {
        return new Response(`Invalid request body.\n ${error.message}`, {
          status: 400,
        });
      }

      let checkoutUrl = "";
      try {
        checkoutUrl = await buildCheckoutUrl({
          body: data,
          ...config,
          type: "dynamic",
        });
      } catch (error: any) {
        return new Response(error.message, { status: 400 });
      }
      return Response.json({ checkout_url: checkoutUrl });
    } else {
      // Handle checkout session
      const { success, data, error } =
        checkoutSessionPayloadSchema.safeParse(body);

      if (!success) {
        return new Response(
          `Invalid checkout session payload.\n ${error.message}`,
          { status: 400 }
        );
      }

      let checkoutUrl = "";
      try {
        checkoutUrl = await buildCheckoutUrl({
          sessionPayload: data,
          ...config,
          type: "session",
        });
      } catch (error: any) {
        return new Response(error.message, { status: 400 });
      }
      return Response.json({ checkout_url: checkoutUrl });
    }
  };

  return (request: Request): Promise<Response> => {
    if (request.method === "POST") {
      return postHandler(request);
    }
    return getHandler(request);
  };
};

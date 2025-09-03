import { error, type RequestHandler } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import {
  buildCheckoutUrl,
  type CheckoutHandlerConfig,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
  checkoutSessionPayloadSchema,
} from "@dodopayments/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  const getHandler: RequestHandler = async (event: RequestEvent) => {
    const searchParams = event.url.searchParams;
    const queryParams = Object.fromEntries(searchParams);

    if (!queryParams.productId) {
      throw error(400, "Please provide productId query parameter");
    }

    const {
      success,
      data,
      error: zodError,
    } = checkoutQuerySchema.safeParse(queryParams);

    if (!success) {
      if (zodError.errors.some((e: any) => e.path.toString() === "productId")) {
        throw error(400, "Please provide productId query parameter");
      }
      throw error(400, `Invalid query parameters.\n ${zodError.message}`);
    }

    let urlStr = "";
    try {
      urlStr = await buildCheckoutUrl({ queryParams: data, ...config });
    } catch (err: any) {
      throw error(400, err.message);
    }

    return Response.json({ checkout_url: urlStr });
  };

  const postHandler: RequestHandler = async (event: RequestEvent) => {
    let body: any;
    try {
      body = await event.request.json();
    } catch (e) {
      throw error(400, "Invalid JSON body");
    }

    if (config.type === "dynamic") {
      // Handle dynamic checkout
      const {
        success,
        data,
        error: zodError,
      } = dynamicCheckoutBodySchema.safeParse(body);

      if (!success) {
        throw error(400, `Invalid request body.\n ${zodError.message}`);
      }

      let urlStr = "";
      try {
        urlStr = await buildCheckoutUrl({ body: data, ...config, type: "dynamic" });
      } catch (err: any) {
        throw error(400, err.message);
      }

      return Response.json({ checkout_url: urlStr });
    } else {
      // Handle checkout session
      const {
        success,
        data,
        error: zodError,
      } = checkoutSessionPayloadSchema.safeParse(body);

      if (!success) {
        throw error(400, `Invalid checkout session payload.\n ${zodError.message}`);
      }

      let urlStr = "";
      try {
        urlStr = await buildCheckoutUrl({
          sessionPayload: data,
          ...config,
          type: "session"
        });
      } catch (err: any) {
        throw error(400, err.message);
      }

      return Response.json({ checkout_url: urlStr });
    }
  };

  // SvelteKit expects named exports for HTTP verbs
  return {
    GET: getHandler,
    POST: postHandler,
  };
};

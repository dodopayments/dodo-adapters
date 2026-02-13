import type { Context } from "koa";
import {
  buildCheckoutUrl,
  dynamicCheckoutBodySchema,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
  checkoutSessionPayloadSchema,
} from "@dodopayments/core/checkout";

// Extend Koa types to include body parser properties
interface KoaRequestWithBody extends Context {
  request: Context["request"] & {
    body?: any;
  };
}

export function Checkout(config: CheckoutHandlerConfig) {
  const getHandler = async (ctx: Context) => {
    const queryParams = ctx.query;

    if (!queryParams.productId) {
      ctx.status = 400;
      ctx.body = { error: "Please provide productId query parameter" };
      return;
    }

    const { success, data, error } = checkoutQuerySchema.safeParse(queryParams);

    if (!success) {
      if (error.errors.some((e: any) => e.path.toString() === "productId")) {
        ctx.status = 400;
        ctx.body = { error: "Please provide productId query parameter" };
        return;
      }
      ctx.status = 400;
      ctx.body = { error: `Invalid query parameters: ${error.message}` };
      return;
    }

    try {
      const checkoutUrl = await buildCheckoutUrl({ queryParams: data, ...config });
      ctx.body = { checkout_url: checkoutUrl };
    } catch (error: any) {
      ctx.status = 400;
      ctx.body = { error: "Failed to create checkout session" };
    }
  };

  const postHandler = async (ctx: KoaRequestWithBody) => {
    if (config.type === "dynamic") {
      // Handle dynamic checkout
      const { success, data, error } = dynamicCheckoutBodySchema.safeParse(
        ctx.request.body
      );

      if (!success) {
        ctx.status = 400;
        ctx.body = { error: `Invalid request body: ${error.message}` };
        return;
      }

      try {
        const checkoutUrl = await buildCheckoutUrl({
          body: data,
          ...config,
          type: "dynamic",
        });
        ctx.body = { checkout_url: checkoutUrl };
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: "Failed to create checkout session" };
      }
    } else {
      // Handle checkout session
      const { success, data, error } = checkoutSessionPayloadSchema.safeParse(
        ctx.request.body
      );

      if (!success) {
        ctx.status = 400;
        ctx.body = { error: `Invalid checkout session payload: ${error.message}` };
        return;
      }

      try {
        const checkoutUrl = await buildCheckoutUrl({
          sessionPayload: data,
          ...config,
          type: "session",
        });
        ctx.body = { checkout_url: checkoutUrl };
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: "Failed to create checkout session" };
      }
    }
  };

  return async (ctx: Context) => {
    if (ctx.method === "POST") {
      return postHandler(ctx);
    }

    if (ctx.method === "GET") {
      return getHandler(ctx);
    }

    ctx.status = 405;
    ctx.body = { error: "Method Not Allowed" };
  };
}

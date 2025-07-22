import type { APIContext, APIRoute } from "astro";
import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
} from "@dodopayments/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig): APIRoute => {
  const getHandler = async ({ request }: APIContext) => {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);

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

    let url = "";

    try {
      url = await buildCheckoutUrl({ queryParams: data, ...config });
    } catch (error: any) {
      return new Response(error.message, { status: 400 });
    }

    return Response.redirect(url, 307);
  };

  const postHandler = async ({ request }: APIContext) => {
    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const { success, data, error } = dynamicCheckoutBodySchema.safeParse(body);

    if (!success) {
      return new Response(`Invalid request body.\n ${error.message}`, {
        status: 400,
      });
    }

    let url = "";
    try {
      url = await buildCheckoutUrl({ body: data, ...config, type: "dynamic" });
    } catch (error: any) {
      return new Response(error.message, { status: 400 });
    }
    return Response.redirect(url, 307);
  };

  return (context: APIContext) => {
    if (context.request.method === "POST") {
      return postHandler(context);
    }
    return getHandler(context);
  };
};

import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
} from "@dodopayments/core/checkout";

/**
 * TanStack React Start Checkout handler
 * Usage: export const GET = Checkout(config); export const POST = Checkout(config);
 */
export function Checkout(config: CheckoutHandlerConfig) {
  return async function (request: Request) {
    if (request.method === "POST") {
      // Handle dynamic checkout (POST)
      let body: any;
      try {
        body = await request.json();
      } catch (e) {
        return new Response("Invalid JSON body", { status: 400 });
      }

      const { success, data, error } =
        dynamicCheckoutBodySchema.safeParse(body);
      if (!success) {
        return new Response(`Invalid request body.\n ${error.message}`, {
          status: 400,
        });
      }

      let url = "";
      try {
        url = await buildCheckoutUrl({ body: data, ...config });
      } catch (error: any) {
        return new Response(error.message, { status: 400 });
      }
      return Response.redirect(url, 302);
    } else {
      // Handle static checkout (GET)
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams);

      if (!queryParams.productId) {
        return new Response("Please provide productId query parameter", {
          status: 400,
        });
      }

      const { success, data, error } =
        checkoutQuerySchema.safeParse(queryParams);
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
      return Response.redirect(url, 302);
    }
  };
}

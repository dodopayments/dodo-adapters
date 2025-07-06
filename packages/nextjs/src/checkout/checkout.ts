import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { buildCheckoutUrl, checkoutQuerySchema } from "@dodo/core/checkout";

export const Checkout = ({ bearerToken, environment }: any) => {
  const getHandler = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
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

    let url = "";

    try {
      url = await buildCheckoutUrl(data, bearerToken, environment);
    } catch (error: any) {
      return new Response(error.message, { status: 400 });
    }

    redirect(url);
  };

  return getHandler;
};

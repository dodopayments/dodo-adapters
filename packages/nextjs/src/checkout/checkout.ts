import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
} from "@dodo/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  const getHandler = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams);

    const { success, data, error } = checkoutQuerySchema.safeParse(queryParams);

    if (!success) {
      if (error.errors.some((e: any) => e.path.toString() === "productId")) {
        return new NextResponse("Please provide productId query parameter", {
          status: 400,
        });
      }
      return new NextResponse(`Invalid query parameters.\n ${error.message}`, {
        status: 400,
      });
    }

    let url = "";

    try {
      url = await buildCheckoutUrl({ queryParams: data, ...config });
    } catch (error: any) {
      return new NextResponse(error.message, { status: 400 });
    }

    redirect(url);
  };

  return getHandler;
};

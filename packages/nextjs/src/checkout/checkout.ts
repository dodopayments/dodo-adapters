import { NextRequest, NextResponse } from "next/server";
import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
} from "@dodopayments/core/checkout";

export const Checkout = (config: CheckoutHandlerConfig) => {
  const getHandler = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams);

    if (!queryParams.productId) {
      return new NextResponse("Please provide productId query parameter", {
        status: 400,
      });
    }

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

    return NextResponse.redirect(url);
  };

  const postHandler = async (req: NextRequest) => {
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      return new NextResponse("Invalid JSON body", { status: 400 });
    }

    const { success, data, error } = dynamicCheckoutBodySchema.safeParse(body);

    if (!success) {
      return new NextResponse(`Invalid request body.\n ${error.message}`, {
        status: 400,
      });
    }

    let url = "";
    try {
      url = await buildCheckoutUrl({ body: data, ...config, type: "dynamic" });
    } catch (error: any) {
      return new NextResponse(error.message, { status: 400 });
    }
    return NextResponse.redirect(url);
  };

  return (req: NextRequest) => {
    if (req.method === "POST") {
      return postHandler(req);
    }
    return getHandler(req);
  };
};

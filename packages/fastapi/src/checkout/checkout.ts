import {
  buildCheckoutUrl,
  CheckoutHandlerConfig,
  checkoutQuerySchema,
} from "@dodo/core/checkout";

export interface CheckoutRequest {
  url: string;
  query_params: Record<string, string>;
}

export interface CheckoutResponse {
  status_code: number;
  headers?: Record<string, string>;
  content?: string;
}

export const Checkout = (config: CheckoutHandlerConfig) => {
  const handler = async (
    request: CheckoutRequest,
  ): Promise<CheckoutResponse> => {
    const queryParams = request.query_params;

    const { success, data, error } = checkoutQuerySchema.safeParse(queryParams);

    if (!success) {
      if (error.errors.some((e: any) => e.path.toString() === "productId")) {
        return {
          status_code: 400,
          content: "Please provide productId query parameter",
        };
      }
      return {
        status_code: 400,
        content: `Invalid query parameters.\n ${error.message}`,
      };
    }

    let url = "";

    try {
      url = await buildCheckoutUrl({ queryParams: data, ...config });
    } catch (error: any) {
      return {
        status_code: 400,
        content: error.message,
      };
    }

    return {
      status_code: 302,
      headers: {
        Location: url,
      },
    };
  };

  return handler;
};

// Helper function to create a FastAPI route handler
export const createCheckoutRoute = (config: CheckoutHandlerConfig) => {
  const handler = Checkout(config);

  return `
from fastapi import Request
from fastapi.responses import RedirectResponse
import json

async def checkout_handler(request: Request):
    """
    FastAPI route handler for Dodo Payments checkout.
    
    Usage:
    from your_fastapi_app import app
    
    @app.get("/checkout")
    async def checkout(request: Request):
        return await checkout_handler(request)
    """
    
    # Convert FastAPI request to our format
    fastapi_request = {
        "url": str(request.url),
        "query_params": dict(request.query_params)
    }
    
    # Call the TypeScript handler logic (this would be implemented in Python)
    # For now, this is a template that shows the structure
    
    try:
        # This would call the actual checkout logic
        checkout_url = await build_checkout_url(fastapi_request["query_params"], ${JSON.stringify(config)})
        return RedirectResponse(url=checkout_url, status_code=302)
    except Exception as e:
        return {"error": str(e)}, 400
`;
};

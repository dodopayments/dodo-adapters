import DodoPayments, { ClientOptions } from "dodopayments";

export interface CustomerPortalRequest {
  url: string;
  headers: Record<string, string>;
  method: string;
}

export interface CustomerPortalResponse {
  status_code: number;
  headers?: Record<string, string>;
  content?: string;
}

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
> & {
  getCustomerId: (req: CustomerPortalRequest) => Promise<string>;
};

export const CustomerPortal = ({
  bearerToken,
  environment,
  getCustomerId,
}: CustomerPortalConfig) => {
  const handler = async (
    request: CustomerPortalRequest,
  ): Promise<CustomerPortalResponse> => {
    const customerId = await getCustomerId(request);

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session =
        await dodopayments.customers.customerPortal.create(customerId);

      return {
        status_code: 302,
        headers: {
          Location: session.link,
        },
      };
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      return {
        status_code: 500,
        content: `Failed to create customer portal session: ${error.message}`,
      };
    }
  };

  return handler;
};

// Helper function to create a FastAPI route handler
export const createCustomerPortalRoute = (config: CustomerPortalConfig) => {
  const handler = CustomerPortal(config);

  return `
from fastapi import Request
from fastapi.responses import RedirectResponse
import json

async def customer_portal_handler(request: Request):
    """
    FastAPI route handler for Dodo Payments customer portal.
    
    Usage:
    from your_fastapi_app import app
    
    @app.get("/customer-portal")
    async def customer_portal(request: Request):
        return await customer_portal_handler(request)
    """
    
    # Convert FastAPI request to our format
    fastapi_request = {
        "url": str(request.url),
        "headers": dict(request.headers),
        "method": request.method
    }
    
    # Call the TypeScript handler logic (this would be implemented in Python)
    # For now, this is a template that shows the structure
    
    try:
        # This would call the actual customer portal logic
        # You need to implement get_customer_id function
        customer_id = await get_customer_id(fastapi_request)
        portal_url = await create_customer_portal_session(customer_id, ${JSON.stringify(config)})
        return RedirectResponse(url=portal_url, status_code=302)
    except Exception as e:
        return {"error": str(e)}, 500
`;
};

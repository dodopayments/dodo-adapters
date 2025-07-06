/**
 * Fresh framework example for customer portal route
 * File: routes/customer-portal.ts
 */

import { Handlers } from "$fresh/server.ts";
import { CustomerPortal } from "@dodo/deno";

const customerPortalHandler = CustomerPortal({
  bearerToken: Deno.env.get("DODO_PAYMENTS_API_KEY")!,
  environment: "test_mode",
  getCustomerId: async (req: Request) => {
    // Implement your authentication logic here
    // This is just an example - extract customer ID from your auth system
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    // Your authentication logic here
    const customerId = "customer_example_id";
    return customerId;
  },
});

export const handler: Handlers = {
  GET: customerPortalHandler,
};
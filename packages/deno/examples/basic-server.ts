/**
 * Basic example showing how to use @dodo/deno with Deno's built-in HTTP server
 *
 * Run with:
 * deno run --allow-net --allow-env examples/basic-server.ts
 */

import { Checkout, CustomerPortal, Webhooks } from "../src/index.ts";
import { WebhookPayload } from "@dodo/core";

// Setup handlers
const checkoutHandler = Checkout({
  bearerToken: Deno.env.get("DODO_PAYMENTS_API_KEY")!,
  successUrl: Deno.env.get("SUCCESS_URL"),
  environment: "test_mode",
});

const customerPortalHandler = CustomerPortal({
  bearerToken: Deno.env.get("DODO_PAYMENTS_API_KEY")!,
  environment: "test_mode",
  getCustomerId: async (req: Request) => {
    // Simple example - in production, implement proper authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    // Extract customer ID from your auth system
    return "customer_example_id";
  },
});

const webhookHandler = Webhooks({
  webhookKey: Deno.env.get("DODO_WEBHOOK_SECRET")!,
  onPayload: async (payload: WebhookPayload) => {
    console.log("Received webhook:", payload.type);
  },
  onPaymentSucceeded: async (payload: WebhookPayload) => {
    console.log("Payment succeeded:", payload.data);
  },
});

// Start server
Deno.serve({ port: 8000 }, async (req: Request) => {
  const url = new URL(req.url);
  console.log(`${req.method} ${url.pathname}`);

  try {
    // Route handlers
    if (url.pathname === "/checkout") {
      return await checkoutHandler(req);
    }

    if (url.pathname === "/customer-portal") {
      return await customerPortalHandler(req);
    }

    if (url.pathname === "/api/webhook/dodo-payments") {
      return await webhookHandler(req);
    }

    // Basic routes
    if (url.pathname === "/") {
      return new Response(
        `
        <html>
          <head><title>Dodo Payments Deno Example</title></head>
          <body>
            <h1>Dodo Payments Deno Example</h1>
            <p>Available routes:</p>
            <ul>
              <li><a href="/checkout?productId=pdt_example">Checkout</a></li>
              <li><a href="/customer-portal">Customer Portal</a></li>
              <li>POST /api/webhook/dodo-payments (Webhook endpoint)</li>
            </ul>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

console.log("Server running on http://localhost:8000");

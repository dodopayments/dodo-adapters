/**
 * Fresh framework example for checkout route
 * File: routes/checkout.ts
 */

import { Handlers } from "$fresh/server.ts";
import { Checkout } from "@dodo/deno";

const checkoutHandler = Checkout({
  bearerToken: Deno.env.get("DODO_PAYMENTS_API_KEY")!,
  successUrl: Deno.env.get("SUCCESS_URL"),
  environment: "test_mode",
});

export const handler: Handlers = {
  GET: checkoutHandler,
};
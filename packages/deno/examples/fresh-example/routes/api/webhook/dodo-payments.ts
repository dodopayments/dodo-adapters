/**
 * Fresh framework example for webhook route
 * File: routes/api/webhook/dodo-payments.ts
 */

import { Handlers } from "$fresh/server.ts";
import { Webhooks } from "@dodo/deno";
import { WebhookPayload } from "@dodo/core";

const webhookHandler = Webhooks({
  webhookKey: Deno.env.get("DODO_WEBHOOK_SECRET")!,
  onPayload: async (payload: WebhookPayload) => {
    console.log("Received webhook:", payload.type);

    // Your webhook handling logic here
    // This is called for ALL webhook events
  },
  onPaymentSucceeded: async (payload: WebhookPayload) => {
    console.log("Payment succeeded:", payload.data);

    // Handle successful payment
    // e.g., update database, send confirmation email, etc.
  },
  onSubscriptionActive: async (payload: WebhookPayload) => {
    console.log("Subscription activated:", payload.data);

    // Handle subscription activation
    // e.g., grant access to premium features
  },
});

export const handler: Handlers = {
  POST: webhookHandler,
};

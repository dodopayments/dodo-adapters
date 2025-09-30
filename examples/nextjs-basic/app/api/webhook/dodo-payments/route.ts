import { Webhooks } from "@dodopayments/nextjs";

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log("Received webhook payload:", payload);
  },
  onSubscriptionPlanChanged: async (payload) => {
    try {
      console.log(
        "subscription.plan_changed:",
        JSON.stringify(
          {
            subscription_id: payload.data.subscription_id,
            new_product_id: payload.data.product_id,
            customer_id: payload.data.customer.customer_id,
            timestamp: payload.timestamp,
          },
          null,
          2,
        ),
      );
    } catch (e) {
      console.error("Error logging plan change webhook", e);
    }
  },
});

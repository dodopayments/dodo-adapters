import { Webhooks } from "@dodopayments/nextjs";

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET || "dGhpc19pc19hX3BsYWNlaG9sZGVyX3ZhbHVl", // placeholder value for build
  onPayload: async (payload) => {
    console.log("Received webhook payload:", payload);
  },
});

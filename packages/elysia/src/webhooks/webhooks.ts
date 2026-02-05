import { Elysia } from "elysia";
import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodopayments/core/webhook";
import { WebhookPayloadSchema } from "@dodopayments/core/schemas";

export const Webhooks = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig) => {
  const standardWebhook = new StandardWebhook(webhookKey);

  return new Elysia().post("/", async ({ body, headers, set }) => {
    const webhookHeaders = {
      "webhook-id": headers["webhook-id"] ?? "",
      "webhook-timestamp": headers["webhook-timestamp"] ?? "",
      "webhook-signature": headers["webhook-signature"] ?? "",
    };

    const rawBody = JSON.stringify(body);

    try {
      standardWebhook.verify(rawBody, webhookHeaders);
    } catch (err) {
      set.status = 401;
      if (err instanceof WebhookVerificationError) {
        return { error: err.message };
      }
      return { error: "Error while verifying webhook" };
    }

    const { success, data: payload, error } = WebhookPayloadSchema.safeParse(body);

    if (!success) {
      console.error("Error parsing webhook payload", error.issues);
      set.status = 400;
      return { error: `Error parsing webhook payload: ${error.message}` };
    }

    // Do not catch errors here, let them bubble up to the user
    // as they will originate from the handlers passed by the user
    await handleWebhookPayload(payload, {
      webhookKey,
      ...eventHandlers,
    });

    set.status = 200;
    return { received: true };
  });
};

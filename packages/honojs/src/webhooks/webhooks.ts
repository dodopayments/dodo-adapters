import { Context } from "hono";
import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodo/core/webhook";
import { WebhookPayloadSchema } from "@dodo/core/schemas/webhook";

export const Webhooks = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig) => {
  const standardWebhook = new StandardWebhook(webhookKey);

  const honoHandler = async (c: Context) => {
    if (c.req.method !== "POST") {
      return c.text("Method not allowed. Use POST", 405);
    }

    const rawBody = await c.req.text();
    const headers = Object.fromEntries(
      Object.entries(c.req.header()).map(([key, value]) => [
        key.toLowerCase(),
        Array.isArray(value) ? value.join(", ") : value,
      ]),
    );

    try {
      standardWebhook.verify(rawBody, headers);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return c.text(err.message, 401);
      }

      return c.text("Error while verifying webhook", 500);
    }

    const {
      success,
      data: payload,
      error,
    } = WebhookPayloadSchema.safeParse(JSON.parse(rawBody));

    if (!success) {
      console.error("Error parsing webhook payload", error.issues);
      return c.text(`Error parsing webhook payload: ${error.message}`, 400);
    }

    // do not catch errors here, let them bubble up to the user
    // as they will originate from the handlers passed by the user
    await handleWebhookPayload(payload, {
      webhookKey,
      ...eventHandlers,
    });

    return c.text("", 200);
  };

  return honoHandler;
};

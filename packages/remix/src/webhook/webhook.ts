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

  return async (request: Request) => {
    if (request.method !== "POST") {
      return new Response("Method not allowed. Use POST", { status: 405 });
    }

    // Remix: get headers
    const headersObj = {
      "webhook-id": request.headers.get("webhook-id") ?? "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": request.headers.get("webhook-signature") ?? "",
    };

    // Get raw body as text
    const rawBody = await request.text();

    try {
      standardWebhook.verify(rawBody, headersObj);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return new Response(err.message, { status: 401 });
      }
      return new Response("Error while verifying webhook", { status: 500 });
    }

    let payload;
    try {
      const parsed = JSON.parse(rawBody);
      const { success, data, error } = WebhookPayloadSchema.safeParse(parsed);
      if (!success) {
        return new Response(`Error parsing webhook payload: ${error.message}`, {
          status: 400,
        });
      }
      payload = data;
    } catch (e: any) {
      return new Response(`Invalid JSON: ${e.message}`, { status: 400 });
    }

    // Let errors from handlers bubble up
    await handleWebhookPayload(payload, { webhookKey, ...eventHandlers });

    return new Response(null, { status: 200 });
  };
};

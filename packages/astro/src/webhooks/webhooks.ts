import type { APIContext, APIRoute } from "astro";
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
}: WebhookHandlerConfig): APIRoute => {
  const standardWebhook = new StandardWebhook(webhookKey);

  return async ({ request }: APIContext) => {
    if (request.method !== "POST") {
      return new Response("Method not allowed. Use POST", { status: 405 });
    }

    const headers = {
      "webhook-id": request.headers.get("webhook-id") ?? "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": request.headers.get("webhook-signature") ?? "",
    };

    const rawBody = await request.text();

    try {
      standardWebhook.verify(rawBody, headers);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return new Response(err.message, { status: 401 });
      }

      return new Response("Error while verifying webhook", {
        status: 500,
      });
    }

    const {
      success,
      data: payload,
      error,
    } = WebhookPayloadSchema.safeParse(JSON.parse(rawBody));

    if (!success) {
      console.error("Error parsing webhook payload", error.issues);
      return new Response(
        `Error parsing webhook payload: ${error.message}`,
        {
          status: 400,
        },
      );
    }

    await handleWebhookPayload(payload, {
      webhookKey,
      ...eventHandlers,
    });

    return new Response(null, { status: 200 });
  };
};

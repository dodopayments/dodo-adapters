import type { APIRoute } from "astro";
import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodo/core/webhook";
import { WebhookPayloadSchema } from "@dodo/core/schemas/webhook";

export const Webhook = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig): APIRoute => {
  const standardWebhook = new StandardWebhook(webhookKey);

  return async ({ request }) => {
    if (request.method !== "POST") {
      return new Response("Method not allowed. Use POST", { status: 405 });
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
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
      return new Response(`Error parsing webhook payload: ${error.message}`, {
        status: 400,
      });
    }

    // do not catch errors here, let them bubble up to the user
    // as they will originate from the handlers passed by the user
    await handleWebhookPayload(payload, {
      webhookKey,
      ...eventHandlers,
    });

    return new Response(null, { status: 200 });
  };
};

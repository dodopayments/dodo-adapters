import { WebhookHandlerConfig, handleWebhookPayload } from "@dodo/core/webhook";
import { WebhookPayloadSchema } from "@dodo/core/schemas/webhook";
import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "npm:standardwebhooks";

export const Webhooks = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig) => {
  const standardWebhook = new StandardWebhook(webhookKey);

  return async (req: Request): Promise<Response> => {
    if (req.method !== "POST") {
      return new Response("Method not allowed. Use POST", { status: 405 });
    }

    const rawBody = await req.text();

    // Convert Request headers to plain object for standardwebhooks
    const headerObject: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headerObject[key] = value;
    });

    try {
      standardWebhook.verify(rawBody, headerObject);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return new Response(err.message, { status: 401 });
      }

      return new Response("Error while verifying webhook", { status: 500 });
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

    try {
      // Handle the webhook payload using the shared core function
      await handleWebhookPayload(payload, {
        webhookKey,
        ...eventHandlers,
      });
    } catch (error) {
      console.error("Error handling webhook payload:", error);
      return new Response("Error handling webhook payload", { status: 500 });
    }

    return new Response(null, { status: 200 });
  };
};

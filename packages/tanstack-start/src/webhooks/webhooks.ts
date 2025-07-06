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

  return async (req: Request) => {
    if (req.method !== "POST") {
      return new Response("Method not allowed. Use POST", { status: 405 });
    }

    const headerObject: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headerObject[key] = value;
    });

    const rawBody = await req.text();

    try {
      standardWebhook.verify(rawBody, headerObject);
    } catch (err: unknown) {
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

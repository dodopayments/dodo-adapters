import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodo/core/webhook";
import { H3Event, readBody, getHeaders, createError } from "h3";
import { WebhookPayloadSchema } from "@dodo/core/schemas/webhook";

export const Webhooks = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig) => {
  const standardWebhook = new StandardWebhook(webhookKey);

  return async (event: H3Event) => {
    if (event.node.req.method !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method not allowed. Use POST",
      });
    }

    const headers = getHeaders(event);
    const rawBody = await readBody(event);

    // Convert body to string if it's not already
    const bodyString =
      typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);

    // Convert headers to proper format for webhook verification
    const headerObject = Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key, value || ""]),
    );

    try {
      standardWebhook.verify(bodyString, headerObject);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        throw createError({
          statusCode: 401,
          statusMessage: err.message,
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: "Error while verifying webhook",
      });
    }

    const {
      success,
      data: payload,
      error,
    } = WebhookPayloadSchema.safeParse(JSON.parse(bodyString));

    if (!success) {
      console.error("Error parsing webhook payload", error.issues);
      throw createError({
        statusCode: 400,
        statusMessage: `Error parsing webhook payload: ${error.message}`,
      });
    }

    // do not catch errors here, let them bubble up to the user
    // as they will originate from the handlers passed by the user
    await handleWebhookPayload(payload, {
      webhookKey,
      ...eventHandlers,
    });

    return null;
  };
};

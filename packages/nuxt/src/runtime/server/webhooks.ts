import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodopayments/core/webhook";
import { readRawBody, H3Event, createError, send, setResponseStatus } from "h3";
import { WebhookPayloadSchema } from "@dodopayments/core/schemas";

export function Webhooks(config: WebhookHandlerConfig) {
  const standardWebhook = new StandardWebhook(config.webhookKey);

  return async (event: H3Event) => {
    if (event.method !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed: Only POST is supported",
      });
    }

    // Normalize headers
    const headers = Object.fromEntries(
      Object.entries(event.node.req.headers).map(([key, val]) => [
        key,
        Array.isArray(val) ? val.join(",") : (val ?? ""),
      ]),
    );

    // Read raw body
    const rawBody = await readRawBody(event);
    const rawString = rawBody?.toString() || "";

    // Verify webhook signature
    try {
      standardWebhook.verify(rawString, headers);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        throw createError({ statusCode: 401, statusMessage: err.message });
      }
      throw createError({
        statusCode: 500,
        statusMessage: "Unexpected error while verifying webhook",
      });
    }

    // Parse and validate payload
    let payload: unknown;
    try {
      payload = JSON.parse(rawString);
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid JSON payload",
      });
    }

    const { success, data, error } = WebhookPayloadSchema.safeParse(payload);
    if (!success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Error parsing webhook payload",
        data: error.format(),
      });
    }

    // Handle webhook logic
    await handleWebhookPayload(data, config);

    setResponseStatus(event, 200);
    return send(event, "");
  };
}

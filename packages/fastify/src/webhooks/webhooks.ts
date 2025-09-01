import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodopayments/core/webhook";
import { FastifyRequest, FastifyReply } from "fastify";
import { WebhookPayloadSchema } from "@dodopayments/core/schemas";

export const Webhooks = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig) => {
  const standardWebhook = new StandardWebhook(webhookKey);

  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (req.method !== "POST") {
      return reply.status(405).send("Method not allowed. Use POST");
    }

    const headers = {
      "webhook-id": Array.isArray(req.headers["webhook-id"])
        ? (req.headers["webhook-id"][0] ?? "")
        : (req.headers["webhook-id"] ?? ""),
      "webhook-timestamp": Array.isArray(req.headers["webhook-timestamp"])
        ? (req.headers["webhook-timestamp"][0] ?? "")
        : (req.headers["webhook-timestamp"] ?? ""),
      "webhook-signature": Array.isArray(req.headers["webhook-signature"])
        ? (req.headers["webhook-signature"][0] ?? "")
        : (req.headers["webhook-signature"] ?? ""),
    };

    const rawBody = req.body as string;

    try {
      standardWebhook.verify(rawBody, headers);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return reply.status(401).send(err.message);
      }

      return reply.status(500).send("Error while verifying webhook");
    }

    const {
      success,
      data: payload,
      error,
    } = WebhookPayloadSchema.safeParse(JSON.parse(rawBody));

    if (!success) {
      console.error("Error parsing webhook payload", error.issues);
      return reply
        .status(400)
        .send(`Error parsing webhook payload: ${error.message}`);
    }

    // do not catch errors here, let them bubble up to the user
    // as they will originate from the handlers passed by the user
    await handleWebhookPayload(payload, {
      webhookKey,
      ...eventHandlers,
    });

    return reply.status(200).send();
  };
};

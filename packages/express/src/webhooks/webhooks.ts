import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodopayments/core/webhook";
import { WebhookPayloadSchema } from "@dodopayments/core/schemas";
import type { Request, Response } from "express";

export const Webhooks = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig) => {
  const standardWebhook = new StandardWebhook(webhookKey);

  return async (req: Request, res: Response) => {
    if (req.method !== "POST") {
      return res.status(405).send("Method not allowed. Use POST");
    }

    const headers = {
      "webhook-id": req.get("webhook-id") ?? "",
      "webhook-timestamp": req.get("webhook-timestamp") ?? "",
      "webhook-signature": req.get("webhook-signature") ?? "",
    };

    // Note: express.json({ verify }) middleware is required for this to work
    // req.rawBody is expected to be a Buffer (raw body)
    const raw = (req as any).rawBody;
    if (!raw) {
      return res.status(500).send("Raw body not available. Ensure express.json() is configured with a verify function that sets req.rawBody.");
    }

    try {
      standardWebhook.verify(raw, headers);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return res.status(401).send(err.message);
      }

      console.error("Error while verifying webhook", err);
      return res.status(500).send("Error while verifying webhook");
    }

    // req.body is already parsed JSON
    const parsedBody = req.body;

    const {
      success,
      data: payload,
      error,
    } = WebhookPayloadSchema.safeParse(parsedBody);

    if (!success) {
      console.error("Error parsing webhook payload", error.issues);
      return res
        .status(400)
        .send(`Error parsing webhook payload: ${error.message}`);
    }

    await handleWebhookPayload(payload, {
      webhookKey,
      ...eventHandlers,
    });

    return res.status(200).send(null);
  };
};

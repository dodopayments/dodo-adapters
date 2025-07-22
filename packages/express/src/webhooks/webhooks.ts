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

    const requestBody = JSON.stringify(req.body);

    try {
      standardWebhook.verify(requestBody, headers);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return res.status(401).send(err.message);
      }

      console.error("Error while verifying webhook", err);
      return res.status(500).send("Error while verifying webhook");
    }

    const {
      success,
      data: payload,
      error,
    } = WebhookPayloadSchema.safeParse(req.body);

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

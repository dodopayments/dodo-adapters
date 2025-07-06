import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodo/core/webhook";
import { Request, Response } from "express";
import { WebhookPayloadSchema } from "@dodo/core/schemas/webhook";

export const Webhooks = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig) => {
  const standardWebhook = new StandardWebhook(webhookKey);

  return async (req: Request, res: Response) => {
    if (req.method !== "POST") {
      return res.status(405).send("Method not allowed. Use POST");
    }

    const headerObject = req.headers as Record<string, string>;
    const rawBody =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    try {
      standardWebhook.verify(rawBody, headerObject);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return res.status(401).send(err.message);
      }

      return res.status(500).send("Error while verifying webhook");
    }

    const {
      success,
      data: payload,
      error,
    } = WebhookPayloadSchema.safeParse(JSON.parse(rawBody));

    if (!success) {
      console.error("Error parsing webhook payload", error.issues);
      return res
        .status(400)
        .send(`Error parsing webhook payload: ${error.message}`);
    }

    // do not catch errors here, let them bubble up to the user
    // as they will originate from the handlers passed by the user
    await handleWebhookPayload(payload, {
      webhookKey,
      ...eventHandlers,
    });

    res.status(200).send();
  };
};

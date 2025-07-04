import { Webhook } from "standardwebhooks";
import {
    type WebhooksConfig,
    handleWebhookPayload,
  } from "@dodo/core"
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const Webhooks = ({
  webhookKey,
  ...eventHandlers
}: WebhooksConfig) => {
  const webhook = new Webhook(webhookKey);

  return async (request: NextRequest) => {
    const requestBody = await request.text();

    const webhookHeaders = {
      "webhook-id": request.headers.get("webhook-id") ?? "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": request.headers.get("webhook-signature") ?? "",
    };

    try {
      await webhook.verify(requestBody, webhookHeaders);
    } catch (error) {
      return NextResponse.json({ status: 403 });
    }

    let webhookPayload;
    try {
      webhookPayload = JSON.parse(requestBody);
    } catch (error) {
      return NextResponse.json({ status: 400 });
    }

    try {
      await handleWebhookPayload(webhookPayload, {
        webhookKey,
        ...eventHandlers,
      });
    } catch (error) {
      return NextResponse.json({ status: 400 });
    }

    return NextResponse.json({ status: 200 });
  };
};

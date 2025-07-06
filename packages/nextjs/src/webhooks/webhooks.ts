import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodo/core/webhook";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { WebhookPayloadSchema } from "@dodo/core/schemas/webhook";

export const Webhooks = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig) => {
  const standardWebhook = new StandardWebhook(webhookKey);

  return async (req: NextRequest) => {
    if (req.method !== "POST") {
      return new NextResponse("Method not allowed. Use POST", { status: 405 });
    }

    const headerList = await headers();
    const headerObject = Object.fromEntries(headerList.entries());

    const rawBody = await req.text();

    try {
      standardWebhook.verify(rawBody, headerObject);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        return new NextResponse(err.message, { status: 401 });
      }

      return new NextResponse("Error while verifying webhook", {
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
      return new NextResponse(
        `Error parsing webhook payload: ${error.message}`,
        {
          status: 400,
        },
      );
    }

    // do not catch errors here, let them bubble up to the user
    // as they will originate from the handlers passed by the user
    await handleWebhookPayload(payload, {
      webhookKey,
      ...eventHandlers,
    });

    return new NextResponse(null, { status: 200 });
  };
};

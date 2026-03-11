import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodopayments/core/webhook";
import { WebhookPayloadSchema } from "@dodopayments/core/schemas";
import type { Context, Next } from "koa";

// Middleware to capture raw body before parsing
export const rawBodyMiddleware = () => {
  return async (ctx: Context, next: Next) => {
    if (ctx.method === "POST" && ctx.is("application/json")) {
      const chunks: Buffer[] = [];
      
      await new Promise<void>((resolve, reject) => {
        ctx.req.on("data", (chunk: Buffer) => chunks.push(chunk));
        ctx.req.on("end", () => {
          const rawBody = Buffer.concat(chunks).toString("utf8");
          (ctx.request as any).rawBody = rawBody;
          
          // Also parse and set body for downstream middleware
          try {
            (ctx.request as any).body = JSON.parse(rawBody);
          } catch {
            // Leave body undefined if JSON parsing fails
          }
          
          resolve();
        });
        ctx.req.on("error", reject);
      });
    }
    
    await next();
  };
};

export const Webhooks = ({
  webhookKey,
  ...eventHandlers
}: WebhookHandlerConfig) => {
  const standardWebhook = new StandardWebhook(webhookKey);

  return async (ctx: Context) => {
    if (ctx.method !== "POST") {
      ctx.status = 405;
      ctx.body = { error: "Method not allowed. Use POST" };
      return;
    }

    const headers = {
      "webhook-id": ctx.get("webhook-id") || "",
      "webhook-timestamp": ctx.get("webhook-timestamp") || "",
      "webhook-signature": ctx.get("webhook-signature") || "",
    };

    // Get raw body for signature verification
    const rawBody = (ctx.request as any).rawBody;

    if (!rawBody) {
      ctx.status = 400;
      ctx.body = { error: "Raw body required for webhook signature verification" };
      return;
    }

    try {
      standardWebhook.verify(rawBody, headers);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        ctx.status = 401;
        ctx.body = { error: err.message };
        return;
      }

      ctx.status = 500;
      ctx.body = { error: "Error while verifying webhook" };
      return;
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      ctx.status = 400;
      ctx.body = { error: "Invalid JSON payload" };
      return;
    }

    const {
      success,
      data: payload,
      error,
    } = WebhookPayloadSchema.safeParse(parsedBody);

    if (!success) {
      console.error("Error parsing webhook payload", error.issues);
      ctx.status = 400;
      ctx.body = { error: `Error parsing webhook payload: ${error.message}` };
      return;
    }

    // Do not catch errors here, let them bubble up to the user
    // as they will originate from the handlers passed by the user
    await handleWebhookPayload(payload, {
      webhookKey,
      ...eventHandlers,
    });

    ctx.status = 200;
    ctx.body = null;
  };
};

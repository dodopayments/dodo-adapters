import type { DodoPayments } from "dodopayments";
import {
  handleWebhookPayload,
  WebhookHandlerConfig,
} from "@dodopayments/core/webhook";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { WebhookPayload } from "@dodopayments/core/schemas";
import { verifyWebhookPayload } from "@dodopayments/core/webhook";

export const webhooks =
  (options: WebhookHandlerConfig) => (_dodopayments: DodoPayments) => {
    return {
      dodopaymentsWebhooks: createAuthEndpoint(
        "/webhooks/dodopayments",
        {
          method: "POST",
          metadata: {
            isAction: false,
          },
          cloneRequest: true,
        },
        async (ctx) => {
          const { webhookKey } = options;

          if (!ctx.request?.body) {
            throw new APIError("INTERNAL_SERVER_ERROR");
          }
          const buf = await ctx.request.text();
          let event: WebhookPayload;
          try {
            if (!webhookKey) {
              throw new APIError("INTERNAL_SERVER_ERROR", {
                message: "DodoPayments webhook webhookKey not found",
              });
            }

            const headers = {
              "webhook-id": ctx.request.headers.get("webhook-id") as string,
              "webhook-timestamp": ctx.request.headers.get(
                "webhook-timestamp",
              ) as string,
              "webhook-signature": ctx.request.headers.get(
                "webhook-signature",
              ) as string,
            };

            event = await verifyWebhookPayload({
              webhookKey,
              headers,
              body: buf,
            });
          } catch (err: unknown) {
            if (err instanceof Error) {
              ctx.context.logger.error(`Webhook Error: ${err.message}`);
              throw new APIError("BAD_REQUEST", {
                message: `Webhook Error: ${err.message}`,
              });
            }

            throw new APIError("BAD_REQUEST", {
              message: `Webhook Error: ${err}`,
            });
          }

          try {
            await handleWebhookPayload(event, options);
          } catch (e: unknown) {
            if (e instanceof Error) {
              ctx.context.logger.error(
                `DodoPayments webhook failed. Error: ${e.message}`,
              );
            }

            ctx.context.logger.error(
              `DodoPayments webhook failed. Error: ${e}`,
            );

            throw new APIError("BAD_REQUEST", {
              message: "Webhook error: See server logs for more information.",
            });
          }

          return ctx.json({ received: true });
        },
      ),
    };
  };

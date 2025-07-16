import { APIError, createAuthEndpoint } from "better-auth/api";
import {
  handleWebhookPayload,
  type WebhookHandlerConfig,
} from "@dodopayments/core/webhook";
import type { WebhookPayload } from "@dodopayments/core/schemas";
import type DodoPayments from "dodopayments";

export type WebhooksOptions = Omit<WebhookHandlerConfig, "webhookKey"> & {
  /**
   * Webhook Secret
   */
  secret?: string;
};

export const webhooks =
  (options: WebhooksOptions) => (_dodopayments: DodoPayments) => {
    return {
      dodopayments: createAuthEndpoint(
        "/dodopayments/webhooks",
        {
          method: "POST",
          metadata: {
            isAction: false,
          },
          cloneRequest: true,
        },
        async (ctx) => {
          const { secret, ...eventHandlers } = options;

          if (!ctx.request?.body) {
            throw new APIError("INTERNAL_SERVER_ERROR");
          }

          const rawBody = await ctx.request.text();
          
          // Get headers from the request
          const headers: Record<string, string> = {};
          if (ctx.request.headers) {
            for (const [key, value] of (ctx.request.headers as any).entries()) {
              headers[key] = value;
            }
          }

          // Verify webhook signature using StandardWebhook (same as Next.js adapter)
          if (secret) {
            try {
              const { Webhook: StandardWebhook, WebhookVerificationError } = await import("standardwebhooks");
              const standardWebhook = new StandardWebhook(secret);
              standardWebhook.verify(rawBody, headers);
            } catch (err: unknown) {
              if (err instanceof Error && err.constructor.name === "WebhookVerificationError") {
                ctx.context.logger.error(`Webhook verification failed: ${err.message}`);
                throw new APIError("UNAUTHORIZED", {
                  message: err.message,
                });
              }
              ctx.context.logger.error("Error while verifying webhook");
              throw new APIError("INTERNAL_SERVER_ERROR", {
                message: "Error while verifying webhook",
              });
            }
          }

          let event: WebhookPayload;
          try {
            event = JSON.parse(rawBody) as WebhookPayload;
          } catch (err: unknown) {
            if (err instanceof Error) {
              ctx.context.logger.error(`Webhook payload parsing failed: ${err.message}`);
              throw new APIError("BAD_REQUEST", {
                message: `Webhook Error: ${err.message}`,
              });
            }
            throw new APIError("BAD_REQUEST", {
              message: `Webhook Error: ${err}`,
            });
          }

          try {
            // Use the core package webhook handler (same as Next.js adapter)
            await handleWebhookPayload(event, {
              webhookKey: secret || "",
              ...eventHandlers,
            });
          } catch (e: unknown) {
            if (e instanceof Error) {
              ctx.context.logger.error(
                `Dodo Payments webhook failed. Error: ${e.message}`,
              );
            } else {
              ctx.context.logger.error(
                `Dodo Payments webhook failed. Error: ${e}`,
              );
            }

            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Webhook error: See server logs for more information.",
            });
          }

          return ctx.json({ received: true });
        },
      ),
    };
  };;

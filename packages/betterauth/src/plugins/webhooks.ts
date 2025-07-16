import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "standardwebhooks";
import {
  type WebhookHandlerConfig,
  handleWebhookPayload,
} from "@dodopayments/core/webhook";
import { WebhookPayloadSchema } from "@dodopayments/core/schemas";
import type {
  WebhooksPluginConfig,
  WebhooksPlugin,
  WebhookContext,
} from "../types";

/**
 * Creates a webhooks plugin for Dodo Payments webhook handling
 */
export function webhooks(config: WebhooksPluginConfig = {}): WebhooksPlugin {
  return {
    id: "webhooks",
    config,
    endpoints: {
      "/webhooks/dodo": {
        method: "POST",
        handler: async (context: WebhookContext) => {
          const { request, webhookSecret } = context;

          if (!webhookSecret) {
            return new Response(
              JSON.stringify({ error: "Webhook secret not configured" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          if (request.method !== "POST") {
            return new Response("Method not allowed. Use POST", {
              status: 405,
            });
          }

          // Get headers
          const headerObject: Record<string, string> = {};
          request.headers.forEach((value, key) => {
            headerObject[key] = value;
          });

          // Get raw body
          const rawBody = await request.text();

          // Verify webhook signature
          const standardWebhook = new StandardWebhook(webhookSecret);
          try {
            standardWebhook.verify(rawBody, headerObject);
          } catch (err) {
            if (err instanceof WebhookVerificationError) {
              return new Response(err.message, { status: 401 });
            }

            return new Response("Error while verifying webhook", {
              status: 500,
            });
          }

          // Parse and validate payload
          const {
            success,
            data: payload,
            error,
          } = WebhookPayloadSchema.safeParse(JSON.parse(rawBody));

          if (!success) {
            console.error("Error parsing webhook payload", error.issues);
            return new Response(
              `Error parsing webhook payload: ${error.message}`,
              {
                status: 400,
              },
            );
          }

          try {
            // Handle webhook payload using core functionality
            await handleWebhookPayload(payload, {
              webhookKey: webhookSecret,
              ...config,
            });

            return new Response(null, { status: 200 });
          } catch (error) {
            console.error("Error handling webhook payload:", error);
            return new Response(
              JSON.stringify({ error: "Error handling webhook payload" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        },
      },
    },
  };
}

/**
 * Utility function to create webhook handler config
 */
export function createWebhookHandlerConfig(
  webhookSecret: string,
  eventHandlers: Partial<WebhooksPluginConfig> = {},
): WebhookHandlerConfig {
  return {
    webhookKey: webhookSecret,
    ...eventHandlers,
  };
}

// Export webhooks as default
export { webhooks as default };

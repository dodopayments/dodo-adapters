export { DodoPayments, type DodoPaymentsClientConfig } from "./client";
export { default as component } from "./component/convex.config";

// Re-export core types that users need
export type {
  CheckoutHandlerConfig,
  CheckoutSessionPayload,
  CheckoutSessionResponse,
  CheckoutSessionProductCartItem,
  CheckoutSessionCustomer,
  CheckoutSessionBillingAddress,
  PaymentMethodType,
} from "@dodopayments/core/checkout";

export type {
  WebhookEventHandlers,
  Payment,
  Subscription,
  Refund,
  Dispute,
  LicenseKey,
  WebhookPayload,
} from "@dodopayments/core/schemas";

export type {
  WebhookHandlerConfig,
} from "@dodopayments/core/webhook";

// Convex-specific response types
export type CheckoutResponse = { checkout_url: string };
export type CustomerPortalResponse = { portal_url: string };
import { httpAction } from "./component/_generated/server";
import type { GenericActionCtx, GenericDataModel } from "convex/server";
import { 
  verifyWebhookPayload, 
  handleWebhookPayload,
  type WebhookHandlerConfig
} from "@dodopayments/core/webhook";

// Convex-specific webhook handler types that include ctx as the first parameter
export type ConvexWebhookHandlerConfig = Omit<WebhookHandlerConfig<GenericActionCtx<GenericDataModel>>, 'webhookKey'>;

/**
 * Creates a Convex HTTP action to securely handle Dodo Payments webhooks.
 * 
 * All webhook handlers receive the Convex ActionCtx as the first parameter,
 * allowing you to use ctx.runQuery() and ctx.runMutation() to interact with your database.
 *
 * @param handlers - An object containing your webhook event handlers (e.g., onPaymentSucceeded).
 * @returns A Convex HTTP action.
 * 
 * @example
 * ```typescript
 * createDodoWebhookHandler({
 *   onPaymentSucceeded: async (ctx, payload) => {
 *     await ctx.runMutation(internal.orders.markAsPaid, {
 *       orderId: payload.data.metadata.orderId,
 *       paymentId: payload.data.payment_id,
 *     });
 *   },
 * })
 * ```
 */
export const createDodoWebhookHandler = (handlers: ConvexWebhookHandlerConfig) => {
  return httpAction(async (ctx, request) => {
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("DODO_PAYMENTS_WEBHOOK_SECRET environment variable is not set.");
    }

    const body = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    try {
      const payload = await verifyWebhookPayload({
        webhookKey: webhookSecret,
        headers,
        body,
      });

      // Use the core library's handleWebhookPayload with ctx as the third parameter
      await handleWebhookPayload(
        payload,
        {
          webhookKey: webhookSecret,
          ...handlers,
        },
        ctx, // Pass Convex ActionCtx as the context parameter
      );

      return new Response(null, { status: 200 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Dodo Payments Webhook Error:", errorMessage);
      return new Response("Error while processing webhook", { status: 400 });
    }
  });
};

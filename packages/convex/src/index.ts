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
import { handleWebhookPayload, verifyWebhookPayload } from "@dodopayments/core/webhook";
import type { WebhookHandlerConfig } from "@dodopayments/core/webhook";

/**
 * Creates a Convex HTTP action to securely handle Dodo Payments webhooks.
 *
 * @param handlers - An object containing your webhook event handlers (e.g., onPaymentSucceeded).
 * @returns A Convex HTTP action.
 */
export const createDodoWebhookHandler = (handlers: Omit<WebhookHandlerConfig, 'webhookKey'>) => {
  // Validate webhook secret at initialization time
  const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("DODO_PAYMENTS_WEBHOOK_SECRET environment variable is not set.");
  }

  return httpAction(async (_, request) => {
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

      await handleWebhookPayload(payload, {
        webhookKey: webhookSecret,
        ...handlers,
      });

      return new Response(null, { status: 200 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Dodo Payments Webhook Error:", errorMessage);
      // Don't expose internal error details to clients
      return new Response("Invalid webhook payload", { status: 400 });
    }
  });
};
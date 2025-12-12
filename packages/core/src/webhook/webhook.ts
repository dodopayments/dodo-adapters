import {
  WebhookEventHandlers,
  WebhookPayload,
  Resolve,
  WebhookPayloadSchema,
  HandlerWithContext,
} from "../schemas/webhook";
import {
  Webhook as StandardWebhook,
  WebhookVerificationError,
} from "./vendor/standardwebhook";

export type WebhookHandlerConfig<TContext = void> = Resolve<
  {
    webhookKey: string;
    onPayload?: HandlerWithContext<TContext, WebhookPayload>;
  } & WebhookEventHandlers<TContext>
>;

// Overload signatures
export function handleWebhookPayload(
  payload: WebhookPayload,
  config: WebhookHandlerConfig<void>,
): Promise<void>;
export function handleWebhookPayload<TContext>(
  payload: WebhookPayload,
  config: WebhookHandlerConfig<TContext>,
  context: TContext,
): Promise<void>;

// Implementation
export async function handleWebhookPayload<TContext = void>(
  payload: WebhookPayload,
  config: WebhookHandlerConfig<TContext>,
  context?: TContext,
) {
  // Helper function to call handlers with or without context
  const callHandler = <TPayload>(
    handler: ((...args: any[]) => Promise<void>) | undefined,
    payload: TPayload,
  ) => {
    if (!handler) return;
    if (context !== undefined) {
      return handler(context, payload);
    }
    return handler(payload);
  };

  if (config.onPayload) {
    await callHandler(config.onPayload, payload);
  }

  if (payload.type === "payment.succeeded") {
    await callHandler(config.onPaymentSucceeded, payload);
  }

  if (payload.type === "payment.failed") {
    await callHandler(config.onPaymentFailed, payload);
  }

  if (payload.type === "payment.processing") {
    await callHandler(config.onPaymentProcessing, payload);
  }

  if (payload.type === "payment.cancelled") {
    await callHandler(config.onPaymentCancelled, payload);
  }

  if (payload.type === "refund.succeeded") {
    await callHandler(config.onRefundSucceeded, payload);
  }

  if (payload.type === "refund.failed") {
    await callHandler(config.onRefundFailed, payload);
  }

  if (payload.type === "dispute.opened") {
    await callHandler(config.onDisputeOpened, payload);
  }

  if (payload.type === "dispute.expired") {
    await callHandler(config.onDisputeExpired, payload);
  }

  if (payload.type === "dispute.accepted") {
    await callHandler(config.onDisputeAccepted, payload);
  }

  if (payload.type === "dispute.cancelled") {
    await callHandler(config.onDisputeCancelled, payload);
  }

  if (payload.type === "dispute.challenged") {
    await callHandler(config.onDisputeChallenged, payload);
  }

  if (payload.type === "dispute.won") {
    await callHandler(config.onDisputeWon, payload);
  }

  if (payload.type === "dispute.lost") {
    await callHandler(config.onDisputeLost, payload);
  }

  if (payload.type === "subscription.active") {
    await callHandler(config.onSubscriptionActive, payload);
  }

  if (payload.type === "subscription.on_hold") {
    await callHandler(config.onSubscriptionOnHold, payload);
  }

  if (payload.type === "subscription.renewed") {
    await callHandler(config.onSubscriptionRenewed, payload);
  }

  if (payload.type === "subscription.paused") {
    await callHandler(config.onSubscriptionPaused, payload);
  }

  if (payload.type === "subscription.plan_changed") {
    await callHandler(config.onSubscriptionPlanChanged, payload);
  }

  if (payload.type === "subscription.cancelled") {
    await callHandler(config.onSubscriptionCancelled, payload);
  }

  if (payload.type === "subscription.failed") {
    await callHandler(config.onSubscriptionFailed, payload);
  }

  if (payload.type === "subscription.expired") {
    await callHandler(config.onSubscriptionExpired, payload);
  }

  if (payload.type === "license_key.created") {
    await callHandler(config.onLicenseKeyCreated, payload);
  }
}

export const verifyWebhookPayload = async ({
  webhookKey,
  headers,
  body,
}: {
  webhookKey: string;
  headers: Record<string, string>;
  body: string;
}): Promise<WebhookPayload> => {
  const standardWebhook = new StandardWebhook(webhookKey);

  try {
    standardWebhook.verify(body, headers);
  } catch (e) {
    if (e instanceof WebhookVerificationError) {
      throw new Error(e.message);
    }

    throw e;
  }

  const {
    success,
    data: payload,
    error,
  } = WebhookPayloadSchema.safeParse(JSON.parse(body));

  if (!success) {
    throw new Error(error.message);
  }

  return payload;
};

import {
  WebhookEventHandlers,
  WebhookPayload,
  Resolve,
} from "../schemas/webhook";

export type WebhookHandlerConfig = Resolve<
  {
    webhookKey: string;
    onPayload?: (payload: WebhookPayload) => Promise<void>;
  } & WebhookEventHandlers
>;

export const handleWebhookPayload = async (
  payload: WebhookPayload,
  config: WebhookHandlerConfig,
) => {
  if (config.onPayload) {
    await config.onPayload(payload);
  }

  if (payload.type === "payment.succeeded" && config.onPaymentSucceeded) {
    await config.onPaymentSucceeded(payload);
  }

  if (payload.type === "payment.failed" && config.onPaymentFailed) {
    await config.onPaymentFailed(payload);
  }

  if (payload.type === "payment.processing" && config.onPaymentProcessing) {
    await config.onPaymentProcessing(payload);
  }

  if (payload.type === "payment.cancelled" && config.onPaymentCancelled) {
    await config.onPaymentCancelled(payload);
  }

  if (payload.type === "refund.succeeded" && config.onRefundSucceeded) {
    await config.onRefundSucceeded(payload);
  }

  if (payload.type === "refund.failed" && config.onRefundFailed) {
    await config.onRefundFailed(payload);
  }

  if (payload.type === "dispute.opened" && config.onDisputeOpened) {
    await config.onDisputeOpened(payload);
  }

  if (payload.type === "dispute.expired" && config.onDisputeExpired) {
    await config.onDisputeExpired(payload);
  }

  if (payload.type === "dispute.accepted" && config.onDisputeAccepted) {
    await config.onDisputeAccepted(payload);
  }

  if (payload.type === "dispute.cancelled" && config.onDisputeCancelled) {
    await config.onDisputeCancelled(payload);
  }

  if (payload.type === "dispute.challenged" && config.onDisputeChallenged) {
    await config.onDisputeChallenged(payload);
  }

  if (payload.type === "dispute.won" && config.onDisputeWon) {
    await config.onDisputeWon(payload);
  }

  if (payload.type === "dispute.lost" && config.onDisputeLost) {
    await config.onDisputeLost(payload);
  }

  if (payload.type === "subscription.active" && config.onSubscriptionActive) {
    await config.onSubscriptionActive(payload);
  }

  if (payload.type === "subscription.on_hold" && config.onSubscriptionOnHold) {
    await config.onSubscriptionOnHold(payload);
  }

  if (payload.type === "subscription.renewed" && config.onSubscriptionRenewed) {
    await config.onSubscriptionRenewed(payload);
  }

  if (payload.type === "subscription.paused" && config.onSubscriptionPaused) {
    await config.onSubscriptionPaused(payload);
  }

  if (
    payload.type === "subscription.plan_changed" &&
    config.onSubscriptionPlanChanged
  ) {
    await config.onSubscriptionPlanChanged(payload);
  }

  if (
    payload.type === "subscription.cancelled" &&
    config.onSubscriptionCancelled
  ) {
    await config.onSubscriptionCancelled(payload);
  }

  if (payload.type === "subscription.failed" && config.onSubscriptionFailed) {
    await config.onSubscriptionFailed(payload);
  }

  if (payload.type === "subscription.expired" && config.onSubscriptionExpired) {
    await config.onSubscriptionExpired(payload);
  }

  if (payload.type === "license_key.created" && config.onLicenseKeyCreated) {
    await config.onLicenseKeyCreated(payload);
  }
};

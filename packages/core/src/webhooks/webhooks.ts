import DodoPayments from "dodopayments";

// Strongly typed data union for webhook payload
// TODO: Replace 'any' with the correct types from the dodopayments SDK if/when available
export type DodoPaymentsWebhookPayloadData =
  | DodoPayments.PaymentCreateResponse
  | DodoPayments.SubscriptionCreateResponse
  | DodoPayments.Refund
  | DodoPayments.Dispute
  | DodoPayments.LicenseKey;


// Dodo Payments Webhook Payload Structure
export interface DodoPaymentsWebhookPayload {
  business_id: string;
  type: DodoPayments.WebhookEventType
  timestamp: string; // ISO8601
  data: DodoPaymentsWebhookPayloadData;
}

// Handler config for Dodo Payments webhooks
export interface WebhooksConfig {
  webhookKey: string;
  onPayload?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onPaymentSucceeded?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onPaymentFailed?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onPaymentProcessing?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onPaymentCancelled?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onRefundSucceeded?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onRefundFailed?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onDisputeOpened?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onDisputeExpired?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onDisputeAccepted?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onDisputeCancelled?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onDisputeChallenged?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onDisputeWon?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onDisputeLost?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onSubscriptionActive?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onSubscriptionOnHold?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onSubscriptionRenewed?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onSubscriptionPaused?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onSubscriptionPlanChanged?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onSubscriptionCancelled?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onSubscriptionFailed?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onSubscriptionExpired?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
  onLicenseKeyCreated?: (payload: DodoPaymentsWebhookPayload) => Promise<void>;
}

// Main handler for Dodo Payments webhook payloads
export const handleWebhookPayload = async (
  payload: DodoPaymentsWebhookPayload,
  config: WebhooksConfig
) => {
  const promises: Promise<void>[] = [];
  
  if (config.onPayload) {
    promises.push(config.onPayload(payload));
  }

  switch (payload.type) {
    case "payment.succeeded":
      if (config.onPaymentSucceeded) promises.push(config.onPaymentSucceeded(payload));
      break;
    case "payment.failed":
      if (config.onPaymentFailed) promises.push(config.onPaymentFailed(payload));
      break;
    case "payment.processing":
      if (config.onPaymentProcessing) promises.push(config.onPaymentProcessing(payload));
      break;
    case "payment.cancelled":
      if (config.onPaymentCancelled) promises.push(config.onPaymentCancelled(payload));
      break;
    case "refund.succeeded":
      if (config.onRefundSucceeded) promises.push(config.onRefundSucceeded(payload));
      break;
    case "refund.failed":
      if (config.onRefundFailed) promises.push(config.onRefundFailed(payload));
      break;
    case "dispute.opened":
      if (config.onDisputeOpened) promises.push(config.onDisputeOpened(payload));
      break;
    case "dispute.expired":
      if (config.onDisputeExpired) promises.push(config.onDisputeExpired(payload));
      break;
    case "dispute.accepted":
      if (config.onDisputeAccepted) promises.push(config.onDisputeAccepted(payload));
      break;
    case "dispute.cancelled":
      if (config.onDisputeCancelled) promises.push(config.onDisputeCancelled(payload));
      break;
    case "dispute.challenged":
      if (config.onDisputeChallenged) promises.push(config.onDisputeChallenged(payload));
      break;
    case "dispute.won":
      if (config.onDisputeWon) promises.push(config.onDisputeWon(payload));
      break;
    case "dispute.lost":
      if (config.onDisputeLost) promises.push(config.onDisputeLost(payload));
      break;
    case "subscription.active":
      if (config.onSubscriptionActive) promises.push(config.onSubscriptionActive(payload));
      break;
    case "subscription.on_hold":
      if (config.onSubscriptionOnHold) promises.push(config.onSubscriptionOnHold(payload));
      break;
    case "subscription.renewed":
      if (config.onSubscriptionRenewed) promises.push(config.onSubscriptionRenewed(payload));
      break;
    case "subscription.paused":
      if (config.onSubscriptionPaused) promises.push(config.onSubscriptionPaused(payload));
      break;
    case "subscription.plan_changed":
      if (config.onSubscriptionPlanChanged) promises.push(config.onSubscriptionPlanChanged(payload));
      break;
    case "subscription.cancelled":
      if (config.onSubscriptionCancelled) promises.push(config.onSubscriptionCancelled(payload));
      break;
    case "subscription.failed":
      if (config.onSubscriptionFailed) promises.push(config.onSubscriptionFailed(payload));
      break;
    case "subscription.expired":
      if (config.onSubscriptionExpired) promises.push(config.onSubscriptionExpired(payload));
      break;
    case "license_key.created":
      if (config.onLicenseKeyCreated) promises.push(config.onLicenseKeyCreated(payload));
      break;
  }

  return Promise.all(promises);
};
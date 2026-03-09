export { Checkout } from "./checkout/checkout";
export { CustomerPortal } from "./customer-portal/customer-portal";
export { Webhooks } from "./webhooks/webhooks";

// Re-export types from core
export type {
  CheckoutHandlerConfig,
  CheckoutSessionPayload,
} from "@dodopayments/core/checkout";

export type {
  WebhookHandlerConfig,
  WebhookPayload,
  Payment,
  Subscription,
  Refund,
  Dispute,
  LicenseKey,
  WebhookEventHandlers,
} from "@dodopayments/core";

export type { CustomerPortalConfig } from "./customer-portal/customer-portal";

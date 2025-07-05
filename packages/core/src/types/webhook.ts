import {
  PaymentSchema,
  SubscriptionSchema,
  RefundSchema,
  DisputeSchema,
  LicenseKeySchema,
  WebhookPayloadSchema,
  PaymentSucceededPayloadSchema,
  PaymentFailedPayloadSchema,
  PaymentProcessingPayloadSchema,
  PaymentCancelledPayloadSchema,
  RefundSucceededPayloadSchema,
  RefundFailedPayloadSchema,
  DisputeOpenedPayloadSchema,
  DisputeExpiredPayloadSchema,
  DisputeAcceptedPayloadSchema,
  DisputeCancelledPayloadSchema,
  DisputeChallengedPayloadSchema,
  DisputeWonPayloadSchema,
  DisputeLostPayloadSchema,
  SubscriptionActivePayloadSchema,
  SubscriptionOnHoldPayloadSchema,
  SubscriptionRenewedPayloadSchema,
  SubscriptionPausedPayloadSchema,
  SubscriptionPlanChangedPayloadSchema,
  SubscriptionCancelledPayloadSchema,
  SubscriptionFailedPayloadSchema,
  SubscriptionExpiredPayloadSchema,
  LicenseKeyCreatedPayloadSchema,
} from "../schemas";
import { z } from "zod";

// expands the type, improves readability for type users
export type Resolve<T> = T extends Function ? T : { [K in keyof T]: T[K] };

export type Payment = z.infer<typeof PaymentSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type Refund = z.infer<typeof RefundSchema>;
export type Dispute = z.infer<typeof DisputeSchema>;
export type LicenseKey = z.infer<typeof LicenseKeySchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

export type WebhookEventHandlers = {
  onPaymentSucceeded?: (
    payload: z.infer<typeof PaymentSucceededPayloadSchema>,
  ) => Promise<void>;
  onPaymentFailed?: (
    payload: z.infer<typeof PaymentFailedPayloadSchema>,
  ) => Promise<void>;
  onPaymentProcessing?: (
    payload: z.infer<typeof PaymentProcessingPayloadSchema>,
  ) => Promise<void>;
  onPaymentCancelled?: (
    payload: z.infer<typeof PaymentCancelledPayloadSchema>,
  ) => Promise<void>;
  onRefundSucceeded?: (
    payload: z.infer<typeof RefundSucceededPayloadSchema>,
  ) => Promise<void>;
  onRefundFailed?: (
    payload: z.infer<typeof RefundFailedPayloadSchema>,
  ) => Promise<void>;
  onDisputeOpened?: (
    payload: z.infer<typeof DisputeOpenedPayloadSchema>,
  ) => Promise<void>;
  onDisputeExpired?: (
    payload: z.infer<typeof DisputeExpiredPayloadSchema>,
  ) => Promise<void>;
  onDisputeAccepted?: (
    payload: z.infer<typeof DisputeAcceptedPayloadSchema>,
  ) => Promise<void>;
  onDisputeCancelled?: (
    payload: z.infer<typeof DisputeCancelledPayloadSchema>,
  ) => Promise<void>;
  onDisputeChallenged?: (
    payload: z.infer<typeof DisputeChallengedPayloadSchema>,
  ) => Promise<void>;
  onDisputeWon?: (
    payload: z.infer<typeof DisputeWonPayloadSchema>,
  ) => Promise<void>;
  onDisputeLost?: (
    payload: z.infer<typeof DisputeLostPayloadSchema>,
  ) => Promise<void>;
  onSubscriptionActive?: (
    payload: z.infer<typeof SubscriptionActivePayloadSchema>,
  ) => Promise<void>;
  onSubscriptionOnHold?: (
    payload: z.infer<typeof SubscriptionOnHoldPayloadSchema>,
  ) => Promise<void>;
  onSubscriptionRenewed?: (
    payload: z.infer<typeof SubscriptionRenewedPayloadSchema>,
  ) => Promise<void>;
  onSubscriptionPaused?: (
    payload: z.infer<typeof SubscriptionPausedPayloadSchema>,
  ) => Promise<void>;
  onSubscriptionPlanChanged?: (
    payload: z.infer<typeof SubscriptionPlanChangedPayloadSchema>,
  ) => Promise<void>;
  onSubscriptionCancelled?: (
    payload: z.infer<typeof SubscriptionCancelledPayloadSchema>,
  ) => Promise<void>;
  onSubscriptionFailed?: (
    payload: z.infer<typeof SubscriptionFailedPayloadSchema>,
  ) => Promise<void>;
  onSubscriptionExpired?: (
    payload: z.infer<typeof SubscriptionExpiredPayloadSchema>,
  ) => Promise<void>;
  onLicenseKeyCreated?: (
    payload: z.infer<typeof LicenseKeyCreatedPayloadSchema>,
  ) => Promise<void>;
};


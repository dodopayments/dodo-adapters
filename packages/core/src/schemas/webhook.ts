import { z } from "zod/v3";

export const PaymentSchema = z.object({
  payload_type: z.literal("Payment"),
  billing: z.object({
    city: z.string().nullable(),
    country: z.string().nullable(),
    state: z.string().nullable(),
    street: z.string().nullable(),
    zipcode: z.string().nullable(),
  }),
  brand_id: z.string(),
  business_id: z.string(),
  card_issuing_country: z.string().nullable(),
  card_last_four: z.string().nullable(),
  card_network: z.string().nullable(),
  card_type: z.string().nullable(),
  created_at: z.string().transform((d) => new Date(d)),
  currency: z.string(),
  customer: z.object({
    customer_id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
  }),
  digital_products_delivered: z.boolean(),
  discount_id: z.string().nullable(),
  disputes: z
    .array(
      z.object({
        amount: z.string(),
        business_id: z.string(),
        created_at: z.string().transform((d) => new Date(d)),
        currency: z.string(),
        dispute_id: z.string(),
        dispute_stage: z.enum([
          "pre_dispute",
          "dispute_opened",
          "dispute_won",
          "dispute_lost",
        ]),
        dispute_status: z.enum([
          "dispute_opened",
          "dispute_won",
          "dispute_lost",
          "dispute_accepted",
          "dispute_cancelled",
          "dispute_challenged",
        ]),
        payment_id: z.string(),
        remarks: z.string().nullable(),
      }),
    )
    .nullable(),
  error_code: z.string().nullable(),
  error_message: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  payment_id: z.string(),
  payment_link: z.string().nullable(),
  payment_method: z.string().nullable(),
  payment_method_type: z.string().nullable(),
  product_cart: z
    .array(
      z.object({
        product_id: z.string(),
        quantity: z.number(),
      }),
    )
    .nullable(),
  refunds: z
    .array(
      z.object({
        amount: z.number(),
        business_id: z.string(),
        created_at: z.string().transform((d) => new Date(d)),
        currency: z.string(),
        is_partial: z.boolean(),
        payment_id: z.string(),
        reason: z.string().nullable(),
        refund_id: z.string(),
        status: z.enum(["succeeded", "failed", "pending"]),
      }),
    )
    .nullable(),
  settlement_amount: z.number(),
  settlement_currency: z.string(),
  settlement_tax: z.number().nullable(),
  status: z.enum(["succeeded", "failed", "pending", "processing", "cancelled"]),
  subscription_id: z.string().nullable(),
  tax: z.number().nullable(),
  total_amount: z.number(),
  updated_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable(),
});

export const SubscriptionSchema = z.object({
  payload_type: z.literal("Subscription"),
  addons: z
    .array(
      z.object({
        addon_id: z.string(),
        quantity: z.number(),
      }),
    )
    .nullable(),
  billing: z.object({
    city: z.string().nullable(),
    country: z.string().nullable(),
    state: z.string().nullable(),
    street: z.string().nullable(),
    zipcode: z.string().nullable(),
  }),
  cancel_at_next_billing_date: z.boolean(),
  cancelled_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable(),
  created_at: z.string().transform((d) => new Date(d)),
  currency: z.string(),
  customer: z.object({
    customer_id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
  }),
  discount_id: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  meters: z.array(z.object({
      currency: z.string(),
      description: z.string().nullable(),
      free_threshold: z.number(),
      measurement_unit: z.string(),
      meter_id: z.string(),
      name: z.string(),
      price_per_unit: z.string(),
    })),
  next_billing_date: z
    .string()
    .transform((d) => new Date(d))
    .nullable(),
  on_demand: z.boolean(),
  payment_frequency_count: z.number(),
  payment_frequency_interval: z.enum(["Day", "Week", "Month", "Year"]),
  previous_billing_date: z
    .string()
    .transform((d) => new Date(d))
    .nullable(),
  product_id: z.string(),
  quantity: z.number(),
  recurring_pre_tax_amount: z.number(),
  status: z.enum([
    "pending",
    "active",
    "on_hold",
    "paused",
    "cancelled",
    "expired",
    "failed",
  ]),
  subscription_id: z.string(),
  subscription_period_count: z.number(),
  subscription_period_interval: z.enum(["Day", "Week", "Month", "Year"]),
  tax_inclusive: z.boolean(),
  trial_period_days: z.number(),
});

export const RefundSchema = z.object({
  payload_type: z.literal("Refund"),
  amount: z.number(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  currency: z.string(),
  is_partial: z.boolean(),
  payment_id: z.string(),
  reason: z.string().nullable(),
  refund_id: z.string(),
  status: z.enum(["succeeded", "failed", "pending"]),
});

export const DisputeSchema = z.object({
  payload_type: z.literal("Dispute"),
  amount: z.string(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  currency: z.string(),
  dispute_id: z.string(),
  dispute_stage: z.enum([
    "pre_dispute",
    "dispute_opened",
    "dispute_won",
    "dispute_lost",
  ]),
  dispute_status: z.enum([
    "dispute_opened",
    "dispute_won",
    "dispute_lost",
    "dispute_accepted",
    "dispute_cancelled",
    "dispute_challenged",
  ]),
  payment_id: z.string(),
  remarks: z.string().nullable(),
});

export const LicenseKeySchema = z.object({
  payload_type: z.literal("LicenseKey"),
  activations_limit: z.number(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  customer_id: z.string(),
  expires_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable(),
  id: z.string(),
  instances_count: z.number(),
  key: z.string(),
  payment_id: z.string(),
  product_id: z.string(),
  status: z.enum(["active", "inactive", "expired"]),
  subscription_id: z.string().nullable(),
});

export const PaymentSucceededPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("payment.succeeded"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: PaymentSchema,
});

export const PaymentFailedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("payment.failed"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: PaymentSchema,
});

export const PaymentProcessingPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("payment.processing"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: PaymentSchema,
});

export const PaymentCancelledPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("payment.cancelled"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: PaymentSchema,
});

export const RefundSucceededPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("refund.succeeded"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: RefundSchema,
});

export const RefundFailedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("refund.failed"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: RefundSchema,
});

export const DisputeOpenedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("dispute.opened"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: DisputeSchema,
});

export const DisputeExpiredPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("dispute.expired"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: DisputeSchema,
});

export const DisputeAcceptedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("dispute.accepted"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: DisputeSchema,
});

export const DisputeCancelledPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("dispute.cancelled"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: DisputeSchema,
});

export const DisputeChallengedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("dispute.challenged"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: DisputeSchema,
});

export const DisputeWonPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("dispute.won"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: DisputeSchema,
});

export const DisputeLostPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("dispute.lost"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: DisputeSchema,
});

export const SubscriptionActivePayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.active"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

export const SubscriptionOnHoldPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.on_hold"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

export const SubscriptionRenewedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.renewed"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

export const SubscriptionPausedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.paused"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

export const SubscriptionPlanChangedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.plan_changed"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

export const SubscriptionCancelledPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.cancelled"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

export const SubscriptionFailedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.failed"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

export const SubscriptionExpiredPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.expired"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

export const SubscriptionUpdatedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.updated"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

export const LicenseKeyCreatedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("license_key.created"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: LicenseKeySchema,
});

export const WebhookPayloadSchema = z.discriminatedUnion("type", [
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
  SubscriptionUpdatedPayloadSchema,
  LicenseKeyCreatedPayloadSchema,
]);

// expands the type, improves readability for type users
export type Resolve<T> = T extends Function ? T : { [K in keyof T]: T[K] };

export type Payment = z.infer<typeof PaymentSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type Refund = z.infer<typeof RefundSchema>;
export type Dispute = z.infer<typeof DisputeSchema>;
export type LicenseKey = z.infer<typeof LicenseKeySchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

// Helper type for handlers with context
export type HandlerWithContext<TContext, TPayload> = TContext extends void
  ? (payload: TPayload) => Promise<void>
  : (context: TContext, payload: TPayload) => Promise<void>;

export type WebhookEventHandlers<TContext = void> = {
  onPaymentSucceeded?: HandlerWithContext<
    TContext,
    z.infer<typeof PaymentSucceededPayloadSchema>
  >;
  onPaymentFailed?: HandlerWithContext<
    TContext,
    z.infer<typeof PaymentFailedPayloadSchema>
  >;
  onPaymentProcessing?: HandlerWithContext<
    TContext,
    z.infer<typeof PaymentProcessingPayloadSchema>
  >;
  onPaymentCancelled?: HandlerWithContext<
    TContext,
    z.infer<typeof PaymentCancelledPayloadSchema>
  >;
  onRefundSucceeded?: HandlerWithContext<
    TContext,
    z.infer<typeof RefundSucceededPayloadSchema>
  >;
  onRefundFailed?: HandlerWithContext<
    TContext,
    z.infer<typeof RefundFailedPayloadSchema>
  >;
  onDisputeOpened?: HandlerWithContext<
    TContext,
    z.infer<typeof DisputeOpenedPayloadSchema>
  >;
  onDisputeExpired?: HandlerWithContext<
    TContext,
    z.infer<typeof DisputeExpiredPayloadSchema>
  >;
  onDisputeAccepted?: HandlerWithContext<
    TContext,
    z.infer<typeof DisputeAcceptedPayloadSchema>
  >;
  onDisputeCancelled?: HandlerWithContext<
    TContext,
    z.infer<typeof DisputeCancelledPayloadSchema>
  >;
  onDisputeChallenged?: HandlerWithContext<
    TContext,
    z.infer<typeof DisputeChallengedPayloadSchema>
  >;
  onDisputeWon?: HandlerWithContext<
    TContext,
    z.infer<typeof DisputeWonPayloadSchema>
  >;
  onDisputeLost?: HandlerWithContext<
    TContext,
    z.infer<typeof DisputeLostPayloadSchema>
  >;
  onSubscriptionActive?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionActivePayloadSchema>
  >;
  onSubscriptionOnHold?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionOnHoldPayloadSchema>
  >;
  onSubscriptionRenewed?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionRenewedPayloadSchema>
  >;
  onSubscriptionPaused?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionPausedPayloadSchema>
  >;
  onSubscriptionPlanChanged?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionPlanChangedPayloadSchema>
  >;
  onSubscriptionCancelled?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionCancelledPayloadSchema>
  >;
  onSubscriptionFailed?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionFailedPayloadSchema>
  >;
  onSubscriptionExpired?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionExpiredPayloadSchema>
  >;
  onSubscriptionUpdated?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionUpdatedPayloadSchema>
  >;
  onLicenseKeyCreated?: HandlerWithContext<
    TContext,
    z.infer<typeof LicenseKeyCreatedPayloadSchema>
  >;
};

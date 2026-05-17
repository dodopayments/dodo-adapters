import { z } from "zod/v3";

export const PaymentSchema = z.object({
  payload_type: z.literal("Payment"),
  billing: z.object({
    city: z.string().nullable(),
    country: z.string(),
    state: z.string().nullable(),
    street: z.string().nullable(),
    zipcode: z.string().nullable(),
  }),
  brand_id: z.string(),
  business_id: z.string(),
  card_holder_name: z.string().nullable(),
  card_issuing_country: z.string().nullable(),
  card_last_four: z.string().nullable(),
  card_network: z.string().nullable(),
  card_type: z.string().nullable(),
  checkout_session_id: z.string().nullable(),
  created_at: z.string().transform((d) => new Date(d)),
  currency: z.string(),
  custom_field_responses: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .nullable()
    ,
  customer: z.object({
    customer_id: z.string(),
    email: z.string(),
    metadata: z.record(z.any()),
    name: z.string(),
    phone_number: z.string().nullable(),
  }),
  digital_products_delivered: z.boolean(),
  /**
   * @deprecated Use `discount_ids` instead. Still populated for backward
   * compatibility with the singular discount_code flow.
   */
  discount_id: z.string().nullable(),
  /**
   * Flat list of all stacked discount IDs applied to the payment, in order
   * of application. Always present on v1.98.0+ webhook payloads.
   */
  discount_ids: z.array(z.string()).nullable().optional(),
  disputes: z
    .array(
      z.object({
        amount: z.string(),
        business_id: z.string(),
        created_at: z.string().transform((d) => new Date(d)),
        currency: z.string(),
        dispute_id: z.string(),
        dispute_stage: z.enum(["pre_dispute", "dispute", "pre_arbitration"]),
        dispute_status: z.enum([
          "dispute_opened",
          "dispute_expired",
          "dispute_accepted",
          "dispute_cancelled",
          "dispute_challenged",
          "dispute_won",
          "dispute_lost",
        ]),
        payment_id: z.string(),
        remarks: z.string().nullable(),
      }),
    )
    .default([]),
  error_code: z.string().nullable(),
  error_message: z.string().nullable(),
  invoice_id: z.string().nullable(),
  invoice_url: z.string().nullable(),
  metadata: z.record(z.any()),
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
    .nullable()
    ,
  refunds: z.array(
    z.object({
      amount: z.number().nullable(),
      business_id: z.string(),
      created_at: z.string().transform((d) => new Date(d)),
      currency: z.string().nullable(),
      is_partial: z.boolean(),
      payment_id: z.string(),
      reason: z.string().nullable(),
      refund_id: z.string(),
      status: z.enum(["succeeded", "failed", "pending", "review"]),
    }),
  ),
  refund_status: z.enum(["partial", "full"]).nullable(),
  settlement_amount: z.number(),
  settlement_currency: z.string(),
  settlement_tax: z.number().nullable(),
  status: z
    .enum([
      "succeeded",
      "failed",
      "cancelled",
      "processing",
      "requires_customer_action",
      "requires_merchant_action",
      "requires_payment_method",
      "requires_confirmation",
      "requires_capture",
      "partially_captured",
      "partially_captured_and_capturable",
    ])
    .nullable()
    ,
  subscription_id: z.string().nullable(),
  tax: z.number().nullable(),
  total_amount: z.number(),
  updated_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    ,
});

export const SubscriptionSchema = z.object({
  payload_type: z.literal("Subscription"),
  addons: z.array(
    z.object({
      addon_id: z.string(),
      quantity: z.number(),
    }),
  ),
  billing: z.object({
    city: z.string().nullable(),
    country: z.string(),
    state: z.string().nullable(),
    street: z.string().nullable(),
    zipcode: z.string().nullable(),
  }),
  cancel_at_next_billing_date: z.boolean(),
  cancelled_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    ,
  created_at: z.string().transform((d) => new Date(d)),
  currency: z.string(),
  customer: z.object({
    customer_id: z.string(),
    email: z.string(),
    metadata: z.record(z.any()),
    name: z.string(),
    phone_number: z.string().nullable(),
  }),
  custom_field_responses: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .nullable()
    ,
  /**
   * @deprecated Use `discounts[].discount_cycles_remaining` instead. Still
   * populated for backward compatibility with the singular discount_code
   * flow.
   */
  discount_cycles_remaining: z.number().nullable(),
  /**
   * @deprecated Use `discounts` (full objects) or `discount_ids` (flat list)
   * instead. Still populated for backward compatibility with the singular
   * discount_code flow.
   */
  discount_id: z.string().nullable(),
  /**
   * Flat list of all stacked discount IDs applied to the subscription, in
   * order of application. Always present on v1.98.0+ webhook payloads.
   */
  discount_ids: z.array(z.string()).nullable().optional(),
  /**
   * All stacked discounts applied to the subscription, in order of
   * application. Each entry contains the discount's position, remaining
   * billing cycles, code, and metadata. Always present on v1.98.0+ webhook
   * payloads.
   */
  discounts: z
    .array(
      z.object({
        discount_id: z.string(),
        code: z.string().nullable().optional(),
        position: z.number().int().nonnegative(),
        cycles_remaining: z.number().nullable().optional(),
        metadata: z.record(z.any()).nullable().optional(),
      }),
    )
    .nullable()
    .optional(),
  expires_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    ,
  credit_entitlement_cart: z.array(
    z.object({
      credit_entitlement_id: z.string(),
      credit_entitlement_name: z.string(),
      credits_amount: z.string(),
      overage_balance: z.string(),
      overage_behavior: z.enum([
        "forgive_at_reset",
        "invoice_at_billing",
        "carry_deficit",
        "carry_deficit_auto_repay",
      ]),
      overage_enabled: z.boolean(),
      product_id: z.string(),
      remaining_balance: z.string(),
      rollover_enabled: z.boolean(),
      unit: z.string(),
      expires_after_days: z.number().nullable(),
      low_balance_threshold_percent: z.number().nullable(),
      max_rollover_count: z.number().nullable(),
      overage_limit: z.string().nullable(),
      rollover_percentage: z.number().nullable(),
      rollover_timeframe_count: z.number().nullable(),
      rollover_timeframe_interval: z
        .enum(["Day", "Week", "Month", "Year"])
        .nullable()
        ,
    }),
  ),
  meter_credit_entitlement_cart: z.array(
    z.object({
      credit_entitlement_id: z.string(),
      meter_id: z.string(),
      meter_name: z.string(),
      meter_units_per_credit: z.string(),
      product_id: z.string(),
    }),
  ),
  meters: z.array(
    z.object({
      currency: z.string(),
      description: z.string().nullable(),
      free_threshold: z.number(),
      measurement_unit: z.string(),
      meter_id: z.string(),
      name: z.string(),
      price_per_unit: z.string().nullable(),
    }),
  ),
  metadata: z.record(z.any()),
  next_billing_date: z
    .string()
    .transform((d) => new Date(d)),
  on_demand: z.boolean(),
  payment_frequency_count: z.number(),
  payment_frequency_interval: z.enum(["Day", "Week", "Month", "Year"]),
  payment_method_id: z.string().nullable(),
  previous_billing_date: z
    .string()
    .transform((d) => new Date(d)),
  product_id: z.string(),
  quantity: z.number(),
  recurring_pre_tax_amount: z.number(),
  status: z.enum([
    "pending",
    "active",
    "on_hold",
    "cancelled",
    "expired",
    "failed",
  ]),
  subscription_id: z.string(),
  subscription_period_count: z.number(),
  subscription_period_interval: z.enum(["Day", "Week", "Month", "Year"]),
  tax_id: z.string().nullable(),
  tax_inclusive: z.boolean(),
  trial_period_days: z.number(),
});

export const RefundSchema = z.object({
  payload_type: z.literal("Refund"),
  amount: z.number().nullable(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  customer: z.object({
    customer_id: z.string(),
    email: z.string(),
    metadata: z.record(z.any()),
    name: z.string(),
    phone_number: z.string().nullable(),
  }),
  currency: z.string().nullable(),
  is_partial: z.boolean(),
  metadata: z.record(z.any()),
  payment_id: z.string(),
  reason: z.string().nullable(),
  refund_id: z.string(),
  status: z.enum(["succeeded", "failed", "pending", "review"]),
});

export const DisputeSchema = z.object({
  payload_type: z.literal("Dispute"),
  amount: z.string(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  currency: z.string(),
  customer: z.object({
    customer_id: z.string(),
    email: z.string(),
    metadata: z.record(z.any()),
    name: z.string(),
    phone_number: z.string().nullable(),
  }),
  dispute_id: z.string(),
  dispute_stage: z.enum(["pre_dispute", "dispute", "pre_arbitration"]),
  dispute_status: z.enum([
    "dispute_opened",
    "dispute_expired",
    "dispute_accepted",
    "dispute_cancelled",
    "dispute_challenged",
    "dispute_won",
    "dispute_lost",
  ]),
  payment_id: z.string(),
  reason: z.string().nullable(),
  remarks: z.string().nullable(),
});

export const LicenseKeySchema = z.object({
  payload_type: z.literal("LicenseKey"),
  activations_limit: z.number().nullable(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  customer_id: z.string(),
  expires_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    ,
  id: z.string(),
  instances_count: z.number(),
  key: z.string(),
  payment_id: z.string(),
  product_id: z.string(),
  status: z.enum(["active", "expired", "disabled"]),
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

/**
 * Fired when a subscription cancellation has been scheduled for a future
 * date (e.g. end of the current billing period) but has not yet taken
 * effect. Introduced in API v1.98.0.
 */
export const SubscriptionCancellationScheduledPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.cancellation_scheduled"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

/**
 * Fired ahead of the end of a subscription's trial period so merchants can
 * prompt the customer to add a payment method or convert. Introduced in
 * API v1.98.0.
 */
export const SubscriptionTrialEndingPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.trial_ending"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

/**
 * Fired in advance of an upcoming subscription renewal so merchants can
 * send pre-renewal notifications or update billing details. Introduced in
 * API v1.98.0.
 */
export const SubscriptionUpcomingRenewalPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.upcoming_renewal"),
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

export const CreditLedgerEntrySchema = z.object({
  payload_type: z.literal("CreditLedgerEntry"),
  id: z.string(),
  amount: z.string(),
  balance_after: z.string(),
  balance_before: z.string(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  credit_entitlement_id: z.string(),
  customer_id: z.string(),
  is_credit: z.boolean(),
  overage_after: z.string(),
  overage_before: z.string(),
  transaction_type: z.enum([
    "credit_added",
    "credit_deducted",
    "credit_expired",
    "credit_rolled_over",
    "rollover_forfeited",
    "overage_charged",
    "auto_top_up",
    "manual_adjustment",
    "refund",
  ]),
  description: z.string().nullable(),
  grant_id: z.string().nullable(),
  reference_id: z.string().nullable(),
  reference_type: z.string().nullable(),
});

export const CreditBalanceLowSchema = z.object({
  payload_type: z.literal("CreditBalanceLow"),
  customer_id: z.string(),
  subscription_id: z.string(),
  credit_entitlement_id: z.string(),
  credit_entitlement_name: z.string(),
  available_balance: z.string(),
  subscription_credits_amount: z.string(),
  threshold_percent: z.number(),
  threshold_amount: z.string(),
});

export const CreditAddedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("credit.added"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: CreditLedgerEntrySchema,
});

export const CreditDeductedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("credit.deducted"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: CreditLedgerEntrySchema,
});

export const CreditExpiredPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("credit.expired"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: CreditLedgerEntrySchema,
});

export const CreditRolledOverPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("credit.rolled_over"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: CreditLedgerEntrySchema,
});

export const CreditRolloverForfeitedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("credit.rollover_forfeited"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: CreditLedgerEntrySchema,
});

export const CreditOverageChargedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("credit.overage_charged"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: CreditLedgerEntrySchema,
});

export const CreditManualAdjustmentPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("credit.manual_adjustment"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: CreditLedgerEntrySchema,
});

export const CreditBalanceLowPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("credit.balance_low"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: CreditBalanceLowSchema,
});

export const AbandonedCheckoutSchema = z.object({
  payload_type: z.literal("AbandonedCheckout"),
  abandoned_at: z.string().transform((d) => new Date(d)),
  abandonment_reason: z.enum(["payment_failed", "checkout_incomplete"]),
  customer_id: z.string(),
  payment_id: z.string(),
  status: z.enum(["abandoned", "recovering", "recovered", "exhausted", "opted_out"]),
  recovered_payment_id: z.string().nullable().optional(),
});

export const DunningAttemptSchema = z.object({
  payload_type: z.literal("DunningAttempt"),
  created_at: z.string().transform((d) => new Date(d)),
  customer_id: z.string(),
  status: z.enum(["recovering", "recovered", "exhausted"]),
  subscription_id: z.string(),
  trigger_state: z.enum(["on_hold", "cancelled"]),
  payment_id: z.string().nullable().optional(),
});

export const AbandonedCheckoutDetectedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("abandoned_checkout.detected"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: AbandonedCheckoutSchema,
});

export const AbandonedCheckoutRecoveredPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("abandoned_checkout.recovered"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: AbandonedCheckoutSchema,
});

export const DunningStartedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("dunning.started"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: DunningAttemptSchema,
});

export const DunningRecoveredPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("dunning.recovered"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: DunningAttemptSchema,
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
  SubscriptionPlanChangedPayloadSchema,
  SubscriptionCancelledPayloadSchema,
  SubscriptionCancellationScheduledPayloadSchema,
  SubscriptionTrialEndingPayloadSchema,
  SubscriptionUpcomingRenewalPayloadSchema,
  SubscriptionFailedPayloadSchema,
  SubscriptionExpiredPayloadSchema,
  SubscriptionUpdatedPayloadSchema,
  LicenseKeyCreatedPayloadSchema,
  AbandonedCheckoutDetectedPayloadSchema,
  AbandonedCheckoutRecoveredPayloadSchema,
  DunningStartedPayloadSchema,
  DunningRecoveredPayloadSchema,
  CreditAddedPayloadSchema,
  CreditDeductedPayloadSchema,
  CreditExpiredPayloadSchema,
  CreditRolledOverPayloadSchema,
  CreditRolloverForfeitedPayloadSchema,
  CreditOverageChargedPayloadSchema,
  CreditManualAdjustmentPayloadSchema,
  CreditBalanceLowPayloadSchema,
]);

// expands the type, improves readability for type users
export type Resolve<T> = T extends Function ? T : { [K in keyof T]: T[K] };

export type Payment = z.infer<typeof PaymentSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type Refund = z.infer<typeof RefundSchema>;
export type Dispute = z.infer<typeof DisputeSchema>;
export type LicenseKey = z.infer<typeof LicenseKeySchema>;
export type CreditLedgerEntry = z.infer<typeof CreditLedgerEntrySchema>;
export type CreditBalanceLow = z.infer<typeof CreditBalanceLowSchema>;
export type AbandonedCheckout = z.infer<typeof AbandonedCheckoutSchema>;
export type DunningAttempt = z.infer<typeof DunningAttemptSchema>;
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
  onSubscriptionPlanChanged?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionPlanChangedPayloadSchema>
  >;
  onSubscriptionCancelled?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionCancelledPayloadSchema>
  >;
  onSubscriptionCancellationScheduled?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionCancellationScheduledPayloadSchema>
  >;
  onSubscriptionTrialEnding?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionTrialEndingPayloadSchema>
  >;
  onSubscriptionUpcomingRenewal?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionUpcomingRenewalPayloadSchema>
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
  onAbandonedCheckoutDetected?: HandlerWithContext<
    TContext,
    z.infer<typeof AbandonedCheckoutDetectedPayloadSchema>
  >;
  onAbandonedCheckoutRecovered?: HandlerWithContext<
    TContext,
    z.infer<typeof AbandonedCheckoutRecoveredPayloadSchema>
  >;
  onDunningStarted?: HandlerWithContext<
    TContext,
    z.infer<typeof DunningStartedPayloadSchema>
  >;
  onDunningRecovered?: HandlerWithContext<
    TContext,
    z.infer<typeof DunningRecoveredPayloadSchema>
  >;
  onCreditAdded?: HandlerWithContext<
    TContext,
    z.infer<typeof CreditAddedPayloadSchema>
  >;
  onCreditDeducted?: HandlerWithContext<
    TContext,
    z.infer<typeof CreditDeductedPayloadSchema>
  >;
  onCreditExpired?: HandlerWithContext<
    TContext,
    z.infer<typeof CreditExpiredPayloadSchema>
  >;
  onCreditRolledOver?: HandlerWithContext<
    TContext,
    z.infer<typeof CreditRolledOverPayloadSchema>
  >;
  onCreditRolloverForfeited?: HandlerWithContext<
    TContext,
    z.infer<typeof CreditRolloverForfeitedPayloadSchema>
  >;
  onCreditOverageCharged?: HandlerWithContext<
    TContext,
    z.infer<typeof CreditOverageChargedPayloadSchema>
  >;
  onCreditManualAdjustment?: HandlerWithContext<
    TContext,
    z.infer<typeof CreditManualAdjustmentPayloadSchema>
  >;
  onCreditBalanceLow?: HandlerWithContext<
    TContext,
    z.infer<typeof CreditBalanceLowPayloadSchema>
  >;
};

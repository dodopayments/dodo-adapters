import { z } from "zod/v3";

// Timestamp fields are transformed from ISO strings into Date objects, which
// is long-standing @dodopayments/core behaviour that consumers rely on.

const metadataSchema = z.record(z.any());

const customerLimitedDetailsSchema = z.object({
  customer_id: z.string(),
  email: z.string(),
  name: z.string(),
  metadata: metadataSchema.optional(),
  phone_number: z.string().nullable().optional(),
});

const billingAddressSchema = z.object({
  city: z.string().nullable(),
  country: z.string(),
  state: z.string().nullable(),
  street: z.string().nullable(),
  zipcode: z.string().nullable(),
});

const customFieldResponseSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const discountTypeSchema = z.enum(["percentage"]);

/** A single stacked discount applied to a payment or subscription. */
export const discountDetailSchema = z.object({
  amount: z.number(),
  business_id: z.string(),
  code: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  discount_id: z.string(),
  metadata: metadataSchema,
  position: z.number(),
  preserve_on_plan_change: z.boolean(),
  restricted_to: z.array(z.string()),
  times_used: z.number(),
  type: discountTypeSchema,
  cycles_remaining: z.number().nullable().optional(),
  expires_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    .optional(),
  name: z.string().nullable().optional(),
  subscription_cycles: z.number().nullable().optional(),
  usage_limit: z.number().nullable().optional(),
});

export const disputeStageSchema = z.enum([
  "pre_dispute",
  "dispute",
  "pre_arbitration",
]);

export const disputeStatusSchema = z.enum([
  "dispute_opened",
  "dispute_expired",
  "dispute_accepted",
  "dispute_cancelled",
  "dispute_challenged",
  "dispute_won",
  "dispute_lost",
]);

export const refundStatusSchema = z.enum([
  "succeeded",
  "failed",
  "pending",
  "review",
]);

export const intentStatusSchema = z.enum([
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
]);

/** `stripe`/`adyen` for BYOP routes; `dodo` for payments Dodo processed. */
export const paymentProviderSchema = z.enum(["stripe", "adyen", "dodo"]);

export const timeIntervalSchema = z.enum(["Day", "Week", "Month", "Year"]);

const refundListItemSchema = z.object({
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  is_partial: z.boolean(),
  payment_id: z.string(),
  refund_id: z.string(),
  status: refundStatusSchema,
  amount: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
});

// The smaller `Dispute` shape embedded in `Payment.disputes[]` — it has no
// brand_id/customer/payment_provider (those only appear on the standalone
// `GetDispute` below).
const disputeSchema = z.object({
  amount: z.string(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  currency: z.string(),
  dispute_id: z.string(),
  dispute_stage: disputeStageSchema,
  dispute_status: disputeStatusSchema,
  payment_id: z.string(),
  is_resolved_by_rdr: z.boolean().nullable().optional(),
  remarks: z.string().nullable().optional(),
});

// The full `GetDispute` shape used by the standalone dispute.* webhooks.
const getDisputeSchema = z.object({
  amount: z.string(),
  brand_id: z.string(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  currency: z.string(),
  customer: customerLimitedDetailsSchema,
  dispute_id: z.string(),
  dispute_stage: disputeStageSchema,
  dispute_status: disputeStatusSchema,
  payment_id: z.string(),
  payment_provider: paymentProviderSchema,
  is_resolved_by_rdr: z.boolean().nullable().optional(),
  reason: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
});

export const PaymentSchema = z.object({
  payload_type: z.literal("Payment"),
  billing: billingAddressSchema,
  brand_id: z.string(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  currency: z.string(),
  customer: customerLimitedDetailsSchema,
  digital_products_delivered: z.boolean(),
  disputes: z.array(disputeSchema),
  is_update_payment_method: z.boolean(),
  metadata: metadataSchema,
  payment_id: z.string(),
  payment_provider: paymentProviderSchema,
  refunds: z.array(refundListItemSchema),
  retry_attempt: z.number(),
  settlement_amount: z.number(),
  settlement_currency: z.string(),
  total_amount: z.number(),
  card_holder_name: z.string().nullable().optional(),
  card_issuing_country: z.string().nullable().optional(),
  card_last_four: z.string().nullable().optional(),
  card_network: z.string().nullable().optional(),
  card_type: z.string().nullable().optional(),
  checkout_session_id: z.string().nullable().optional(),
  custom_field_responses: z
    .array(customFieldResponseSchema)
    .nullable()
    .optional(),
  /** @deprecated Use `discounts` instead. */
  discount_id: z.string().nullable().optional(),
  discounts: z.array(discountDetailSchema).nullable().optional(),
  error_code: z.string().nullable().optional(),
  error_message: z.string().nullable().optional(),
  invoice_id: z.string().nullable().optional(),
  invoice_url: z.string().nullable().optional(),
  payment_link: z.string().nullable().optional(),
  payment_method: z.string().nullable().optional(),
  payment_method_id: z.string().nullable().optional(),
  payment_method_type: z.string().nullable().optional(),
  product_cart: z
    .array(
      z.object({
        product_id: z.string(),
        quantity: z.number(),
      }),
    )
    .nullable()
    .optional(),
  refund_status: z.enum(["partial", "full"]).nullable().optional(),
  settlement_tax: z.number().nullable().optional(),
  status: intentStatusSchema.nullable().optional(),
  subscription_id: z.string().nullable().optional(),
  tax: z.number().nullable().optional(),
  updated_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    .optional(),
});

export const cbbOverageBehaviorSchema = z.enum([
  "forgive_at_reset",
  "invoice_at_billing",
  "carry_deficit",
  "carry_deficit_auto_repay",
]);

export const subscriptionStatusSchema = z.enum([
  "pending",
  "active",
  "on_hold",
  "cancelled",
  "failed",
  "expired",
]);

export const cancellationFeedbackSchema = z.enum([
  "too_expensive",
  "missing_features",
  "switched_service",
  "unused",
  "customer_service",
  "low_quality",
  "too_complex",
  "other",
]);

const creditEntitlementCartResponseSchema = z.object({
  credit_entitlement_id: z.string(),
  credit_entitlement_name: z.string(),
  credits_amount: z.string(),
  overage_balance: z.string(),
  overage_behavior: cbbOverageBehaviorSchema,
  overage_enabled: z.boolean(),
  product_id: z.string(),
  remaining_balance: z.string(),
  rollover_enabled: z.boolean(),
  unit: z.string(),
  expires_after_days: z.number().nullable().optional(),
  low_balance_threshold_percent: z.number().nullable().optional(),
  max_rollover_count: z.number().nullable().optional(),
  overage_limit: z.string().nullable().optional(),
  rollover_percentage: z.number().nullable().optional(),
  rollover_timeframe_count: z.number().nullable().optional(),
  rollover_timeframe_interval: timeIntervalSchema.nullable().optional(),
});

const meterCreditEntitlementCartResponseSchema = z.object({
  credit_entitlement_id: z.string(),
  meter_id: z.string(),
  meter_name: z.string(),
  meter_units_per_credit: z.string(),
  product_id: z.string(),
});

const meterCartResponseItemSchema = z.object({
  currency: z.string(),
  free_threshold: z.number(),
  measurement_unit: z.string(),
  meter_id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price_per_unit: z.string().nullable().optional(),
});

export const scheduledPlanChangeSchema = z.object({
  id: z.string(),
  addons: z.array(
    z.object({
      addon_id: z.string(),
      name: z.string(),
      quantity: z.number(),
    }),
  ),
  created_at: z.string().transform((d) => new Date(d)),
  effective_at: z.string().transform((d) => new Date(d)),
  product_id: z.string(),
  quantity: z.number(),
  product_description: z.string().nullable().optional(),
  product_name: z.string().nullable().optional(),
});

export const SubscriptionSchema = z.object({
  payload_type: z.literal("Subscription"),
  addons: z.array(
    z.object({
      addon_id: z.string(),
      quantity: z.number(),
    }),
  ),
  billing: billingAddressSchema,
  brand_id: z.string(),
  cancel_at_next_billing_date: z.boolean(),
  created_at: z.string().transform((d) => new Date(d)),
  credit_entitlement_cart: z.array(creditEntitlementCartResponseSchema),
  currency: z.string(),
  customer: customerLimitedDetailsSchema,
  metadata: metadataSchema,
  meter_credit_entitlement_cart: z.array(
    meterCreditEntitlementCartResponseSchema,
  ),
  meters: z.array(meterCartResponseItemSchema),
  next_billing_date: z.string().transform((d) => new Date(d)),
  on_demand: z.boolean(),
  payment_frequency_count: z.number(),
  payment_frequency_interval: timeIntervalSchema,
  previous_billing_date: z.string().transform((d) => new Date(d)),
  product_id: z.string(),
  quantity: z.number(),
  recurring_pre_tax_amount: z.number(),
  status: subscriptionStatusSchema,
  subscription_id: z.string(),
  subscription_period_count: z.number(),
  subscription_period_interval: timeIntervalSchema,
  tax_inclusive: z.boolean(),
  trial_period_days: z.number(),
  cancellation_comment: z.string().nullable().optional(),
  cancellation_feedback: cancellationFeedbackSchema.nullable().optional(),
  cancelled_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    .optional(),
  custom_field_responses: z
    .array(customFieldResponseSchema)
    .nullable()
    .optional(),
  customer_business_name: z.string().nullable().optional(),
  /** @deprecated Use `discounts[].cycles_remaining` instead. */
  discount_cycles_remaining: z.number().nullable().optional(),
  /** @deprecated Use `discounts` instead. */
  discount_id: z.string().nullable().optional(),
  discounts: z.array(discountDetailSchema).nullable().optional(),
  expires_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    .optional(),
  payment_method_id: z.string().nullable().optional(),
  scheduled_change: scheduledPlanChangeSchema.nullable().optional(),
  tax_id: z.string().nullable().optional(),
});

export const RefundSchema = z.object({
  payload_type: z.literal("Refund"),
  brand_id: z.string(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  customer: customerLimitedDetailsSchema,
  is_partial: z.boolean(),
  metadata: metadataSchema,
  payment_id: z.string(),
  refund_id: z.string(),
  status: refundStatusSchema,
  amount: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
});

export const DisputeSchema = getDisputeSchema.extend({
  payload_type: z.literal("Dispute"),
});

export const licenseKeyStatusSchema = z.enum(["active", "expired", "disabled"]);

export const LicenseKeySchema = z.object({
  payload_type: z.literal("LicenseKey"),
  id: z.string(),
  brand_id: z.string(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  customer_id: z.string(),
  instances_count: z.number(),
  key: z.string(),
  product_id: z.string(),
  source: z.enum(["auto", "import", "manual"]),
  status: licenseKeyStatusSchema,
  activations_limit: z.number().nullable().optional(),
  expires_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    .optional(),
  payment_id: z.string().nullable().optional(),
  subscription_id: z.string().nullable().optional(),
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

export const SubscriptionPausedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.paused"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

export const SubscriptionUnpausedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.unpaused"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: SubscriptionSchema,
});

export const SubscriptionUpdatePaymentMethodPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("subscription.update_payment_method"),
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
  brand_id: z.string(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  credit_entitlement_id: z.string(),
  customer_id: z.string(),
  is_credit: z.boolean(),
  metadata: metadataSchema,
  overage_after: z.string(),
  overage_before: z.string(),
  transaction_type: z.enum([
    "credit_added",
    "credit_deducted",
    "credit_expired",
    "credit_rolled_over",
    "rollover_forfeited",
    "overage_charged",
    "overage_reset",
    "auto_top_up",
    "manual_adjustment",
    "refund",
  ]),
  description: z.string().nullable().optional(),
  grant_id: z.string().nullable().optional(),
  reference_id: z.string().nullable().optional(),
  reference_type: z.string().nullable().optional(),
});

export const CreditBalanceLowSchema = z.object({
  payload_type: z.literal("CreditBalanceLow"),
  available_balance: z.string(),
  brand_id: z.string(),
  credit_entitlement_id: z.string(),
  credit_entitlement_name: z.string(),
  customer_id: z.string(),
  subscription_credits_amount: z.string(),
  subscription_id: z.string(),
  threshold_amount: z.string(),
  threshold_percent: z.number(),
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
  brand_id: z.string(),
  customer_id: z.string(),
  payment_id: z.string(),
  status: z.enum([
    "abandoned",
    "recovering",
    "recovered",
    "exhausted",
    "opted_out",
  ]),
  recovered_payment_id: z.string().nullable().optional(),
});

export const DunningAttemptSchema = z.object({
  payload_type: z.literal("DunningAttempt"),
  brand_id: z.string(),
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

export const CreditOverageResetPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("credit.overage_reset"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: CreditLedgerEntrySchema,
});

export const entitlementIntegrationTypeSchema = z.enum([
  "discord",
  "telegram",
  "github",
  "figma",
  "framer",
  "notion",
  "digital_files",
  "license_key",
  "feature_flag",
]);

export const featureTypeSchema = z.enum(["boolean"]);

const entitlementFeatureSchema = z.object({
  feature_id: z.string(),
  feature_type: featureTypeSchema,
});

const licenseKeyGrantSchema = z.object({
  activations_used: z.number(),
  key: z.string(),
  activations_limit: z.number().nullable().optional(),
  expires_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    .optional(),
});

const digitalProductDeliveryFileSchema = z.object({
  download_url: z.string(),
  expires_in: z.number(),
  file_id: z.string(),
  filename: z.string(),
  content_type: z.string().nullable().optional(),
  file_size: z.number().nullable().optional(),
});

const digitalProductDeliverySchema = z.object({
  files: z.array(digitalProductDeliveryFileSchema),
  external_url: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
});

export const EntitlementGrantSchema = z.object({
  payload_type: z.literal("EntitlementGrant"),
  id: z.string(),
  brand_id: z.string(),
  business_id: z.string(),
  created_at: z.string().transform((d) => new Date(d)),
  customer_id: z.string(),
  entitlement_id: z.string(),
  integration_type: entitlementIntegrationTypeSchema,
  metadata: metadataSchema,
  status: z.enum(["Pending", "Delivered", "Failed", "Revoked"]),
  updated_at: z.string().transform((d) => new Date(d)),
  delivered_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    .optional(),
  digital_product_delivery: digitalProductDeliverySchema.nullable().optional(),
  error_code: z.string().nullable().optional(),
  error_message: z.string().nullable().optional(),
  feature: entitlementFeatureSchema.nullable().optional(),
  license_key: licenseKeyGrantSchema.nullable().optional(),
  oauth_expires_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    .optional(),
  oauth_url: z.string().nullable().optional(),
  payment_id: z.string().nullable().optional(),
  revocation_reason: z.string().nullable().optional(),
  revoked_at: z
    .string()
    .transform((d) => new Date(d))
    .nullable()
    .optional(),
  subscription_id: z.string().nullable().optional(),
});

export const EntitlementGrantCreatedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("entitlement_grant.created"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: EntitlementGrantSchema,
});

export const EntitlementGrantDeliveredPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("entitlement_grant.delivered"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: EntitlementGrantSchema,
});

export const EntitlementGrantFailedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("entitlement_grant.failed"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: EntitlementGrantSchema,
});

export const EntitlementGrantRevokedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("entitlement_grant.revoked"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: EntitlementGrantSchema,
});

// payout.* events have no modeled data payload in the SDK, so `data` is left
// permissive.
const payoutEventDataSchema = z.record(z.any());

export const PayoutNotInitiatedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("payout.not_initiated"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: payoutEventDataSchema,
});

export const PayoutOnHoldPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("payout.on_hold"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: payoutEventDataSchema,
});

export const PayoutInProgressPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("payout.in_progress"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: payoutEventDataSchema,
});

export const PayoutFailedPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("payout.failed"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: payoutEventDataSchema,
});

export const PayoutSuccessPayloadSchema = z.object({
  business_id: z.string(),
  type: z.literal("payout.success"),
  timestamp: z.string().transform((d) => new Date(d)),
  data: payoutEventDataSchema,
});

// Known event types are excluded from the fallback below so unmodeled/future
// types validate permissively (and dispatch via onPayload) instead of being
// rejected.
const KNOWN_WEBHOOK_EVENT_TYPES = [
  "payment.succeeded",
  "payment.failed",
  "payment.processing",
  "payment.cancelled",
  "refund.succeeded",
  "refund.failed",
  "dispute.opened",
  "dispute.expired",
  "dispute.accepted",
  "dispute.cancelled",
  "dispute.challenged",
  "dispute.won",
  "dispute.lost",
  "subscription.active",
  "subscription.on_hold",
  "subscription.renewed",
  "subscription.plan_changed",
  "subscription.cancelled",
  "subscription.failed",
  "subscription.expired",
  "subscription.updated",
  "subscription.paused",
  "subscription.unpaused",
  "subscription.update_payment_method",
  "license_key.created",
  "abandoned_checkout.detected",
  "abandoned_checkout.recovered",
  "dunning.started",
  "dunning.recovered",
  "credit.added",
  "credit.deducted",
  "credit.expired",
  "credit.rolled_over",
  "credit.rollover_forfeited",
  "credit.overage_charged",
  "credit.overage_reset",
  "credit.manual_adjustment",
  "credit.balance_low",
  "entitlement_grant.created",
  "entitlement_grant.delivered",
  "entitlement_grant.failed",
  "entitlement_grant.revoked",
  "payout.not_initiated",
  "payout.on_hold",
  "payout.in_progress",
  "payout.failed",
  "payout.success",
] as const;

export const UnknownWebhookPayloadSchema = z.object({
  business_id: z.string(),
  type: z
    .string()
    .refine((t) => !KNOWN_WEBHOOK_EVENT_TYPES.includes(t as never), {
      message: "handled by a specific schema",
    }),
  timestamp: z.string().transform((d) => new Date(d)),
  data: z.record(z.any()),
});

const KnownWebhookPayloadSchema = z.discriminatedUnion("type", [
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
  SubscriptionFailedPayloadSchema,
  SubscriptionExpiredPayloadSchema,
  SubscriptionUpdatedPayloadSchema,
  SubscriptionPausedPayloadSchema,
  SubscriptionUnpausedPayloadSchema,
  SubscriptionUpdatePaymentMethodPayloadSchema,
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
  CreditOverageResetPayloadSchema,
  CreditManualAdjustmentPayloadSchema,
  CreditBalanceLowPayloadSchema,
  EntitlementGrantCreatedPayloadSchema,
  EntitlementGrantDeliveredPayloadSchema,
  EntitlementGrantFailedPayloadSchema,
  EntitlementGrantRevokedPayloadSchema,
  PayoutNotInitiatedPayloadSchema,
  PayoutOnHoldPayloadSchema,
  PayoutInProgressPayloadSchema,
  PayoutFailedPayloadSchema,
  PayoutSuccessPayloadSchema,
]);

// Union of all modeled events plus the permissive fallback for unknown types.
export const WebhookPayloadSchema = z.union([
  KnownWebhookPayloadSchema,
  UnknownWebhookPayloadSchema,
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
export type EntitlementGrant = z.infer<typeof EntitlementGrantSchema>;
export type DiscountDetail = z.infer<typeof discountDetailSchema>;
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
  onSubscriptionPaused?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionPausedPayloadSchema>
  >;
  onSubscriptionUnpaused?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionUnpausedPayloadSchema>
  >;
  onSubscriptionUpdatePaymentMethod?: HandlerWithContext<
    TContext,
    z.infer<typeof SubscriptionUpdatePaymentMethodPayloadSchema>
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
  onCreditOverageReset?: HandlerWithContext<
    TContext,
    z.infer<typeof CreditOverageResetPayloadSchema>
  >;
  onCreditManualAdjustment?: HandlerWithContext<
    TContext,
    z.infer<typeof CreditManualAdjustmentPayloadSchema>
  >;
  onCreditBalanceLow?: HandlerWithContext<
    TContext,
    z.infer<typeof CreditBalanceLowPayloadSchema>
  >;
  onEntitlementGrantCreated?: HandlerWithContext<
    TContext,
    z.infer<typeof EntitlementGrantCreatedPayloadSchema>
  >;
  onEntitlementGrantDelivered?: HandlerWithContext<
    TContext,
    z.infer<typeof EntitlementGrantDeliveredPayloadSchema>
  >;
  onEntitlementGrantFailed?: HandlerWithContext<
    TContext,
    z.infer<typeof EntitlementGrantFailedPayloadSchema>
  >;
  onEntitlementGrantRevoked?: HandlerWithContext<
    TContext,
    z.infer<typeof EntitlementGrantRevokedPayloadSchema>
  >;
  onPayoutNotInitiated?: HandlerWithContext<
    TContext,
    z.infer<typeof PayoutNotInitiatedPayloadSchema>
  >;
  onPayoutOnHold?: HandlerWithContext<
    TContext,
    z.infer<typeof PayoutOnHoldPayloadSchema>
  >;
  onPayoutInProgress?: HandlerWithContext<
    TContext,
    z.infer<typeof PayoutInProgressPayloadSchema>
  >;
  onPayoutFailed?: HandlerWithContext<
    TContext,
    z.infer<typeof PayoutFailedPayloadSchema>
  >;
  onPayoutSuccess?: HandlerWithContext<
    TContext,
    z.infer<typeof PayoutSuccessPayloadSchema>
  >;
};

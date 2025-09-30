import { z } from "zod";
import DodoPayments, { ClientOptions } from "dodopayments";

export const attachAddonReqSchema = z.object({
  addon_id: z.string(),
  quantity: z.number().int().nonnegative(),
});

export const prorationBillingModeSchema = z.enum([
  "prorated_immediately",
  "full_immediately",
  "difference_immediately",
]);

export const updateSubscriptionPlanReqSchema = z.object({
  product_id: z.string(),
  proration_billing_mode: prorationBillingModeSchema,
  quantity: z.number().int().positive(),
  addons: z.array(attachAddonReqSchema).nullable().optional(),
});

export type UpdateSubscriptionPlanReq = z.infer<
  typeof updateSubscriptionPlanReqSchema
>;

export type SubscriptionsHandlerConfig = Pick<
  ClientOptions,
  "bearerToken" | "environment"
>;

/**
 * Change an existing subscription's plan.
 * Validates input via Zod and calls the official SDK endpoint.
 */
export async function changeSubscriptionPlan(
  subscriptionId: string,
  payload: UpdateSubscriptionPlanReq,
  config: SubscriptionsHandlerConfig,
) {
  const validation = updateSubscriptionPlanReqSchema.safeParse(payload);
  if (!validation.success) {
    throw new Error(
      `Invalid change plan payload: ${validation.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ")}`,
    );
  }

  const dodopayments = new DodoPayments({
    bearerToken: config.bearerToken,
    environment: config.environment,
  });

  try {
    return await (dodopayments as any).subscriptions.changePlan(
      subscriptionId,
      validation.data as any,
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to change subscription plan: ${error.message}`);
    }
    throw new Error("Failed to change subscription plan due to unknown error");
  }
}



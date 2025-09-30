import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { changeSubscriptionPlan } from "@dodopayments/core/subscriptions";

const envSchema = z.object({
  DODO_PAYMENTS_API_KEY: z.string().min(1),
  DODO_ENVIRONMENT: z.enum(["test_mode", "live_mode"]),
});

const bodySchema = z.object({
  subscription_id: z.string().min(1),
  product_id: z.string().min(1),
  proration_billing_mode: z.enum([
    "prorated_immediately",
    "full_immediately",
    "difference_immediately",
  ]),
  quantity: z.number().int().positive(),
  addons: z
    .array(z.object({ addon_id: z.string(), quantity: z.number().int().nonnegative() }))
    .optional()
    .nullable(),
});

export async function POST(req: NextRequest) {
  const envInput = {
    DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY,
    DODO_ENVIRONMENT:
      (process.env.DODO_ENVIRONMENT as any) ??
      (process.env.DODO_PAYMENTS_ENVIRONMENT as any),
  };
  const env = envSchema.parse(envInput);

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { subscription_id, ...payload } = parsed.data;

  try {
    const result = await changeSubscriptionPlan(subscription_id, payload, {
      bearerToken: env.DODO_PAYMENTS_API_KEY,
      environment: env.DODO_ENVIRONMENT,
    });
    // Some endpoints return empty body on success; normalize response
    return NextResponse.json(result ?? { success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status =
      /404/.test(message) ? 404 : /401|403/.test(message) ? 401 : /422/.test(message) ? 422 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}



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
    .array(z.object({ addon_id: z.string(), quantity: z.number().int().positive() }))
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
  let env: z.infer<typeof envSchema>;
  try {
    env = envSchema.parse(envInput);
  } catch (e: unknown) {
    const desc = e instanceof Error ? e.message : "Invalid environment configuration";
    console.error("Change-plan env parse failed", { error: desc, envInput: { DODO_ENVIRONMENT: envInput.DODO_ENVIRONMENT ? "[set]" : undefined, DODO_PAYMENTS_API_KEY: envInput.DODO_PAYMENTS_API_KEY ? "[set]" : undefined } });
    return NextResponse.json(
      { error: `Missing or invalid environment variables: ${desc}` },
      { status: 500 },
    );
  }

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
  } catch (e: any) {
    // Prefer structured status if provided by SDK/core
    const status: number = e?.status ?? e?.statusCode ?? 500;
    // Map to safe, client-facing messages
    const safeMessage =
      status === 404
        ? "Resource not found"
        : status === 403
        ? "Forbidden"
        : status === 401
        ? "Unauthorized"
        : status === 422
        ? "Request validation failed"
        : "Internal server error";
    // Log full server-side error for observability
    console.error("Change-plan failed", { status: e?.status ?? e?.statusCode, message: e?.message, stack: e?.stack });
    return NextResponse.json({ error: safeMessage }, { status });
  }
}



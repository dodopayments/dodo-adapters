import type DodoPayments from "dodopayments";
import { APIError, getSessionFromCtx } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { z } from "zod";
import type { Product } from "../types";
import {
  buildCheckoutUrl,
  dynamicCheckoutBodySchema,
  checkoutSessionPayloadSchema,
} from "@dodopayments/core/checkout";

export interface CheckoutOptions {
  /**
   * Optional list of slug -> productId mappings for easy slug checkouts
   */
  products?: Product[] | (() => Promise<Product[]>);
  /**
   * Checkout Success URL
   */
  successUrl?: string;
  /**
   * Only allow authenticated customers to checkout
   */
  authenticatedUsersOnly?: boolean;
  /**
   * Checkout type: "dynamic" for legacy payment links, "session" for modern checkout sessions
   * @default "session"
   */
  type?: "dynamic" | "session";
}

export const checkout =
  (checkoutOptions: CheckoutOptions = {}) =>
  (dodopayments: DodoPayments) => {
    // Create union schema that supports both checkout types with extensions
    const unifiedBodySchema = z.union([
      // Checkout sessions schema
      checkoutSessionPayloadSchema.extend({
        slug: z.string().optional(),
        referenceId: z.string().optional(),
      }),
      // Dynamic checkout schema  
      dynamicCheckoutBodySchema.extend({
        slug: z.string().optional(),
        referenceId: z.string().optional(),
      }),
    ]);

    return {
      checkout: createAuthEndpoint(
        "/dodopayments/checkout",
        {
          method: "POST",
          body: unifiedBodySchema, // Use proper union schema instead of z.any()
          requireRequest: true,
        },
        async (ctx) => {
          const session = await getSessionFromCtx(ctx);

          if (checkoutOptions.authenticatedUsersOnly && !session?.user.id) {
            throw new APIError("UNAUTHORIZED", {
              message: "You must be logged in to checkout",
            });
          }

          if (checkoutOptions.type === "dynamic") {
            // Handle dynamic checkout
            let dodoPaymentsProductId: string | undefined;

            if (ctx.body?.slug) {
              const resolvedProducts = await (typeof checkoutOptions.products ===
              "function"
                ? checkoutOptions.products()
                : checkoutOptions.products);

              const productId = resolvedProducts?.find(
                (product) => product.slug === ctx.body.slug,
              )?.productId;

              if (!productId) {
                throw new APIError("BAD_REQUEST", {
                  message: "Product not found",
                });
              }

              dodoPaymentsProductId = productId;
            } else {
              dodoPaymentsProductId = (ctx.body as any).product_id;
            }

            try {
              const dynamicBody = {
                ...ctx.body,
                product_id: dodoPaymentsProductId,
                customer: {
                  email: session?.user.email,
                  name: session?.user.name,
                  ...(ctx.body as any).customer,
                },
                product_cart: dodoPaymentsProductId
                  ? [
                      {
                        product_id: dodoPaymentsProductId,
                        quantity: 1,
                      },
                    ]
                  : undefined,
                metadata: (ctx.body as any).referenceId
                  ? {
                      referenceId: (ctx.body as any).referenceId,
                      ...(ctx.body as any).metadata,
                    }
                  : (ctx.body as any).metadata,
              };

              const checkoutUrl = await buildCheckoutUrl({
                body: dynamicBody as any,
                bearerToken: dodopayments.bearerToken,
                environment: dodopayments.baseURL.includes("test")
                  ? "test_mode"
                  : "live_mode",
                returnUrl: checkoutOptions.successUrl
                  ? new URL(
                      checkoutOptions.successUrl,
                      ctx.request?.url,
                    ).toString()
                  : undefined,
                type: "dynamic",
              });

              return ctx.json({
                checkout_url: checkoutUrl,
              });
            } catch (error: any) {
              throw new APIError("BAD_REQUEST", {
                message: error.message,
              });
            }
          } else {
            // Handle checkout session
            let dodoPaymentsProductId: string | undefined;

            if (ctx.body?.slug) {
              const resolvedProducts = await (typeof checkoutOptions.products ===
              "function"
                ? checkoutOptions.products()
                : checkoutOptions.products);

              const productId = resolvedProducts?.find(
                (product) => product.slug === ctx.body.slug,
              )?.productId;

              if (!productId) {
                throw new APIError("BAD_REQUEST", {
                  message: "Product not found",
                });
              }

              dodoPaymentsProductId = productId;
            }

            try {
              const sessionPayload = {
                ...ctx.body,
                product_cart: dodoPaymentsProductId
                  ? [{ product_id: dodoPaymentsProductId, quantity: 1 }]
                  : (ctx.body as any).product_cart,
                customer: {
                  email: session?.user.email,
                  name: session?.user.name,
                  ...(ctx.body as any).customer,
                },
                ...(checkoutOptions.successUrl && {
                  return_url: new URL(
                    checkoutOptions.successUrl,
                    ctx.request?.url,
                  ).toString(),
                }),
                metadata: (ctx.body as any).referenceId
                  ? {
                      referenceId: (ctx.body as any).referenceId,
                      ...(ctx.body as any).metadata,
                    }
                  : (ctx.body as any).metadata,
              };

              const checkoutUrl = await buildCheckoutUrl({
                sessionPayload,
                bearerToken: dodopayments.bearerToken,
                environment: dodopayments.baseURL.includes("test")
                  ? "test_mode"
                  : "live_mode",
                type: "session",
              });

              return ctx.json({
                checkout_url: checkoutUrl,
              });
            } catch (error: any) {
              throw new APIError("BAD_REQUEST", {
                message: error.message,
              });
            }
          }
        },
      ),
    };
  };

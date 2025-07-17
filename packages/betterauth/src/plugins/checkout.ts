import type DodoPayments from "dodopayments";
import { APIError, getSessionFromCtx } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { z } from "zod";
import type { Product } from "../types";
import {
  buildCheckoutUrl,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
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
}

export const checkout =
  (checkoutOptions: CheckoutOptions = {}) =>
  (dodopayments: DodoPayments) => {
    return {
      checkout: createAuthEndpoint(
        "/checkout",
        {
          method: "POST",
          body: dynamicCheckoutBodySchema.extend({
            slug: z.string().optional(),
            referenceId: z.string().optional(),
          }),
        },
        async (ctx) => {
          const session = await getSessionFromCtx(ctx);

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
            dodoPaymentsProductId = ctx.body.product_id;
          }

          if (checkoutOptions.authenticatedUsersOnly && !session?.user.id) {
            throw new APIError("UNAUTHORIZED", {
              message: "You must be logged in to checkout",
            });
          }

          try {
            const checkoutUrl = await buildCheckoutUrl({
              body: {
                ...ctx.body,
                product_cart: dodoPaymentsProductId
                  ? [
                      {
                        product_id: dodoPaymentsProductId,
                        quantity: 1,
                      },
                    ]
                  : undefined,
                metadata: ctx.body.referenceId
                  ? {
                      referenceId: ctx.body.referenceId,
                      ...ctx.body.metadata,
                    }
                  : ctx.body.metadata,
              },
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

            const redirectUrl = new URL(checkoutUrl);

            return ctx.json({
              url: redirectUrl.toString(),
              redirect: true,
            });
          } catch (e: unknown) {
            if (e instanceof Error) {
              ctx.context.logger.error(
                `DodoPayments checkout creation failed. Error: ${e.message}`,
              );
            }

            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Checkout creation failed",
            });
          }
        },
      ),
      checkoutRedirect: createAuthEndpoint(
        "/checkout/static",
        {
          method: "GET",
          query: checkoutQuerySchema
            .extend({
              slug: z.string().optional(),
              referenceId: z.string().optional(),
            })
            .partial({
              productId: true,
            })
            .superRefine((obj, ctx) => {
              for (const key of Object.keys(obj)) {
                if (key.startsWith("metadata_")) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Invalid key: ${key}`,
                    path: [key],
                  });
                }
              }
            }),
        },
        async (ctx) => {
          let dodoPaymentsProductId: string | undefined;

          if (ctx.query.slug) {
            const resolvedProducts = await (typeof checkoutOptions.products ===
            "function"
              ? checkoutOptions.products()
              : checkoutOptions.products);

            const productId = resolvedProducts?.find(
              (product) => product.slug === ctx.query.slug,
            )?.productId;

            if (!productId) {
              throw new APIError("BAD_REQUEST", {
                message: "Product not found",
              });
            }

            dodoPaymentsProductId = productId;
          } else {
            dodoPaymentsProductId = ctx.query.productId;
          }

          if (!dodoPaymentsProductId) {
            throw new APIError("BAD_REQUEST", {
              message: "productId or slug not provided",
            });
          }

          try {
            const checkoutUrl = await buildCheckoutUrl({
              queryParams: {
                ...ctx.query,
                productId: dodoPaymentsProductId,
                // @ts-ignore
                metadata_referenceId: ctx.query.referenceId,
              },
              bearerToken: dodopayments.bearerToken,
              environment: dodopayments.baseURL.includes("test")
                ? "test_mode"
                : "live_mode",
              type: "static",
            });

            return ctx.redirect(checkoutUrl);
          } catch (e: unknown) {
            if (e instanceof Error) {
              ctx.context.logger.error(
                `Checkout redirect handling failed. Error: ${e.message}`,
              );
            }

            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Checkout redirect handling failed",
            });
          }
        },
      ),
    };
  };

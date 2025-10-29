import type DodoPayments from "dodopayments";
import { APIError, getSessionFromCtx } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { z } from "zod/v3";
import type { CreateCheckoutResponse, Product } from "../types";
import {
  buildCheckoutUrl,
  checkoutSessionPayloadSchema,
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
      /**
       * @deprecated
       */
      checkout: createAuthEndpoint(
        "/dodopayments/checkout",
        {
          method: "POST",
          body: dynamicCheckoutBodySchema.extend({
            slug: z.string().optional(),
            referenceId: z.string().optional(),
          }),
          requireRequest: true,
        },
        async (ctx): Promise<CreateCheckoutResponse> => {
          const session = await getSessionFromCtx(ctx);

          let dodoPaymentsProductId: string | undefined;

          if (ctx.body?.slug) {
            const resolvedProducts =
              typeof checkoutOptions.products === "function"
                ? await checkoutOptions.products()
                : checkoutOptions.products;

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
                product_id: dodoPaymentsProductId,
                customer: {
                  email: session?.user.email,
                  name: session?.user.name,
                  ...ctx.body.customer,
                },
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
      checkoutSession: createAuthEndpoint(
        "/dodopayments/checkout-session",
        {
          method: "POST",
          body: checkoutSessionPayloadSchema
            .extend({
              slug: z.string().optional(),
              referenceId: z.string().optional(),
            })
            .partial({
              product_cart: true,
            }),
          requireRequest: true,
        },
        async (ctx): Promise<CreateCheckoutResponse> => {
          const session = await getSessionFromCtx(ctx);

          let dodoPaymentsProductId: string | undefined;

          if (ctx.body?.slug) {
            const resolvedProducts =
              typeof checkoutOptions.products === "function"
                ? await checkoutOptions.products()
                : checkoutOptions.products;

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

          if (checkoutOptions.authenticatedUsersOnly && !session?.user.id) {
            throw new APIError("UNAUTHORIZED", {
              message: "You must be logged in to checkout",
            });
          }

          // Ensure we have a product_cart
          const product_cart = dodoPaymentsProductId
            ? [{ product_id: dodoPaymentsProductId, quantity: 1 }]
            : ctx.body.product_cart;

          if (!product_cart || product_cart.length === 0) {
            throw new APIError("BAD_REQUEST", {
              message: "Neither product_cart nor slug was provided",
            });
          }

          try {
            const checkoutUrl = await buildCheckoutUrl({
              sessionPayload: {
                ...ctx.body,
                product_cart,
                customer: {
                  email: session?.user.email,
                  name: session?.user.name,
                  ...ctx.body.customer,
                },
                metadata: ctx.body.referenceId
                  ? {
                      referenceId: ctx.body.referenceId,
                      ...ctx.body.metadata,
                    }
                  : ctx.body.metadata,
                return_url: checkoutOptions.successUrl
                  ? new URL(
                      checkoutOptions.successUrl,
                      ctx.request?.url,
                    ).toString()
                  : undefined,
              },
              bearerToken: dodopayments.bearerToken,
              environment: dodopayments.baseURL.includes("test")
                ? "test_mode"
                : "live_mode",
              type: "session",
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
              message: "Checkout session creation failed",
            });
          }
        },
      ),
    };
  };

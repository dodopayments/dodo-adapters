import type DodoPayments from "dodopayments";
import { APIError, getSessionFromCtx } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import type { CreateCheckoutResponse, Product } from "../types";
import {
  buildCheckoutUrl,
  dynamicCheckoutBodySchema,
  checkoutSessionPayloadSchema,
} from "@dodopayments/core/checkout";
import type { CheckoutSessionPayload } from "@dodopayments/core/checkout";
import { z } from "zod";

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
          "/dodopayments/checkout/session",
          {
            method: "POST",
            // Allow slug-only payloads by making product_cart optional here.
            body: checkoutSessionPayloadSchema
              .partial({ product_cart: true })
              .and(
                z.object({
                  slug: z.string().optional(),
                  referenceId: z.string().optional(),
                }),
              ),
            requireRequest: true,
          },
          async (ctx): Promise<CreateCheckoutResponse> => {
            const session = await getSessionFromCtx(ctx);

            if (checkoutOptions.authenticatedUsersOnly && !session?.user.id) {
              throw new APIError("UNAUTHORIZED", {
                message: "You must be logged in to checkout",
              });
            }

            try {
              let sessionPayload = { ...ctx.body };

              if (ctx.body?.slug) {
                const resolvedProducts = await (typeof checkoutOptions.products ===
                "function"
                  ? checkoutOptions.products()
                  : checkoutOptions.products);

                const product = resolvedProducts?.find(
                  (product) => product.slug === ctx.body.slug,
                );

                if (!product) {
                  throw new APIError("BAD_REQUEST", {
                    message: "Product not found",
                  });
                }

                // If a cart exists, append the slug-resolved product to it.
                // Otherwise, create a single-item cart with the resolved product.
                const resolvedItem = { product_id: product.productId, quantity: 1 };
                if (sessionPayload.product_cart && sessionPayload.product_cart.length > 0) {
                  sessionPayload.product_cart = [
                    ...sessionPayload.product_cart,
                    resolvedItem,
                  ];
                } else {
                  sessionPayload.product_cart = [resolvedItem];
                }
              }

              // Add customer information from session if available
              if (session?.user) {
                sessionPayload.customer = {
                  email: session.user.email,
                  name: session.user.name,
                  ...sessionPayload.customer,
                };
              }

              // Add reference ID to metadata if provided
              if (ctx.body.referenceId) {
                sessionPayload.metadata = {
                  ...sessionPayload.metadata,
                  referenceId: ctx.body.referenceId,
                };
              }

              // Set return URL
              if (checkoutOptions.successUrl) {
                sessionPayload.return_url = new URL(
                  checkoutOptions.successUrl,
                  ctx.request?.url,
                ).toString();
              }

              // Strip helper-only fields and re-validate against core schema
              const { slug: _slug, referenceId: _referenceId, ...coreDraft } =
                sessionPayload;

              const parsed = checkoutSessionPayloadSchema.safeParse(coreDraft);
              if (!parsed.success) {
                throw new APIError("BAD_REQUEST", {
                  message: `Invalid checkout session payload: ${JSON.stringify(parsed.error.issues)}`,
                });
              }
              const coreSessionPayload: CheckoutSessionPayload = parsed.data;

              const checkoutUrl = await buildCheckoutUrl({
                sessionPayload: coreSessionPayload,
                bearerToken: dodopayments.bearerToken,
                environment: dodopayments.baseURL.includes("test")
                  ? "test_mode"
                  : "live_mode",
                type: "session",
              });

              return ctx.json({
                url: checkoutUrl,
                redirect: true,
              });
            } catch (e: unknown) {
              if (e instanceof APIError) {
                // Propagate explicit API errors (e.g., 400 validation)
                throw e;
              }
              if (e instanceof Error) {
                ctx.context.logger.error(
                  `DodoPayments checkout session creation failed. Error: ${e.message}`,
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

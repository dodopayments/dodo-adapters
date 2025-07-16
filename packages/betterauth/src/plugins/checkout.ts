import type DodoPayments from "dodopayments";
import { APIError, getSessionFromCtx } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import {
  dynamicCheckoutBodySchema,
  buildCheckoutUrl,
  checkoutQuerySchema,
} from "@dodopayments/core/checkout";
import type { Product } from "../types";
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

// Create betterauth-specific schema that extends the core schema
const betterAuthCheckoutSchema = dynamicCheckoutBodySchema.extend({
  // Add betterauth-specific fields
  slug: z.string().optional(),
  products: z.array(z.string()).optional(),
  referenceId: z.string().optional(),
});

export const checkout =
  (checkoutOptions: CheckoutOptions = {}) =>
  (dodopayments: DodoPayments) => {
    return {
      checkout: createAuthEndpoint(
        "/checkout",
        {
          method: "POST",
          body: betterAuthCheckoutSchema,
        },
        async (ctx) => {
          const session = await getSessionFromCtx(ctx);

          // Handle POST request - dynamic checkout using buildCheckoutUrl
          let productIds: string[] = [];
          let productCart: Array<{ product_id: string; quantity: number }> = [];

          if (ctx.body.slug) {
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

            productCart = [{ product_id: productId, quantity: 1 }];
          } else if (ctx.body.products) {
            productIds = Array.isArray(ctx.body.products)
              ? ctx.body.products.filter(
                  (id) => typeof id === "string" && id !== undefined,
                )
              : [ctx.body.products].filter(
                  (id) => typeof id === "string" && id !== undefined,
                );

            productCart = productIds.map((id) => ({
              product_id: id,
              quantity: 1,
            }));
          }

          if (checkoutOptions.authenticatedUsersOnly && !session?.user.id) {
            throw new APIError("UNAUTHORIZED", {
              message: "You must be logged in to checkout",
            });
          }

          if (productCart.length === 0) {
            throw new APIError("BAD_REQUEST", {
              message: "No products specified for checkout",
            });
          }

          try {
            // Prepare dynamic checkout body data
            const checkoutData: any = {
              product_cart: productCart,
              payment_link: true, // Always generate payment link
            };

            // Add customer info - required by API
            if (session?.user.id) {
              // For authenticated users, find or create customer by email
              try {
                const customers = await dodopayments.customers.list({
                  email: session.user.email,
                });

                let customer = customers.items?.[0];

                if (!customer) {
                  // Create customer if doesn't exist
                  customer = await dodopayments.customers.create({
                    email: session.user.email,
                    name: session.user.name,
                  });
                }

                checkoutData.customer = { customer_id: customer.customer_id };
              } catch (error) {
                // Fallback: use email-based customer creation
                checkoutData.customer = {
                  email: session.user.email,
                  name: session.user.name,
                };
              }
            } else {
              // Provide default customer for unauthenticated users
              checkoutData.customer = {
                email: "demo@example.com",
                name: "Guest User",
              };
            }

            // Add billing address - required by API
            if (ctx.body.billing) {
              checkoutData.billing = ctx.body.billing;
            } else {
              // Provide default billing address
              checkoutData.billing = {
                city: "Default City",
                country: "US",
                state: "CA",
                street: "123 Default St",
                zipcode: "12345",
              };
            }

            // Add metadata if provided
            if (ctx.body.metadata || ctx.body.referenceId) {
              const baseMeta = ctx.body.referenceId
                ? { referenceId: ctx.body.referenceId }
                : {};
              const meta =
                ctx.body.metadata &&
                typeof ctx.body.metadata === "object" &&
                !Array.isArray(ctx.body.metadata)
                  ? ctx.body.metadata
                  : {};
              checkoutData.metadata = Object.assign({}, baseMeta, meta);
            }

            // Use buildCheckoutUrl for dynamic checkout
            const checkoutUrl = await buildCheckoutUrl({
              body: checkoutData,
              bearerToken: dodopayments.bearerToken,
              environment: dodopayments.baseURL.includes("test")
                ? "test_mode"
                : "live_mode",
              returnUrl: checkoutOptions.successUrl,
              type: "dynamic",
            });

            return new Response(null, {
              status: 307,
              headers: {
                Location: checkoutUrl,
              },
            });
          } catch (e: unknown) {
            if (e instanceof Error) {
              ctx.context.logger.error(
                `Dynamic checkout creation failed. Error: ${e.message}`,
              );
            }

            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Checkout creation failed",
            });
          }
        },
      ),
      "checkout-url": createAuthEndpoint(
        "/checkout-url",
        {
          method: "GET",
          query: checkoutQuerySchema,
        },
        async (ctx) => {
          const session = await getSessionFromCtx(ctx);

          if (checkoutOptions.authenticatedUsersOnly && !session?.user.id) {
            throw new APIError("UNAUTHORIZED", {
              message: "You must be logged in to checkout",
            });
          }

          try {
            const checkoutUrl = await buildCheckoutUrl({
              queryParams: ctx.query,
              bearerToken: dodopayments.bearerToken,
              environment: dodopayments.baseURL.includes("test")
                ? "test_mode"
                : "live_mode",
              returnUrl: checkoutOptions.successUrl,
              type: "static",
            });

            return new Response(null, {
              status: 307,
              headers: {
                Location: checkoutUrl,
              },
            });
          } catch (e: unknown) {
            if (e instanceof Error) {
              ctx.context.logger.error(
                `Static checkout URL generation failed. Error: ${e.message}`,
              );
            }
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: `Checkout URL generation failed: ${String(e)}`,
            });
          }
        },
      ),
    };
  };

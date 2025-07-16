import { z } from "zod";
import {
  buildCheckoutUrl,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema,
} from "@dodopayments/core/checkout";
import type {
  CheckoutPluginConfig,
  CheckoutPlugin,
  DodoPluginContext,
} from "../types";
import { ProductNotFoundError, UnauthorizedError } from "../client";
import type DodoPayments from "dodopayments";

/**
 * Extended checkout query schema with additional fields for BetterAuth
 */
const betterAuthCheckoutQuerySchema = checkoutQuerySchema
  .extend({
    slug: z.string().optional(),
    theme: z.enum(["light", "dark"]).optional(),
  })
  .refine((data) => data.productId || data.slug, {
    message: "Either productId or slug must be provided",
  });

/**
 * Extended checkout body schema with additional fields for BetterAuth
 */
const betterAuthCheckoutBodySchema = dynamicCheckoutBodySchema
  .extend({
    slug: z.string().optional(),
    theme: z.enum(["light", "dark"]).optional(),
  })
  .refine((data) => data.product_id || data.slug, {
    message: "Either product_id or slug must be provided",
  });

/**
 * Creates a checkout plugin for Dodo Payments
 */
export function checkout(config: CheckoutPluginConfig = {}): CheckoutPlugin {
  return {
    id: "checkout",
    config,
    endpoints: {
      "/checkout": {
        method: "GET",
        handler: async (context: DodoPluginContext) => {
          const { request, client, user } = context;
          const url = new URL(request.url);
          const queryParams = Object.fromEntries(url.searchParams);

          // Validate input
          const parseResult =
            betterAuthCheckoutQuerySchema.safeParse(queryParams);
          if (!parseResult.success) {
            return new Response(
              JSON.stringify({
                error: "Invalid parameters",
                details: parseResult.error.issues,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const { productId, slug, quantity, theme } = parseResult.data;

          // Check authentication if required
          if (config.requireAuth && !user) {
            throw new UnauthorizedError("Authentication required for checkout");
          }

          try {
            // Find product ID from slug if needed
            let finalProductId = productId;
            if (slug && !productId) {
              // Find product by slug from configured products
              const product = config.products?.find((p) => p.slug === slug);
              if (!product) {
                throw new ProductNotFoundError(slug);
              }
              finalProductId = product.productId;
            }

            if (!finalProductId) {
              return new Response(
                JSON.stringify({ error: "Product ID could not be determined" }),
                {
                  status: 400,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }

            // Build checkout URL using core functionality
            const checkoutUrl = await buildCheckoutUrl({
              queryParams: {
                productId: finalProductId,
                quantity,
              },
              bearerToken: (client as any).bearerToken,
              environment: config.environment || "test_mode",
              returnUrl: config.successUrl,
              type: "static",
            });

            // Add theme parameter if specified
            if (theme) {
              const url = new URL(checkoutUrl);
              url.searchParams.set("theme", theme);
              return Response.redirect(url.toString());
            }

            return Response.redirect(checkoutUrl);
          } catch (error) {
            console.error("Checkout error:", error);

            if (error instanceof ProductNotFoundError) {
              return new Response(JSON.stringify({ error: error.message }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
              });
            }

            if (error instanceof UnauthorizedError) {
              return new Response(JSON.stringify({ error: error.message }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
              });
            }

            return new Response(
              JSON.stringify({
                error: "Checkout failed",
                details: error instanceof Error ? error.message : String(error),
              }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        },
      },
    },
  };
}

/**
 * Creates a dynamic checkout plugin for POST requests
 */
export function dynamicCheckout(
  config: CheckoutPluginConfig = {},
): CheckoutPlugin {
  return {
    id: "checkout",
    config,
    endpoints: {
      "/checkout": {
        method: "POST",
        handler: async (context: DodoPluginContext) => {
          const { request, client, user } = context;

          let body;
          try {
            body = await request.json();
          } catch (error) {
            return new Response(
              JSON.stringify({ error: "Invalid JSON body" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          // Validate input
          const parseResult = betterAuthCheckoutBodySchema.safeParse(body);
          if (!parseResult.success) {
            return new Response(
              JSON.stringify({
                error: "Invalid parameters",
                details: parseResult.error.issues,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const { productId, slug, quantity, theme, metadata } =
            parseResult.data;

          // Check authentication if required
          if (config.requireAuth && !user) {
            throw new UnauthorizedError("Authentication required for checkout");
          }

          try {
            // Find product ID from slug if needed
            let finalProductId = productId;
            if (slug && !productId) {
              // Find product by slug from configured products
              const product = config.products?.find((p) => p.slug === slug);
              if (!product) {
                throw new ProductNotFoundError(slug);
              }
              finalProductId = product.productId;
            }

            if (!finalProductId) {
              return new Response(
                JSON.stringify({ error: "Product ID could not be determined" }),
                {
                  status: 400,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }

            // Build dynamic checkout URL using core functionality
            const checkoutUrl = await buildCheckoutUrl({
              body: {
                product_id: finalProductId,
                quantity,
                metadata,
                billing: user?.billing || {},
                customer: user?.customer || { external_id: user?.id || "" },
              },
              bearerToken: (client as any).bearerToken,
              environment: config.environment || "test_mode",
              returnUrl: config.successUrl,
              type: "dynamic",
            });

            // Add theme parameter if specified
            if (theme) {
              const url = new URL(checkoutUrl);
              url.searchParams.set("theme", theme);
              return Response.redirect(url.toString());
            }

            return Response.redirect(checkoutUrl);
          } catch (error) {
            console.error("Dynamic checkout error:", error);

            if (error instanceof ProductNotFoundError) {
              return new Response(JSON.stringify({ error: error.message }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
              });
            }

            if (error instanceof UnauthorizedError) {
              return new Response(JSON.stringify({ error: error.message }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
              });
            }

            return new Response(
              JSON.stringify({
                error: "Dynamic checkout failed",
                details: error instanceof Error ? error.message : String(error),
              }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        },
      },
    },
  };
}

// Export both static and dynamic checkout
export { checkout as default };

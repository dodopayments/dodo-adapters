import { z } from "zod";
import type {
  PortalPluginConfig,
  PortalPlugin,
  DodoPluginContext,
} from "../types";
import {
  getOrCreateCustomer,
  createCustomerPortalSession,
  getCustomerSubscriptions,
  getCustomerOrders,
  CustomerNotFoundError,
  UnauthorizedError,
} from "../client";
import type DodoPayments from "dodopayments";

/**
 * Portal query parameters schema
 */
const portalQuerySchema = z.object({
  customer_id: z.string().optional(),
  send_email: z.coerce.boolean().optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

/**
 * Subscriptions query parameters schema
 */
const subscriptionsQuerySchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
});

/**
 * Orders query parameters schema
 */
const ordersQuerySchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
});

/**
 * Creates a portal plugin for Dodo Payments customer management
 */
export function portal(config: PortalPluginConfig = {}): PortalPlugin {
  return {
    id: "portal",
    config,
    endpoints: {
      "/customer/portal": {
        method: "GET",
        handler: async (context: DodoPluginContext) => {
          const { request, client, user } = context;
          const url = new URL(request.url);
          const queryParams = Object.fromEntries(url.searchParams);

          // Validate input
          const parseResult = portalQuerySchema.safeParse(queryParams);
          if (!parseResult.success) {
            return new Response(
              JSON.stringify({
                error: "Invalid parameters",
                details: parseResult.error.issues,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const { customer_id, send_email, theme } = parseResult.data;

          // Check authentication
          if (!user) {
            throw new UnauthorizedError("Authentication required");
          }

          try {
            // Get or create customer
            let customer;
            if (customer_id) {
              // Use provided customer ID
              customer = await (client as DodoPayments).customers.retrieve(
                customer_id,
              );
            } else {
              // Get customer by user ID
              customer = await getOrCreateCustomer(
                client as DodoPayments,
                user.id,
              );
            }

            if (!customer) {
              throw new CustomerNotFoundError(customer_id || user.id);
            }

            // Create customer portal session
            const portalSession = await createCustomerPortalSession(
              client as DodoPayments,
              customer.customer_id,
              config.redirectUrl,
            );

            // Add theme parameter if specified
            if (theme && (portalSession as any).portal_url) {
              const url = new URL((portalSession as any).portal_url);
              url.searchParams.set("theme", theme);
              return Response.redirect(url.toString());
            }

            return Response.redirect((portalSession as any).portal_url);
          } catch (error) {
            console.error("Portal error:", error);

            if (error instanceof CustomerNotFoundError) {
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
                error: "Portal access failed",
                details: error instanceof Error ? error.message : String(error),
              }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        },
      },
      "/customer/state": {
        method: "GET",
        handler: async (context: DodoPluginContext) => {
          const { client, user } = context;

          // Check authentication
          if (!user) {
            throw new UnauthorizedError("Authentication required");
          }

          try {
            // Get customer by user ID
            const customer = await getOrCreateCustomer(
              client as DodoPayments,
              user.id,
            );

            if (!customer) {
              throw new CustomerNotFoundError(user.id);
            }

            // Return customer state
            return new Response(JSON.stringify({ customer }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          } catch (error) {
            console.error("Customer state error:", error);

            if (error instanceof CustomerNotFoundError) {
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
                error: "Failed to retrieve customer state",
                details: error instanceof Error ? error.message : String(error),
              }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        },
      },
      "/customer/subscriptions/list": {
        method: "GET",
        handler: async (context: DodoPluginContext) => {
          const { request, client, user } = context;
          const url = new URL(request.url);
          const queryParams = Object.fromEntries(url.searchParams);

          // Validate input
          const parseResult = subscriptionsQuerySchema.safeParse(queryParams);
          if (!parseResult.success) {
            return new Response(
              JSON.stringify({
                error: "Invalid parameters",
                details: parseResult.error.issues,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const { status, limit, page } = parseResult.data;

          // Check authentication
          if (!user) {
            throw new UnauthorizedError("Authentication required");
          }

          try {
            // Get customer by user ID
            const customer = await getOrCreateCustomer(
              client as DodoPayments,
              user.id,
            );

            if (!customer) {
              throw new CustomerNotFoundError(user.id);
            }

            // Get customer subscriptions
            const subscriptions = await getCustomerSubscriptions(
              client as DodoPayments,
              customer.customer_id,
              { status, limit, page },
            );

            return new Response(JSON.stringify({ subscriptions }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          } catch (error) {
            console.error("Subscriptions list error:", error);

            if (error instanceof CustomerNotFoundError) {
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
                error: "Failed to retrieve subscriptions",
                details: error instanceof Error ? error.message : String(error),
              }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
        },
      },
      "/customer/orders/list": {
        method: "GET",
        handler: async (context: DodoPluginContext) => {
          const { request, client, user } = context;
          const url = new URL(request.url);
          const queryParams = Object.fromEntries(url.searchParams);

          // Validate input
          const parseResult = ordersQuerySchema.safeParse(queryParams);
          if (!parseResult.success) {
            return new Response(
              JSON.stringify({
                error: "Invalid parameters",
                details: parseResult.error.issues,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const { status, limit, page } = parseResult.data;

          // Check authentication
          if (!user) {
            throw new UnauthorizedError("Authentication required");
          }

          try {
            // Get customer by user ID
            const customer = await getOrCreateCustomer(
              client as DodoPayments,
              user.id,
            );

            if (!customer) {
              throw new CustomerNotFoundError(user.id);
            }

            // Get customer orders
            const orders = await getCustomerOrders(
              client as DodoPayments,
              customer.customer_id,
              { status, limit, page },
            );

            return new Response(JSON.stringify({ orders }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          } catch (error) {
            console.error("Orders list error:", error);

            if (error instanceof CustomerNotFoundError) {
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
                error: "Failed to retrieve orders",
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

// Export portal as default
export { portal as default };

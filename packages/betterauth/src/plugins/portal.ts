import type DodoPayments from "dodopayments";
import { APIError } from "better-auth/api";
import { sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { z } from "zod";

export const portal = () => (dodopayments: DodoPayments) => {
  return {
    portal: createAuthEndpoint(
      "/customer/portal",
      {
        method: "GET",
        use: [sessionMiddleware],
      },
      async (ctx) => {
        if (!ctx.context.session?.user.id) {
          throw new APIError("BAD_REQUEST", {
            message: "User not found",
          });
        }

        try {
          // Find customer by email
          const customers = await dodopayments.customers.list({
            email: ctx.context.session?.user.email,
          });

          const customer = customers.items?.[0];

          if (!customer) {
            throw new APIError("BAD_REQUEST", {
              message: "Customer not found",
            });
          }

          // Create customer portal session
          const customerSession =
            await dodopayments.customers.customerPortal.create(
              customer.customer_id,
              {},
            );

          return ctx.json({
            url: customerSession.link,
            redirect: true,
          });
        } catch (e: unknown) {
          if (e instanceof Error) {
            ctx.context.logger.error(
              `Dodo Payments customer portal creation failed. Error: ${e.message}`,
            );
          }

          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Customer portal creation failed",
          });
        }
      },
    ),
    subscriptions: createAuthEndpoint(
      "/customer/subscriptions/list",
      {
        method: "GET",
        query: z
          .object({
            page: z.coerce.number().optional(),
            limit: z.coerce.number().optional(),
            status: z.enum(["active", "cancelled", "expired"]).optional(),
          })
          .optional(),
        use: [sessionMiddleware],
      },
      async (ctx) => {
        if (!ctx.context.session.user.id) {
          throw new APIError("BAD_REQUEST", {
            message: "User not found",
          });
        }

        try {
          // Find customer by email
          const customers = await dodopayments.customers.list({
            email: ctx.context.session?.user.email,
          });

          const customer = customers.items?.[0];

          if (!customer) {
            throw new APIError("BAD_REQUEST", {
              message: "Customer not found",
            });
          }

          const subscriptions = await dodopayments.subscriptions.list({
            customer_id: customer.customer_id,
          });

          return ctx.json(subscriptions);
        } catch (e: unknown) {
          if (e instanceof Error) {
            ctx.context.logger.error(
              `Dodo Payments subscriptions list failed. Error: ${e.message}`,
            );
          }

          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Subscriptions list failed",
          });
        }
      },
    ),
    payments: createAuthEndpoint(
      "/customer/payments/list",
      {
        method: "GET",
        query: z
          .object({
            page: z.coerce.number().optional(),
            limit: z.coerce.number().optional(),
          })
          .optional(),
        use: [sessionMiddleware],
      },
      async (ctx) => {
        if (!ctx.context.session.user.id) {
          throw new APIError("BAD_REQUEST", {
            message: "User not found",
          });
        }

        try {
          // Find customer by email
          const customers = await dodopayments.customers.list({
            email: ctx.context.session?.user.email,
          });

          const customer = customers.items?.[0];

          if (!customer) {
            throw new APIError("BAD_REQUEST", {
              message: "Customer not found",
            });
          }

          const payments = await dodopayments.payments.list({
            customer_id: customer.customer_id,
          });

          return ctx.json(payments);
        } catch (e: unknown) {
          if (e instanceof Error) {
            ctx.context.logger.error(
              `Dodo Payments payments list failed. Error: ${e.message}`,
            );
          }

          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Payments list failed",
          });
        }
      },
    ),
  };
};

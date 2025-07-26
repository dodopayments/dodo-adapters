import type { DodoPayments } from "dodopayments";
import { APIError } from "better-auth/api";
import { sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { z } from "zod";

export const portal = () => (dodopayments: DodoPayments) => {
  return {
    portal: createAuthEndpoint(
      "/dodopayments/customer/portal",
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

        if (!ctx.context.session?.user.emailVerified) {
          throw new APIError("UNAUTHORIZED", {
            message: "User email not verified",
          });
        }

        try {
          const customers = await dodopayments.customers.list({
            email: ctx.context.session?.user.email,
          });
          const customer = customers.items[0];

          const customerSession =
            await dodopayments.customers.customerPortal.create(
              customer.customer_id,
            );

          return ctx.json({
            url: customerSession.link,
            redirect: true,
          });
        } catch (e: unknown) {
          if (e instanceof Error) {
            ctx.context.logger.error(
              `DodoPayments customer portal creation failed. Error: ${e.message}`,
            );
          }

          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Customer portal creation failed",
          });
        }
      },
    ),
    subscriptions: createAuthEndpoint(
      "/dodopayments/customer/subscriptions/list",
      {
        method: "GET",
        query: z
          .object({
            page: z.coerce.number().optional(),
            limit: z.coerce.number().optional(),
            status: z
              .enum([
                "active",
                "cancelled",
                "on_hold",
                "pending",
                "paused",
                "failed",
                "expired",
              ])
              .optional(),
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

        if (!ctx.context.session?.user.emailVerified) {
          throw new APIError("UNAUTHORIZED", {
            message: "User email not verified",
          });
        }

        try {
          const customers = await dodopayments.customers.list({
            email: ctx.context.session?.user.email,
          });
          const customer = customers.items[0];

          const subscriptions = await dodopayments.subscriptions.list({
            customer_id: customer.customer_id,
            // page number is 0-indexed
            page_number: ctx.query?.page ? ctx.query.page - 1 : undefined,
            page_size: ctx.query?.limit,
            status: ctx.query?.status,
          });

          return ctx.json({ items: subscriptions.items });
        } catch (e: unknown) {
          if (e instanceof Error) {
            ctx.context.logger.error(
              `DodoPayments subscriptions list failed. Error: ${e.message}`,
            );
          }

          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "DodoPayments subscriptions list failed",
          });
        }
      },
    ),
    payments: createAuthEndpoint(
      "/dodopayments/customer/payments/list",
      {
        method: "GET",
        query: z
          .object({
            page: z.coerce.number().optional(),
            limit: z.coerce.number().optional(),
            status: z
              .enum([
                "succeeded",
                "failed",
                "cancelled",
                "processing",
                "requires_customer_action",
                "requires_merchant_action",
                "requires_payment_method",
                "requires_confirmation",
                "requires_capture",
                "partially_captured",
                "partially_captured_and_capturable",
              ])
              .optional(),
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

        if (!ctx.context.session?.user.emailVerified) {
          throw new APIError("UNAUTHORIZED", {
            message: "User email not verified",
          });
        }

        try {
          const customers = await dodopayments.customers.list({
            email: ctx.context.session?.user.email,
          });
          const customer = customers.items[0];

          const payments = await dodopayments.payments.list({
            customer_id: customer.customer_id,
            // page number is 0-indexed
            page_number: ctx.query?.page ? ctx.query.page - 1 : undefined,
            page_size: ctx.query?.limit,
            status: ctx.query?.status,
          });

          return ctx.json({ items: payments.items });
        } catch (e: unknown) {
          if (e instanceof Error) {
            ctx.context.logger.error(
              `DodoPayments orders list failed. Error: ${e.message}`,
            );
          }

          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Orders list failed",
          });
        }
      },
    ),
  };
};

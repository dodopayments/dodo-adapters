import type { DodoPayments } from "dodopayments";
import { APIError, createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { z } from "zod/v3";
import {
  CustomerPortalResponse,
  PaymentItems,
  SubscriptionItems,
} from "../types";
import { getOrCreateCustomerId } from "../utils";

export const portal = () => (dodopayments: DodoPayments) => {
  return {
    dodoPortal: createAuthEndpoint(
      "/dodopayments/customer/portal",
      {
        method: "GET",
        use: [sessionMiddleware],
      },
      async (ctx): Promise<CustomerPortalResponse> => {
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
          const customerId = await getOrCreateCustomerId(
            dodopayments,
            ctx.context.session,
            ctx.context.internalAdapter,
          );

          const customerSession =
            await dodopayments.customers.customerPortal.create(customerId);

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
    dodoSubscriptions: createAuthEndpoint(
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
                "failed",
                "expired",
              ])
              .optional(),
          })
          .optional(),
        use: [sessionMiddleware],
      },
      async (ctx): Promise<SubscriptionItems> => {
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
          const customerId = await getOrCreateCustomerId(
            dodopayments,
            ctx.context.session,
            ctx.context.internalAdapter,
          );

          const subscriptions = await dodopayments.subscriptions.list({
            customer_id: customerId,
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
    dodoPayments: createAuthEndpoint(
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
      async (ctx): Promise<PaymentItems> => {
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
          const customerId = await getOrCreateCustomerId(
            dodopayments,
            ctx.context.session,
            ctx.context.internalAdapter,
          );

          const payments = await dodopayments.payments.list({
            customer_id: customerId,
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


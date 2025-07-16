import type DodoPayments from "dodopayments";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { z } from "zod";
import type { Product } from "../types";

export interface UsageOptions {
  /**
   * Products to use for topping up credits
   */
  creditProducts?: Product[] | (() => Promise<Product[]>);
}

export const usage =
  (_usageOptions?: UsageOptions) => (dodopayments: DodoPayments) => {
    return {
      subscriptions: createAuthEndpoint(
        "/usage/subscriptions/list",
        {
          method: "GET",
          use: [sessionMiddleware],
          query: z.object({
            page: z.coerce.number().optional(),
            limit: z.coerce.number().optional(),
          }),
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
      charge: createAuthEndpoint(
        "/usage/charge",
        {
          method: "POST",
          body: z.object({
            subscription_id: z.string(),
            product_price: z.number(),
          }),
          use: [sessionMiddleware],
        },
        async (ctx) => {
          if (!ctx.context.session.user.id) {
            throw new APIError("BAD_REQUEST", {
              message: "User not found",
            });
          }

          try {
            const charge = await dodopayments.subscriptions.charge(
              ctx.body.subscription_id,
              {
                product_price: ctx.body.product_price,
              },
            );

            return ctx.json(charge);
          } catch (e: unknown) {
            if (e instanceof Error) {
              ctx.context.logger.error(
                `Dodo Payments charge failed. Error: ${e.message}`,
              );
            }

            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Charge failed",
            });
          }
        },
      ),
    };
  };

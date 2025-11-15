import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import type { DodoPayments } from "dodopayments";
import {
  UsageEventIngestResponse,
  EventsDefaultPageNumberPagination,
} from "dodopayments/resources/usage-events.mjs";
import { z } from "zod/v3";

const EventInputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  metadata: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .nullable()
    .optional(),
  timestamp: z.string().datetime().optional(),
});

export const usage = () => (dodopayments: DodoPayments) => {
  return {
    // Ingest usage data
    dodoUsageIngest: createAuthEndpoint(
      "/dodopayments/usage/ingest",
      {
        method: "POST",
        body:EventInputSchema,
        use: [sessionMiddleware],
      },
      async (ctx): Promise<UsageEventIngestResponse> => {
        if (!ctx.context.session?.user?.id) {
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
            email: ctx.context.session.user.email,
          });

          let customer = customers.items[0];

          // upsert the customer, if they don't exist in DodoPayments
          if (!customer) {
            customer = await createCustomer(
              dodopayments,
              ctx.context.session.user.email,
              ctx.context.session.user.name,
            );
          }

          const result = await dodopayments.usageEvents.ingest({
            events: [
              {
                event_id: ctx.body.event_id,
                customer_id: customer.customer_id,
                event_name: ctx.body.event_name,
                timestamp: ctx.body.timestamp ?? new Date().toISOString(),
                metadata: ctx.body.metadata ?? {},
              },
            ],
          });

          return result;
        } catch (e: unknown) {
          if (e instanceof Error) {
            ctx.context.logger.error(
              `User usage ingestion error: ${e.message}`,
            );
          }

          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Failed to record the user usage",
          });
        }
      },
    ),

    // List usage meters
    dodoUsageMetersList: createAuthEndpoint(
      "/dodopayments/usage/meters/list",
      {
        method: "GET",
        query: z
          .object({
            page_number: z.coerce.number().optional(),
            page_size: z.coerce.number().optional(),
            event_name: z.string().optional(),
            meter_id: z.string().optional(),
            start: z.string().optional(),
            end: z.string().optional(),
          })
          .optional(),
        use: [sessionMiddleware],
      },
      async (ctx): Promise<EventsDefaultPageNumberPagination> => {
        if (!ctx.context.session?.user?.id) {
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
            email: ctx.context.session.user.email,
          });

          let customer = customers.items[0];

          // upsert the customer, if they don't exist in DodoPayments
          if (!customer) {
            customer = await createCustomer(
              dodopayments,
              ctx.context.session.user.email,
              ctx.context.session.user.name,
            );
          }

          const meters = await dodopayments.usageEvents.list({
            customer_id: customer.customer_id,
            ...ctx.query,
          });

          return meters;
        } catch (e: unknown) {
          if (e instanceof Error) {
            ctx.context.logger.error(
              `User usage meter list error: ${e.message}`,
            );
          }

          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: "Failed to fetch the user usage",
          });
        }
      },
    ),
  };
};

async function createCustomer(
  dodopayments: DodoPayments,
  email: string,
  name: string,
) {
  const customer = await dodopayments.customers.create({
    email,
    name,
  });

  return customer;
}

import { z } from "zod";
import type {
  UsagePluginConfig,
  UsagePlugin,
  DodoPluginContext,
} from "../types";
import { UnauthorizedError } from "../client";
import type DodoPayments from "dodopayments";

/**
 * Usage event schema
 */
const usageEventSchema = z.object({
  customer_id: z.string(),
  event_type: z.string(),
  quantity: z.number().optional().default(1),
  metadata: z.record(z.string()).optional(),
  timestamp: z.string().optional(),
});

/**
 * Creates a usage plugin for Dodo Payments usage-based billing
 * This is a placeholder implementation for future usage-based billing features
 */
export function usage(config: UsagePluginConfig = {}): UsagePlugin {
  return {
    id: "usage",
    config,
    endpoints: {
      "/usage/ingest": {
        method: "POST",
        handler: async (context: DodoPluginContext) => {
          const { request, client, user } = context;

          // Check authentication
          if (!user) {
            throw new UnauthorizedError("Authentication required");
          }

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
          const parseResult = usageEventSchema.safeParse(body);
          if (!parseResult.success) {
            return new Response(
              JSON.stringify({
                error: "Invalid parameters",
                details: parseResult.error.issues,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const { customer_id, event_type, quantity, metadata, timestamp } =
            parseResult.data;

          try {
            // TODO: Implement usage event ingestion
            // This would typically involve:
            // 1. Validating the customer exists
            // 2. Recording the usage event
            // 3. Updating metering data
            // 4. Triggering billing calculations if needed

            console.log("Usage event ingested:", {
              customer_id,
              event_type,
              quantity,
              metadata,
              timestamp,
            });

            // Placeholder response
            return new Response(
              JSON.stringify({
                message: "Usage event recorded successfully",
                event_id: `evt_${Date.now()}`,
                customer_id,
                event_type,
                quantity,
              }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          } catch (error) {
            console.error("Usage ingestion error:", error);
            return new Response(
              JSON.stringify({
                error: "Failed to ingest usage event",
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
 * Utility function to ingest usage events (for direct usage)
 */
export async function ingestUsageEvent(
  client: DodoPayments,
  customerId: string,
  eventType: string,
  quantity: number = 1,
  metadata?: Record<string, string>,
): Promise<void> {
  // TODO: Implement direct usage event ingestion
  // This would integrate with Dodo Payments' usage-based billing API
  console.log("Direct usage event ingestion:", {
    customerId,
    eventType,
    quantity,
    metadata,
  });
}

/**
 * Utility function to get customer usage metrics
 */
export async function getCustomerUsage(
  client: DodoPayments,
  customerId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    eventType?: string;
  },
): Promise<{
  customer_id: string;
  usage: any[];
  total_events: number;
  period: any;
}> {
  // TODO: Implement customer usage retrieval
  // This would integrate with Dodo Payments' usage metrics API
  console.log("Get customer usage:", {
    customerId,
    options,
  });

  return {
    customer_id: customerId,
    usage: [],
    total_events: 0,
    period: options,
  };
}

// Export usage as default
export { usage as default };

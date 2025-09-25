import type {
  CheckoutSessionPayload,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema
} from "@dodopayments/core/checkout";
import type { z } from "zod";

// Infer proper types from the schemas
type StaticCheckoutArgs = z.infer<typeof checkoutQuerySchema>;
type DynamicCheckoutArgs = z.infer<typeof dynamicCheckoutBodySchema>;
type CustomerPortalArgs = {
  customerId: string;
  send_email?: boolean;
};

export interface DodoPaymentsComponent {
  lib: {
    checkout: any;
    sessionCheckout: any;
    staticCheckout: any;
    dynamicCheckout: any;
    customerPortal: any;
  };
}

// The config required to initialize the Dodo Payments client.
export type DodoPaymentsClientConfig = {
  apiKey: string;
  environment: "test_mode" | "live_mode";
};

// This is the public-facing client that developers will use.
export class DodoPayments {
  public component: DodoPaymentsComponent;
  private config: DodoPaymentsClientConfig;

  constructor(component: DodoPaymentsComponent, config: DodoPaymentsClientConfig) {
    this.component = component;
    this.config = config;
  }

  /**
   * Returns the public API methods for the Dodo Payments client.
   */
  api() {
    return {
      /**
       * Creates a modern Dodo Payments checkout session (recommended).
       * Uses the new /session endpoint.
       */
      checkout: async (
        ctx: any,
        args: { payload: CheckoutSessionPayload },
      ) => {
        return await ctx.runAction(this.component.lib.checkout, {
          ...args,
          apiKey: this.config.apiKey,
          environment: this.config.environment,
        });
      },

      /**
       * Creates a modern Dodo Payments checkout session (recommended).
       * Uses the new /session endpoint.
       */
      sessionCheckout: async (
        ctx: any,
        args: { payload: CheckoutSessionPayload },
      ) => {
        return await ctx.runAction(this.component.lib.sessionCheckout, {
          ...args,
          apiKey: this.config.apiKey,
          environment: this.config.environment,
        });
      },

      /**
       * Creates a static checkout URL with query parameters.
       * Uses the legacy checkout URL format - simpler but less features.
       */
      staticCheckout: async (
        ctx: any,
        args: StaticCheckoutArgs,
      ) => {
        return await ctx.runAction(this.component.lib.staticCheckout, {
          ...args,
          apiKey: this.config.apiKey,
          environment: this.config.environment,
        });
      },

      /**
       * Creates a dynamic checkout using the payments/subscriptions API.
       * Uses API calls to create payment links - good for complex scenarios.
       */
      dynamicCheckout: async (
        ctx: any,
        args: DynamicCheckoutArgs,
      ) => {
        return await ctx.runAction(this.component.lib.dynamicCheckout, {
          ...args,
          apiKey: this.config.apiKey,
          environment: this.config.environment,
        });
      },

      /**
       * Retrieves a URL for the customer portal for a specific customer.
       * 
       * @param ctx - The Convex action context.
       * @param args - The arguments for the customer portal, including:
       *   - customerId: The ID of the customer (required).
       *   - send_email: Whether to send the URL via email (optional).
       */
      customerPortal: async (
        ctx: any,
        args: CustomerPortalArgs
      ) => {
        if (!args.customerId) {
          throw new Error("customerId is required for customerPortal.");
        }
        return await ctx.runAction(this.component.lib.customerPortal, {
          customerId: args.customerId,
          send_email: args?.send_email,
          apiKey: this.config.apiKey,
          environment: this.config.environment,
        });
      },
    };
  }
}

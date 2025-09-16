import type {
  CheckoutSessionPayload,
  checkoutQuerySchema,
  dynamicCheckoutBodySchema
} from "@dodopayments/core/checkout";
import type { z } from "zod";

import { GenericActionCtx } from "convex/server";

// Infer proper types from the schemas
type StaticCheckoutArgs = z.infer<typeof checkoutQuerySchema>;
type DynamicCheckoutArgs = z.infer<typeof dynamicCheckoutBodySchema>;
type CustomerPortalArgs = {
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
  identify: (ctx: GenericActionCtx<any>) => Promise<{ customerId: string; customerData?: any } | null>;
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
       * Uses the new /checkouts endpoint with full feature support.
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
       * Creates a modern Dodo Payments checkout session.
       * Alias for checkout() - uses the new /checkouts endpoint.
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
       * Retrieves a URL for the customer portal.
       * This function is designed to be called from a public Convex query in your app.
       */
      customerPortal: async (
        ctx: any,
        args?: CustomerPortalArgs
      ) => {
        const identity = await this.config.identify(ctx);
        if (!identity) {
          throw new Error("User is not authenticated.");
        }
        return await ctx.runAction(this.component.lib.customerPortal, {
          customerId: identity.customerId,
          send_email: args?.send_email,
          apiKey: this.config.apiKey,
          environment: this.config.environment,
        });
      },
    };
  }
}

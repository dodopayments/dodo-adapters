import type {
  CheckoutSessionPayload
} from "@dodopayments/core/checkout";

import { GenericActionCtx } from "convex/server";

type CustomerPortalArgs = {
  send_email?: boolean;
};

export interface DodoPaymentsComponent {
  lib: {
    checkout: any;
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
       * Creates a Dodo Payments checkout session.
       * Uses session checkout with full feature support.
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

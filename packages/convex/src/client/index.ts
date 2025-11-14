import type { CheckoutSessionPayload } from "@dodopayments/core/checkout";

import type {
  FunctionReference,
  GenericActionCtx,
  GenericDataModel,
} from "convex/server";

type CustomerPortalArgs = {
  send_email?: boolean;
};

// Context type for runAction
type RunActionCtx = {
  runAction: GenericActionCtx<GenericDataModel>["runAction"];
};

export interface DodoPaymentsComponent {
  lib: {
    checkout: FunctionReference<"action", "internal">;
    customerPortal: FunctionReference<"action", "internal">;
  };
}

// The config required to initialize the Dodo Payments client.
export type DodoPaymentsClientConfig = {
  identify: (
    ctx: GenericActionCtx<any>,
  ) => Promise<{ dodoCustomerId: string } | null>;
  apiKey: string;
  environment: "test_mode" | "live_mode";
};

// This is the public-facing client that developers will use.
export class DodoPayments {
  public component: DodoPaymentsComponent;
  private config: DodoPaymentsClientConfig;

  constructor(
    component: DodoPaymentsComponent,
    config: DodoPaymentsClientConfig,
  ) {
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
        ctx: RunActionCtx,
        args: { payload: CheckoutSessionPayload },
      ): Promise<{ checkout_url: string }> => {
        return await ctx.runAction(this.component.lib.checkout, {
          ...args,
          apiKey: this.config.apiKey,
          environment: this.config.environment,
        });
      },

      /**
       * Retrieves a URL for the customer portal.
       */
      customerPortal: async (
        ctx: any,
        args?: CustomerPortalArgs,
      ): Promise<{ portal_url: string }> => {
        const identity = await this.config.identify(ctx);
        if (!identity) {
          throw new Error("User is not authenticated.");
        }
        return await ctx.runAction(this.component.lib.customerPortal, {
          dodoCustomerId: identity.dodoCustomerId,
          send_email: args?.send_email,
          apiKey: this.config.apiKey,
          environment: this.config.environment,
        });
      },
    };
  }
}

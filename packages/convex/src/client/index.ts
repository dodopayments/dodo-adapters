// import type { ConvexReactClient } from "convex/react";
import type { CheckoutSessionPayload } from "@dodopayments/core/checkout";
import { buildCheckoutUrl } from "@dodopayments/core/checkout";
import DodoPaymentsSDK from "dodopayments";

// The config required to initialize the Dodo Payments client.
export type DodoPaymentsClientConfig = {
  identify: (ctx: any) => Promise<{ customerId: string; customerData?: any } | null>;
};

// This is the public-facing client that developers will use.
export class DodoPayments {
  private component: any;
  private config: DodoPaymentsClientConfig;

  constructor(component: any, config: DodoPaymentsClientConfig) {
    this.component = component;
    this.config = config;
  }

  private async callPaymentAPI(ctx: any, functionName: string, args: any) {
    const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
    const environment = process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode";

    if (!bearerToken || !environment) {
      throw new Error("Dodo Payments environment variables are not set in your Convex dashboard.");
    }

    switch (functionName) {
      case "checkout":
      case "sessionCheckout": {
        const checkoutUrl = await buildCheckoutUrl({
          sessionPayload: args,
          bearerToken,
          environment,
          type: "session",
        });
        return { checkout_url: checkoutUrl };
      }

      case "staticCheckout": {
        const checkoutUrl = await buildCheckoutUrl({
          queryParams: args,
          bearerToken,
          environment,
          type: "static",
        });
        return { checkout_url: checkoutUrl };
      }

      case "dynamicCheckout": {
        const checkoutUrl = await buildCheckoutUrl({
          body: args,
          bearerToken,
          environment,
          type: "dynamic",
        });
        return { checkout_url: checkoutUrl };
      }

      case "customerPortal": {
        const { customerId, send_email } = args as { 
          customerId: string; 
          send_email?: boolean;
        };
        if (!customerId) {
          throw new Error("customerId is required for customerPortal.");
        }
        const dodopaymentsSDK = new DodoPaymentsSDK({
          bearerToken,
          environment,
        });
        const params = {
          send_email: Boolean(send_email),
        };
        const session = await dodopaymentsSDK.customers.customerPortal.create(customerId, params);
        return { portal_url: session.link };
      }

      default: {
        throw new Error(`Unknown function call: ${functionName}`);
      }
    }
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
        // Here you could potentially merge identified customer data with the payload
        return this.callPaymentAPI(ctx, "sessionCheckout", args.payload);
      },

      /**
       * Creates a modern Dodo Payments checkout session.
       * Alias for checkout() - uses the new /checkouts endpoint.
       */
      sessionCheckout: async (
        ctx: any,
        args: { payload: CheckoutSessionPayload },
      ) => {
        return this.callPaymentAPI(ctx, "sessionCheckout", args.payload);
      },

      /**
       * Creates a static checkout URL with query parameters.
       * Uses the legacy checkout URL format - simpler but less features.
       */
      staticCheckout: async (
        ctx: any,
        args: { 
          productId: string;
          quantity?: string;
          returnUrl?: string;
          [key: string]: any; 
        },
      ) => {
        return this.callPaymentAPI(ctx, "staticCheckout", args);
      },

      /**
       * Creates a dynamic checkout using the payments/subscriptions API.
       * Uses API calls to create payment links - good for complex scenarios.
       */
      dynamicCheckout: async (
        ctx: any,
        args: {
          product_id?: string;
          product_cart?: Array<{ product_id: string; quantity: number }>;
          billing: {
            city: string;
            country: string;
            state: string;
            street: string;
            zipcode: string;
          };
          customer: {
            customer_id?: string;
            email?: string;
            name?: string;
          };
          [key: string]: any;
        },
      ) => {
        return this.callPaymentAPI(ctx, "dynamicCheckout", args);
      },

      /**
       * Retrieves a URL for the customer portal.
       * This function is designed to be called from a public Convex query in your app.
       */
      customerPortal: async (
        ctx: any, 
        args?: { send_email?: boolean }
      ) => {
        const identity = await this.config.identify(ctx);
        if (!identity) {
          throw new Error("User is not authenticated.");
        }
        return this.callPaymentAPI(ctx, "customerPortal", { 
            customerId: identity.customerId,
            send_email: args?.send_email,
          });
      },
    };
  }
}
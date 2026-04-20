/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    lib: {
      checkout: FunctionReference<
        "action",
        "internal",
        {
          apiKey: string;
          environment: "test_mode" | "live_mode";
          payload: {
            allowed_payment_method_types?: Array<string>;
            billing_address?: {
              city?: string;
              country: string;
              state?: string;
              street?: string;
              zipcode?: string;
            };
            billing_currency?: string;
            confirm?: boolean;
            customer?:
              | { email: string; name?: string; phone_number?: string }
              | { customer_id: string };
            customization?: {
              force_language?: string;
              show_on_demand_tag?: boolean;
              show_order_details?: boolean;
              theme?: string;
            };
            discount_code?: string;
            feature_flags?: {
              allow_currency_selection?: boolean;
              allow_discount_code?: boolean;
              allow_phone_number_collection?: boolean;
              allow_tax_id?: boolean;
              always_create_new_customer?: boolean;
            };
            force_3ds?: boolean;
            metadata?: Record<string, string>;
            product_cart: Array<{
              addons?: Array<{ addon_id: string; quantity: number }>;
              amount?: number;
              product_id: string;
              quantity: number;
            }>;
            return_url?: string;
            show_saved_payment_methods?: boolean;
            subscription_data?: {
              on_demand?: {
                adaptive_currency_fees_inclusive?: boolean;
                mandate_only: boolean;
                product_currency?: string;
                product_description?: string;
                product_price?: number;
              };
              trial_period_days?: number;
            };
          };
        },
        { checkout_url: string },
        Name
      >;
      customerPortal: FunctionReference<
        "action",
        "internal",
        {
          apiKey: string;
          dodoCustomerId: string;
          environment: "test_mode" | "live_mode";
          send_email?: boolean;
        },
        { portal_url: string },
        Name
      >;
    };
  };

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
            cancel_url?: string;
            confirm?: boolean;
            custom_fields?: Array<{
              field_type:
                | "text"
                | "number"
                | "email"
                | "url"
                | "date"
                | "dropdown"
                | "boolean";
              key: string;
              label: string;
              options?: Array<string>;
              placeholder?: string;
              required?: boolean;
            }>;
            customer?:
              | { email: string; name?: string; phone_number?: string }
              | { customer_id: string };
            customer_business_name?: string;
            customization?: {
              force_language?: string;
              show_on_demand_tag?: boolean;
              show_order_details?: boolean;
              theme?: string;
              theme_config?: {
                dark?: {
                  bg_primary?: string;
                  bg_secondary?: string;
                  border_primary?: string;
                  border_secondary?: string;
                  button_primary?: string;
                  button_primary_hover?: string;
                  button_secondary?: string;
                  button_secondary_hover?: string;
                  button_text_primary?: string;
                  button_text_secondary?: string;
                  input_focus_border?: string;
                  text_error?: string;
                  text_placeholder?: string;
                  text_primary?: string;
                  text_secondary?: string;
                  text_success?: string;
                };
                font_primary_url?: string;
                font_secondary_url?: string;
                font_size?: string;
                font_weight?: string;
                light?: {
                  bg_primary?: string;
                  bg_secondary?: string;
                  border_primary?: string;
                  border_secondary?: string;
                  button_primary?: string;
                  button_primary_hover?: string;
                  button_secondary?: string;
                  button_secondary_hover?: string;
                  button_text_primary?: string;
                  button_text_secondary?: string;
                  input_focus_border?: string;
                  text_error?: string;
                  text_placeholder?: string;
                  text_primary?: string;
                  text_secondary?: string;
                  text_success?: string;
                };
                pay_button_text?: string;
                radius?: string;
              };
            };
            discount_code?: string;
            discount_codes?: Array<string>;
            feature_flags?: {
              allow_currency_selection?: boolean;
              allow_customer_editing_business_name?: boolean;
              allow_customer_editing_city?: boolean;
              allow_customer_editing_country?: boolean;
              allow_customer_editing_email?: boolean;
              allow_customer_editing_name?: boolean;
              allow_customer_editing_state?: boolean;
              allow_customer_editing_street?: boolean;
              allow_customer_editing_tax_id?: boolean;
              allow_customer_editing_zipcode?: boolean;
              allow_discount_code?: boolean;
              allow_editing_addons?: boolean;
              allow_phone_number_collection?: boolean;
              allow_tax_id?: boolean;
              always_create_new_customer?: boolean;
              redirect_immediately?: boolean;
              require_phone_number?: boolean;
            };
            force_3ds?: boolean;
            mandate_min_amount_inr_paise?: number;
            metadata?: Record<string, string | number | boolean>;
            minimal_address?: boolean;
            payment_method_id?: string;
            product_cart: Array<{
              addons?: Array<{ addon_id: string; quantity: number }>;
              amount?: number;
              credit_entitlements?: Array<{
                credit_entitlement_id: string;
                credits_amount: string;
              }>;
              product_id: string;
              quantity: number;
            }>;
            product_collection_id?: string;
            return_url?: string;
            short_link?: boolean;
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
            tax_id?: string;
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

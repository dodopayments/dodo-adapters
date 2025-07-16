import type DodoPayments from "dodopayments";
import type { UnionToIntersection, User } from "better-auth";
import type { checkout } from "./plugins/checkout";
import type { portal } from "./plugins/portal";
import type { usage } from "./plugins/usage";
import type { webhooks } from "./plugins/webhooks";

export type Product = {
  /**
   * Product Id from DodoPayments Payments Product
   */
  productId: string;
  /**
   * Easily identifiable slug for the product
   */
  slug: string;
};

export type DodoPaymentsPlugin =
  | ReturnType<typeof checkout>
  | ReturnType<typeof usage>
  | ReturnType<typeof portal>
  | ReturnType<typeof webhooks>;

export type DodoPaymentsPlugins = [DodoPaymentsPlugin, ...DodoPaymentsPlugin[]];

export type DodoPaymentsEndpoints = UnionToIntersection<
  ReturnType<DodoPaymentsPlugin>
>;

export type DodoPaymentsPaymentsPlugin =
  | ReturnType<typeof checkout>
  | ReturnType<typeof usage>
  | ReturnType<typeof portal>
  | ReturnType<typeof webhooks>;

export interface DodoPaymentsOptions {
  /**
   * DodoPayments Payments Client
   */
  client: DodoPayments;
  /**
   * Enable customer creation when a user signs up
   */
  createCustomerOnSignUp?: boolean;
  /**
   * A custom function to get the customer create
   * params
   * @param data - data containing user and session
   * @returns
   */
  getCustomerCreateParams?: (
    data: {
      user: User;
    },
    request?: Request,
  ) => Promise<{
    metadata?: Record<string, string>;
  }>;
  /**
   * Use DodoPayments plugins
   */
  use: DodoPaymentsPlugins;
  /**
   * Mode for DodoPayments operations
   * - 'live_mode': Use live mode for production
   * - 'test_mode': Use test mode for development/testing
   * @default 'live_mode'
   */
  mode?: "live_mode" | "test_mode";
}

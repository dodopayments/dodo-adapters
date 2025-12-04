import type { DodoPayments } from "dodopayments";

import type { GenericEndpointContext, UnionToIntersection, User } from "better-auth";
import type { checkout } from "./plugins/checkout";
import type { portal } from "./plugins/portal";
import type { webhooks } from "./plugins/webhooks";
import { usage } from "./plugins/usage";

export type Product = {
  /**
   * Product Id from DodoPayments Product
   */
  productId: string;
  /**
   * Easily identifiable slug for the product
   */
  slug: string;
};

export type DodoPaymentsPlugin =
  | ReturnType<typeof checkout>
  | ReturnType<typeof portal>
  | ReturnType<typeof webhooks>
  | ReturnType<typeof usage>;

export type DodoPaymentsPlugins = [DodoPaymentsPlugin, ...DodoPaymentsPlugin[]];

export type DodoPaymentsEndpoints = UnionToIntersection<
  ReturnType<DodoPaymentsPlugin>
>;

export interface DodoPaymentsOptions {
  /**
   * DodoPayments Client
   */
  client: DodoPayments;
  /**
   * Enable customer creation when a user signs up
   */
  createCustomerOnSignUp?: boolean;
  /**
	 * A callback to run after a customer has been created
	 * @param customer - Customer Data
	 * @param DodoCustomer - DodoPayments Customer Data
	 * @returns
	 */
  onCustomerCreate?:
		| ((
				data: {
					DodoCustomer: DodoPayments.Customer;
					user: User & { DodoPaymentsCustomerId: string };
				},
				ctx: GenericEndpointContext,
		  ) => Promise<void>)
		| undefined;
  /**
	 * A callback to run after a customer has been updated
	 * @param customer - Customer Data
	 * @param DodoCustomer - DodoPayments Customer Data
	 * @returns
	 */
  onCustomerUpdate?:
		| ((
				data: {
					DodoCustomer: DodoPayments.Customer;
					user: User & { DodoPaymentsCustomerId: string };
				},
				ctx: GenericEndpointContext,
		  ) => Promise<void>)
		| undefined;
  /**
   * Use DodoPayments plugins
   */
  use: DodoPaymentsPlugins;
}

type PaymentsList = Awaited<ReturnType<DodoPayments["payments"]["list"]>>;
type SubscriptionsList = Awaited<
  ReturnType<DodoPayments["subscriptions"]["list"]>
>;
export type PaymentItems = { items: PaymentsList["items"] };
export type SubscriptionItems = { items: SubscriptionsList["items"] };
export type CustomerPortalResponse = { url: string; redirect: boolean };
export type CreateCheckoutResponse = { url: string; redirect: boolean };
export type WebhookResponse = { received: boolean };

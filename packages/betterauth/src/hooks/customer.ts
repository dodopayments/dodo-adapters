import type { GenericEndpointContext, User } from "better-auth";
import { APIError } from "better-auth/api";
import type { DodoPaymentsOptions } from "../types";

export const onUserCreate =
  (options: DodoPaymentsOptions) =>
  async (user: User, ctx: GenericEndpointContext | null) => {
    if (ctx && options.createCustomerOnSignUp) {
      try {
        const customers = await options.client.customers.list({
          email: user.email,
        });
        const existingCustomer = customers.items[0];

        if (existingCustomer) {
          await options.client.customers.update(existingCustomer.customer_id, {
            name: user.name,
          });
        } else {
          // TODO: Add metadata to customer object via
          // getCustomerCreateParams option when it becomes
          // available in the API
          await options.client.customers.create({
            email: user.email,
            name: user.name,
          });
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: `DodoPayments customer creation failed. Error: ${e.message}`,
          });
        }

        throw new APIError("INTERNAL_SERVER_ERROR", {
          message: `DodoPayments customer creation failed. Error: ${e}`,
        });
      }
    }
  };

export const onUserUpdate =
  (options: DodoPaymentsOptions) =>
  async (user: User, ctx: GenericEndpointContext | null) => {
    if (ctx && options.createCustomerOnSignUp) {
      try {
        const customers = await options.client.customers.list({
          email: user.email,
        });
        const existingCustomer = customers.items[0];

        if (existingCustomer) {
          // TODO: Add metadata to customer object via
          // getCustomerCreateParams option when it becomes
          // available in the API
          await options.client.customers.update(existingCustomer.customer_id, {
            name: user.name,
          });
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          ctx.context.logger.error(
            `DodoPayments customer update failed. Error: ${e.message}`,
          );
        } else {
          ctx.context.logger.error(
            `DodoPayments customer update failed. Error: ${e}`,
          );
        }
      }
    }
  };

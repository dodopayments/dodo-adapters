import type { GenericEndpointContext, User } from "better-auth";
import { APIError } from "better-auth/api";
import type { DodoPaymentsOptions } from "../types";

export const onUserCreate =
  (options: DodoPaymentsOptions) =>
  async (user: User, ctx?: GenericEndpointContext) => {
    if (ctx && options.createCustomerOnSignUp) {
      try {
        const params = options.getCustomerCreateParams
          ? await options.getCustomerCreateParams({
              user,
            })
          : {};

        // Check if customer already exists by email
        const existingCustomers = await options.client.customers.list({
          email: user.email,
        });

        const existingCustomer = existingCustomers.items?.[0];

        if (existingCustomer) {
          // Update existing customer if needed
          await options.client.customers.update(existingCustomer.customer_id, {
            name: user.name,
            ...params,
          });
        } else {
          // Create new customer (Dodo Payments will generate its own customer_id)
          const customer = await options.client.customers.create({
            email: user.email,
            name: user.name,
            ...params,
          });

          console.log("Customer created:", customer);
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: `Dodo Payments customer creation failed. Error: ${e.message}`,
          });
        }

        throw new APIError("INTERNAL_SERVER_ERROR", {
          message: `Dodo Payments customer creation failed. Error: ${e}`,
        });
      }
    }
  };;;

export const onUserUpdate =
  (options: DodoPaymentsOptions) =>
  async (user: User, ctx?: GenericEndpointContext) => {
    if (ctx && options.createCustomerOnSignUp) {
      try {
        // Find customer by email and update
        const customers = await options.client.customers.list({
          email: user.email,
        });

        const customer = customers.items?.[0];

        if (customer) {
          await options.client.customers.update(customer.customer_id, {
            name: user.name,
          });
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          ctx.context.logger.error(
            `Dodo Payments customer update failed. Error: ${e.message}`,
          );
        } else {
          ctx.context.logger.error(
            `Dodo Payments customer update failed. Error: ${e}`,
          );
        }
      }
    }
  };;;

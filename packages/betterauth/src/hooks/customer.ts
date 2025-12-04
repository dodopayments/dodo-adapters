import type { GenericEndpointContext, User } from "better-auth";
import { APIError } from "better-auth/api";
import type { DodoPaymentsOptions } from "../types";
import { DodoPayments } from 'dodopayments';

export const onUserCreate =
  (options: DodoPaymentsOptions) =>
  async (user: User, ctx?: GenericEndpointContext) => {
    if (ctx && options.createCustomerOnSignUp) {
      try {
        const customers = await options.client.customers.list({
          email: user.email,
        });
        const existingCustomer = customers.items[0];

        let dodoCustomer: DodoPayments.Customer | undefined;
        if (existingCustomer) {
          if (existingCustomer.email !== user.email) {
            dodoCustomer = await options.client.customers.update(
              existingCustomer.customer_id,
              {
                name: user.name,
              },
            );
          } else {
            dodoCustomer = existingCustomer;
          }
        } else {
          // TODO: Add metadata to customer object via
          // getCustomerCreateParams option when it becomes
          // available in the API
          dodoCustomer = await options.client.customers.create({
            email: user.email,
            name: user.name,
          });
        }

        // Call the onCustomerCreate callback if provided
        if (options.onCustomerCreate && dodoCustomer) {
          await options.onCustomerCreate(
            {
              DodoCustomer: dodoCustomer,
              user: {
                ...user,
                DodoPaymentsCustomerId: dodoCustomer.customer_id,
              },
            },
            ctx,
          );
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
  async (user: User, ctx?: GenericEndpointContext) => {
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
          const updatedCustomer = await options.client.customers.update(
            existingCustomer.customer_id,
            {
              name: user.name,
            },
          );

          // Call the onCustomerUpdate callback if provided
          if (options.onCustomerUpdate && updatedCustomer) {
            await options.onCustomerUpdate(
              {
                DodoCustomer: updatedCustomer,
                user: {
                  ...user,
                  DodoPaymentsCustomerId: updatedCustomer.customer_id,
                },
              },
              ctx,
            );
          }
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

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

        let customerId: string;

        const additionalParams = options.getCustomerParams
          ? await options.getCustomerParams(user)
          : {};

        if (existingCustomer) {
          await options.client.customers.update(existingCustomer.customer_id, {
            name: user.name,
            ...additionalParams,
          });
          customerId = existingCustomer.customer_id;
        } else {
          const newCustomer = await options.client.customers.create({
            email: user.email,
            name: user.name,
            ...additionalParams,
          }, { idempotencyKey: user.id });
          customerId = newCustomer.customer_id;
        }

        ctx.context.internalAdapter.updateUser(user.id, {
          dodoCustomerId: customerId,
        }).catch((e: unknown) => {
          ctx.context.logger.warn(
            `DodoPayments: failed to store dodoCustomerId for user ${user.id}. Error: ${e instanceof Error ? e.message : e}`,
          );
        });
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
          const additionalParams = options.getCustomerParams
            ? await options.getCustomerParams(user)
            : {};

          await options.client.customers.update(existingCustomer.customer_id, {
            name: user.name,
            ...additionalParams,
          });

          // Backfill dodoCustomerId if it doesn't exist
          if (!(user as User & { dodoCustomerId?: string }).dodoCustomerId) {
            ctx.context.internalAdapter.updateUser(user.id, {
              dodoCustomerId: existingCustomer.customer_id,
            }).catch((e: unknown) => {
              ctx.context.logger.warn(
                `DodoPayments: failed to backfill dodoCustomerId for user ${user.id}. Error: ${e instanceof Error ? e.message : e}`,
              );
            });
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

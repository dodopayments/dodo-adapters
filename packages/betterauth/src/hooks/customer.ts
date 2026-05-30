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
          : undefined;

        if (existingCustomer) {
          await options.client.customers.update(existingCustomer.customer_id, {
            name: user.name,
            metadata: additionalParams?.metadata,
            phone_number: additionalParams?.phone_number,
          });
          customerId = existingCustomer.customer_id;
        } else {
          const newCustomer = await options.client.customers.create({
            email: user.email,
            name: user.name,
            metadata: additionalParams?.metadata,
            phone_number: additionalParams?.phone_number,
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
        let customerId = (user as User & { dodoCustomerId?: string }).dodoCustomerId;

        if (!customerId) {
          // Fallback to email lookup if dodoCustomerId is not stored yet
          const customers = await options.client.customers.list({
            email: user.email,
          });
          const existingCustomer = customers.items[0];

          if (!existingCustomer) return;

          customerId = existingCustomer.customer_id;

          // Backfill dodoCustomerId
          ctx.context.internalAdapter.updateUser(user.id, {
            dodoCustomerId: customerId,
          }).catch((e: unknown) => {
            ctx.context.logger.warn(
              `DodoPayments: failed to backfill dodoCustomerId for user ${user.id}. Error: ${e instanceof Error ? e.message : e}`,
            );
          });
        }

        const additionalParams = options.getCustomerParams
          ? await options.getCustomerParams(user)
          : undefined;

        await options.client.customers.update(customerId, {
          name: user.name,
          metadata: additionalParams?.metadata,
          phone_number: additionalParams?.phone_number,
        });
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

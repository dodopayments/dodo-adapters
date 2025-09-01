import type { BetterAuthPlugin } from "better-auth";
import { onUserCreate, onUserUpdate } from "./hooks/customer";
import type { DodoPaymentsEndpoints, DodoPaymentsOptions } from "./types";

export { dodopaymentsClient } from "./client";

export { portal } from "./plugins/portal";
export { checkout, CheckoutOptions } from "./plugins/checkout";
export { webhooks } from "./plugins/webhooks";

export const dodopayments = (options: DodoPaymentsOptions) => {
  const plugins = options.use
    .map((use) => use(options.client))
    .reduce((acc, plugin) => {
      Object.assign(acc, plugin);
      return acc;
    }, {} as DodoPaymentsEndpoints);

  return {
    id: "dodopayments",
    endpoints: {
      ...plugins,
    },
    init() {
      return {
        options: {
          databaseHooks: {
            user: {
              create: {
                after: onUserCreate(options),
              },
              update: {
                after: onUserUpdate(options),
              },
            },
          },
        },
      };
    },
  } satisfies BetterAuthPlugin;
};

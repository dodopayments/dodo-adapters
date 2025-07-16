import type { BetterAuthPlugin } from "better-auth";
import { onUserCreate, onUserUpdate } from "./hooks/customer";
import type { DodoPaymentsEndpoints, DodoPaymentsOptions } from "./types";

export { dodoPaymentsClient } from "./client";

export * from "./plugins/portal";
export * from "./plugins/checkout";
export * from "./plugins/usage";
export * from "./plugins/webhooks";

export const dodopayments = <O extends DodoPaymentsOptions>(options: O) => {
  // Set environment based on mode
  if (options.mode) {
    options.client.baseURL =
      options.mode === "test_mode"
        ? "https://test.dodopayments.com"
        : "https://live.dodopayments.com";
  }

  const plugins = options.use
    .map((use) => use(options.client))
    .reduce((acc, plugin) => {
      Object.assign(acc, plugin);
      return acc;
    }, {}) as DodoPaymentsEndpoints;

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

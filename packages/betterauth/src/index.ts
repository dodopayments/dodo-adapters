import type {
  DodoOptions,
  DodoEndpoints,
  BetterAuthPlugin,
  DodoPlugin,
} from "./types";
import { getOrCreateCustomer } from "./client";
import type DodoPayments from "dodopayments";

/**
 * Main Dodo BetterAuth plugin function
 * Creates a BetterAuth plugin that integrates Dodo Payments functionality
 */
export function dodo<O extends DodoOptions>(options: O) {
  const {
    client,
    createCustomerOnSignUp,
    getCustomerCreateParams,
    use: plugins,
    environment,
    webhookSecret,
  } = options;

  // Compose all plugin endpoints similar to Polar's approach
  const pluginEndpoints = plugins.reduce((acc, plugin) => {
    return { ...acc, ...plugin.endpoints };
  }, {} as DodoEndpoints);

  // Transform plugin endpoints to Better Auth endpoints with enhanced context
  const endpoints = Object.entries(pluginEndpoints).reduce(
    (acc, [path, config]) => {
      acc[path] = {
        method: config.method,
        handler: async (context: any) => {
          // Add Dodo-specific context similar to Polar's approach
          const enhancedContext = {
            ...context,
            client,
            environment,
            webhookSecret,
          };

          // Call the plugin handler
          return await config.handler(enhancedContext);
        },
      };
      return acc;
    },
    {} as any,
  );

  return {
    id: "dodo",
    endpoints,
    init: (betterAuthInstance: any) => {
      // Set up database hooks if customer creation is enabled
      if (createCustomerOnSignUp) {
        // Hook into user creation - similar to Polar's approach
        const onUserCreate = async (user: any) => {
          try {
            // Get customer creation parameters
            let customerParams = {};
            if (getCustomerCreateParams) {
              customerParams = await getCustomerCreateParams(user);
            }

            // Create customer in Dodo Payments
            const customer = await getOrCreateCustomer(
              client,
              user.id,
              customerParams,
            );

            console.log("Created Dodo customer for user:", user.id, customer);
          } catch (error) {
            console.error("Failed to create Dodo customer:", error);
            // Don't throw error to avoid breaking user creation
          }
        };

        // Hook into user updates
        const onUserUpdate = async (user: any) => {
          try {
            // Update customer in Dodo Payments if needed
            console.log(
              "User updated, considering Dodo customer sync:",
              user.id,
            );
          } catch (error) {
            console.error("Failed to sync user update to Dodo:", error);
          }
        };

        // Register the hooks
        betterAuthInstance.hooks = betterAuthInstance.hooks || {};
        betterAuthInstance.hooks.user = betterAuthInstance.hooks.user || {};
        betterAuthInstance.hooks.user.onCreate = onUserCreate;
        betterAuthInstance.hooks.user.onUpdate = onUserUpdate;
      }
    },
  } satisfies BetterAuthPlugin;
}

// Export individual plugins for direct use
export { checkout, dynamicCheckout } from "./plugins/checkout";
export { portal } from "./plugins/portal";
export { webhooks } from "./plugins/webhooks";
export { usage } from "./plugins/usage";

// Export types
export type {
  DodoOptions,
  DodoPlugin,
  DodoEndpoints,
  CheckoutPluginConfig,
  PortalPluginConfig,
  WebhooksPluginConfig,
  UsagePluginConfig,
  Product,
  CustomerCreateParams,
} from "./types";

// Export client utilities
export {
  getOrCreateCustomer,
  createCustomerPortalSession,
  getCustomerSubscriptions,
  getCustomerOrders,
  DodoAuthError,
  ProductNotFoundError,
  CustomerNotFoundError,
  UnauthorizedError,
} from "./client";

// Export default
export { dodo as default };

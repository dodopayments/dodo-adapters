import type { z } from "zod";
import type DodoPayments from "dodopayments";
import type {
  WebhookEventHandlers,
  WebhookPayload,
} from "@dodopayments/core/webhook";

/**
 * Better Auth context types - based on Better Auth documentation
 */
export interface BetterAuthContext {
  appName: string;
  options: any;
  tables: any;
  baseURL: string;
  session: any;
  secret: string;
  authCookie: any;
  logger: any;
  db: any;
  adapter: any;
  internalAdapter: any;
}

/**
 * Better Auth endpoint handler context
 */
export interface BetterAuthEndpointContext {
  request: Request;
  context: BetterAuthContext;
  json: (data: any) => Response;
  text: (text: string) => Response;
  redirect: (url: string) => Response;
  headers: Headers;
  query: Record<string, string | undefined>;
  params: Record<string, string | undefined>;
}

/**
 * Extended context for Dodo plugins
 */
export interface DodoPluginContext extends BetterAuthEndpointContext {
  client: DodoPayments;
  user?: any;
}

/**
 * Webhook-specific context
 */
export interface WebhookContext {
  request: Request;
  webhookSecret: string;
  context: BetterAuthContext;
  json: (data: any) => Response;
  text: (text: string) => Response;
  headers: Headers;
}
/**
 * Product definition for checkout
 */
export type Product = {
  productId: string; // Dodo Product ID
  slug: string; // Easily identifiable product name
};

/**
 * Checkout plugin configuration
 */
export interface CheckoutPluginConfig {
  products?: Product[];
  successUrl?: string;
  requireAuth?: boolean;
  theme?: "light" | "dark";
  environment?: "test_mode" | "live_mode";
}

/**
 * Portal plugin configuration
 */
export interface PortalPluginConfig {
  // Optional configuration for portal behavior
  redirectUrl?: string;
  theme?: "light" | "dark";
}

/**
 * Webhooks plugin configuration - use the proper types from core
 */
export interface WebhooksPluginConfig extends WebhookEventHandlers {
  // Inherit all properly typed webhook event handlers from core
}

/**
 * Usage plugin configuration (placeholder)
 */
export interface UsagePluginConfig {
  // Future: usage-based billing configuration
  enableMetering?: boolean;
  meterEvents?: string[];
}

/**
 * Individual plugin return types
 */
export interface CheckoutPlugin {
  id: "checkout";
  endpoints: {
    "/checkout": {
      method: "GET" | "POST";
      handler: (context: DodoPluginContext) => Promise<Response>;
    };
  };
  config: CheckoutPluginConfig;
}

export interface PortalPlugin {
  id: "portal";
  endpoints: {
    "/customer/portal": {
      method: "GET";
      handler: (context: DodoPluginContext) => Promise<Response>;
    };
    "/customer/state": {
      method: "GET";
      handler: (context: DodoPluginContext) => Promise<Response>;
    };
    "/customer/subscriptions/list": {
      method: "GET";
      handler: (context: DodoPluginContext) => Promise<Response>;
    };
    "/customer/orders/list": {
      method: "GET";
      handler: (context: DodoPluginContext) => Promise<Response>;
    };
  };
  config: PortalPluginConfig;
}

export interface WebhooksPlugin {
  id: "webhooks";
  endpoints: {
    "/webhooks/dodo": {
      method: "POST";
      handler: (context: WebhookContext) => Promise<Response>;
    };
  };
  config: WebhooksPluginConfig;
}

export interface UsagePlugin {
  id: "usage";
  endpoints: {
    "/usage/ingest": {
      method: "POST";
      handler: (context: DodoPluginContext) => Promise<Response>;
    };
  };
  config: UsagePluginConfig;
}

/**
 * Union type of all possible plugins
 */
export type DodoPlugin =
  | CheckoutPlugin
  | PortalPlugin
  | WebhooksPlugin
  | UsagePlugin;

/**
 * Array of plugins with at least one plugin
 */
export type DodoPlugins = [DodoPlugin, ...DodoPlugin[]];

/**
 * Intersection of all plugin endpoint types
 */
export type DodoEndpoints = CheckoutPlugin["endpoints"] &
  PortalPlugin["endpoints"] &
  WebhooksPlugin["endpoints"] &
  UsagePlugin["endpoints"];

/**
 * Customer creation parameters
 */
export interface CustomerCreateParams {
  external_id?: string;
  email?: string;
  name?: string;
  phone?: string;
  address?: {
    city?: string;
    country?: string;
    line1?: string;
    line2?: string;
    postal_code?: string;
    state?: string;
  };
  metadata?: Record<string, string>;
}

/**
 * Main Dodo configuration options
 */
export interface DodoOptions {
  /**
   * Dodo Payments client instance
   */
  client: DodoPayments;

  /**
   * Automatically create customer on sign up
   */
  createCustomerOnSignUp?: boolean;

  /**
   * Custom function to generate customer creation parameters
   */
  getCustomerCreateParams?: (
    user: any,
  ) => CustomerCreateParams | Promise<CustomerCreateParams>;

  /**
   * Array of plugins to use
   */
  use: DodoPlugins;

  /**
   * Environment (test_mode or live_mode)
   */
  environment?: "test_mode" | "live_mode";

  /**
   * Webhook secret for signature verification
   */
  webhookSecret?: string;
}

/**
 * Better Auth plugin return type
 */
export interface BetterAuthPlugin {
  id: "dodo";
  endpoints: DodoEndpoints;
  init?: (options: any) => void;
}

/**
 * Utility type for resolving intersections
 */
export type Resolve<T> = T extends (...args: any[]) => any
  ? T
  : { [K in keyof T]: T[K] };

import type DodoPayments from "dodopayments";
import type { CustomerCreateParams } from "./types";

/**
 * Utility function to get or create a customer
 */
export async function getOrCreateCustomer(
  client: DodoPayments,
  userId: string,
  params?: CustomerCreateParams,
): Promise<DodoPayments.Customer> {
  try {
    // Try to find existing customer by external_id
    const customers = await client.customers.list();

    if (customers.items && customers.items.length > 0) {
      // Find customer by external_id (filter client-side since API doesn't support it)
      const existingCustomer = customers.items.find(
        (c) => (c as any).external_id === userId,
      );
      if (existingCustomer) {
        return existingCustomer;
      }
    }
  } catch (error) {
    // Customer not found, will create new one
  }

  // Create new customer
  const customerParams = {
    external_id: userId,
    ...params,
  };

  return await client.customers.create(customerParams as any);
}

/**
 * Utility function to create a customer portal session
 */
export async function createCustomerPortalSession(
  client: DodoPayments,
  customerId: string,
  returnUrl?: string,
): Promise<DodoPayments.CustomerPortalSession> {
  const sessionParams: any = {};

  if (returnUrl) {
    sessionParams.return_url = returnUrl;
  }

  return await client.customers.customerPortal.create(
    customerId,
    sessionParams,
  );
}

/**
 * Utility function to get customer subscriptions
 */
export async function getCustomerSubscriptions(
  client: DodoPayments,
  customerId: string,
  options?: {
    status?: string;
    limit?: number;
    page?: number;
  },
): Promise<any> {
  const params: any = {
    customer_id: customerId,
    ...options,
  };

  return await client.subscriptions.list(params);
}

/**
 * Utility function to get customer orders/payments
 */
export async function getCustomerOrders(
  client: DodoPayments,
  customerId: string,
  options?: {
    status?: string;
    limit?: number;
    page?: number;
  },
): Promise<any> {
  const params: any = {
    customer_id: customerId,
    ...options,
  };

  return await client.payments.list(params);
}

/**
 * Utility function to find product by slug
 */
export async function findProductBySlug(
  client: DodoPayments,
  slug: string,
): Promise<any> {
  // Note: This would need to be implemented based on Dodo's product API
  // For now, we'll assume productId is used directly
  throw new Error("Product lookup by slug not yet implemented");
}

/**
 * Error classes for better error handling
 */
export class DodoAuthError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "DodoAuthError";
  }
}

export class ProductNotFoundError extends DodoAuthError {
  constructor(productId: string) {
    super(`Product with ID ${productId} not found`, "PRODUCT_NOT_FOUND");
  }
}

export class CustomerNotFoundError extends DodoAuthError {
  constructor(customerId: string) {
    super(`Customer with ID ${customerId} not found`, "CUSTOMER_NOT_FOUND");
  }
}

export class UnauthorizedError extends DodoAuthError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED");
  }
}

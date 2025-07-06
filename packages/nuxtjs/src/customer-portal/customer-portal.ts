import { H3Event, sendRedirect, createError } from "h3";
import DodoPayments, { type ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
> & {
  getCustomerId: (event: H3Event) => Promise<string>;
};

export const CustomerPortal = ({
  bearerToken,
  environment,
  getCustomerId,
}: CustomerPortalConfig) => {
  const handler = async (event: H3Event) => {
    const customerId = await getCustomerId(event);

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session =
        await dodopayments.customers.customerPortal.create(customerId);
      return sendRedirect(event, session.link);
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create customer portal session: ${error.message}`,
      });
    }
  };

  return handler;
};

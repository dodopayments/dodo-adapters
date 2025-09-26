import DodoPayments, { ClientOptions } from "dodopayments";
import { getQuery, sendRedirect, H3Event } from "h3";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

export function customerPortalHandler(config: CustomerPortalConfig) {
  return async (event: H3Event) => {
    const query = getQuery(event);
    const customerId = query.customer_id as string | undefined;
    const sendEmail = query.send_email === "true";
    const params = { send_email: sendEmail };

    if (!customerId) {
      return { status: 400, body: "Missing customer_id in query parameters" };
    }

    const dodopayments = new DodoPayments({
      bearerToken: config.bearerToken,
      environment: config.environment,
    });

    try {
      const session = await dodopayments.customers.customerPortal.create(
        customerId,
        params,
      );
      return sendRedirect(event, session.link, 302);
    } catch (error: any) {
      return {
        status: 500,
        body: `Failed to create customer portal session: ${error.message}`,
      };
    }
  };
}

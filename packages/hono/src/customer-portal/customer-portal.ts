import { Context } from "hono";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

export const CustomerPortal = ({
  bearerToken,
  environment,
}: CustomerPortalConfig) => {
  const getHandler = async (c: Context) => {
    // Extract customerId from query parameters
    const customerId = c.req.query("customer_id");
    const sendEmail = c.req.query("send_email");

    const params = {
      send_email: false,
    };

    if (sendEmail === "true") {
      params.send_email = true;
    }

    if (!customerId) {
      return c.text("Missing customerId in query parameters", 400);
    }

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session = await dodopayments.customers.customerPortal.create(
        customerId,
        params,
      );
      return c.redirect(session.link);
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      return c.text(
        `Failed to create customer portal session: ${error.message}`,
        500,
      );
    }
  };

  return getHandler;
};

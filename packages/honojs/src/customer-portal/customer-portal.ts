import { Context } from "hono";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
> & {
  getCustomerId: (c: Context) => Promise<string>;
};

export const CustomerPortal = ({
  bearerToken,
  environment,
  getCustomerId,
}: CustomerPortalConfig) => {
  const honoHandler = async (c: Context) => {
    const customerId = await getCustomerId(c);

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session =
        await dodopayments.customers.customerPortal.create(customerId);
      return c.redirect(session.link);
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      return c.text(
        `Failed to create customer portal session: ${error.message}`,
        500,
      );
    }
  };

  return honoHandler;
};

import { Request, Response } from "express";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

export const CustomerPortal = ({
  bearerToken,
  environment,
}: CustomerPortalConfig) => {
  const getHandler = async (req: Request, res: Response) => {
    // Extract customerId from query parameters
    const { customer_id: customerId, send_email } = req.query;

    // Normalize customer_id to string (handle array case)
    const customerIdValue: string | undefined = customerId
      ? Array.isArray(customerId)
        ? String(customerId[0])
        : String(customerId)
      : undefined;

    const params: { send_email?: boolean } = {};
    if (send_email !== undefined) {
      // Normalize to string (handle array case)
      const sendEmailValue = Array.isArray(send_email) ? send_email[0] : send_email;
      params.send_email = sendEmailValue === "true";
    }

    if (!customerIdValue) {
      return res.status(400).send("Missing customerId in query parameters");
    }

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session = await dodopayments.customers.customerPortal.create(
        customerIdValue,
        params,
      );
      return res.redirect(session.link);
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      return res
        .status(500)
        .send(`Failed to create customer portal session: ${error.message}`);
    }
  };

  return getHandler;
};

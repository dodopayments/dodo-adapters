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

    const params = {
      send_email: false,
    };
    const sendEmail = Boolean(send_email);
    if (sendEmail) {
      params.send_email = sendEmail;
    }

    if (!customerId) {
      return res.status(400).send("Missing customerId in query parameters");
    }

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session = await dodopayments.customers.customerPortal.create(
        customerId as string,
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

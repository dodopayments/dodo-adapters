import { Request, Response } from "express";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
> & {
  getCustomerId: (req: Request) => Promise<string>;
};

export const CustomerPortal = ({
  bearerToken,
  environment,
  getCustomerId,
}: CustomerPortalConfig) => {
  const getHandler = async (req: Request, res: Response) => {
    const customerId = await getCustomerId(req);

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session =
        await dodopayments.customers.customerPortal.create(customerId);
      res.redirect(session.link);
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      res
        .status(500)
        .send(`Failed to create customer portal session: ${error.message}`);
    }
  };

  return getHandler;
};

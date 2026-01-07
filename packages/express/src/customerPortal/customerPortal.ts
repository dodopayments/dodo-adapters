import { Request, Response } from "express";
import DodoPayments, { ClientOptions } from "dodopayments";
import type { ParsedQs } from "qs";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

// Helper to extract a string value from Express query params
const getQueryString = (
  value: string | ParsedQs | (string | ParsedQs)[] | undefined,
): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }
  return undefined;
};

export const CustomerPortal = ({
  bearerToken,
  environment,
}: CustomerPortalConfig) => {
  const getHandler = async (req: Request, res: Response) => {
    // Extract customerId from query parameters
    const { customer_id: customerId, send_email } = req.query;

    // Normalize customer_id to string
    const customerIdValue = getQueryString(customerId);

    const params: { send_email?: boolean } = {};
    if (send_email !== undefined) {
      // Normalize to string
      const sendEmailValue = Array.isArray(send_email)
        ? send_email[0]
        : send_email;
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

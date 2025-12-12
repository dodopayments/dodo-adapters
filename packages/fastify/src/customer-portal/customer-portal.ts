import { FastifyRequest, FastifyReply } from "fastify";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

export const CustomerPortal = ({
  bearerToken,
  environment,
}: CustomerPortalConfig) => {
  const getHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    // Extract customerId from query parameters
    const { customer_id: customerId, send_email } = request.query as Record<
      string,
      string | string[]
    >;

    // Normalize customer_id to string (handle array case)
    const customerIdValue: string | undefined = customerId
      ? Array.isArray(customerId)
        ? customerId[0]
        : customerId
      : undefined;

    const params: { send_email?: boolean } = {};
    if (send_email !== undefined) {
      // Normalize to string (handle array case)
      const sendEmailValue = Array.isArray(send_email) ? send_email[0] : send_email;
      params.send_email = sendEmailValue === "true";
    }

    if (!customerIdValue) {
      return reply.status(400).send("Missing customerId in query parameters");
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
      return reply.redirect(session.link);
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      return reply
        .status(500)
        .send(`Failed to create customer portal session: ${error.message}`);
    }
  };

  return getHandler;
};

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
      string
    >;

    const params = {
      send_email: false,
    };
    const sendEmail = Boolean(send_email);
    if (sendEmail) {
      params.send_email = sendEmail;
    }

    if (!customerId) {
      return reply.status(400).send("Missing customerId in query parameters");
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

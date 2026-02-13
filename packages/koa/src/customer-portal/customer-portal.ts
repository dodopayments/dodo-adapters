import type { Context } from "koa";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

export const CustomerPortal = ({
  bearerToken,
  environment,
}: CustomerPortalConfig) => {
  return async (ctx: Context) => {
    // Extract customerId from query parameters
    const { customer_id: customerId, send_email } = ctx.query;

    // Normalize customer_id to string (handle array case)
    const customerIdValue: string | undefined =
      typeof customerId === "string"
        ? customerId
        : Array.isArray(customerId)
          ? customerId[0]
          : undefined;

    const params: { send_email?: boolean } = {};
    if (send_email !== undefined) {
      // Normalize to string (handle array case)
      const sendEmailValue =
        typeof send_email === "string"
          ? send_email
          : Array.isArray(send_email)
            ? send_email[0]
            : undefined;
      params.send_email = sendEmailValue === "true";
    }

    if (!customerIdValue) {
      ctx.status = 400;
      ctx.body = { error: "Missing customer_id in query parameters" };
      return;
    }

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session = await dodopayments.customers.customerPortal.create(
        customerIdValue,
        params
      );

      if (!session.link) {
        ctx.status = 500;
        ctx.body = { error: "Failed to create customer portal session" };
        return;
      }

      ctx.redirect(session.link);
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = { error: "Failed to create customer portal session" };
    }
  };
};

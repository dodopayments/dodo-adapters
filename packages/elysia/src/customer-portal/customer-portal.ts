import { Elysia, t } from "elysia";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

export const CustomerPortal = ({
  bearerToken,
  environment,
}: CustomerPortalConfig) => {
  return new Elysia().get(
    "/",
    async ({ query, set, redirect }) => {
      const customerId = query.customer_id;
      const sendEmail = query.send_email;

      const params: { send_email?: boolean } = {};

      if (sendEmail !== undefined) {
        params.send_email = sendEmail === "true";
      }

      if (!customerId) {
        set.status = 400;
        return { error: "Missing customer_id in query parameters" };
      }

      const dodopayments = new DodoPayments({
        bearerToken,
        environment,
      });

      try {
        const session = await dodopayments.customers.customerPortal.create(
          customerId,
          params
        );
        return redirect(session.link);
      } catch (error: any) {
        console.error("Error creating customer portal session:", error);
        set.status = 500;
        return { error: "Failed to create customer portal session" };
      }
    },
    {
      query: t.Object({
        customer_id: t.String(),
        send_email: t.Optional(t.String()),
      }),
    }
  );
};

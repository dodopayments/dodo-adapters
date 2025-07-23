import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

export const CustomerPortal = ({
  bearerToken,
  environment,
}: CustomerPortalConfig) => {
  return async function (request: Request) {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customer_id");
    const params = {
      send_email: false,
    };
    const sendEmail = Boolean(searchParams.get("send_email"));
    if (sendEmail) {
      params.send_email = sendEmail;
    }
    if (!customerId) {
      return new Response("Missing customerId in query parameters", {
        status: 400,
      });
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
      return Response.redirect(session.link, 307);
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      return new Response(
        `Failed to create customer portal session: ${error.message}`,
        {
          status: 500,
        },
      );
    }
  };
};

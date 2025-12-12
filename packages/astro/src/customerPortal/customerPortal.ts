import type { APIContext, APIRoute } from "astro";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

export const CustomerPortal = ({
  bearerToken,
  environment,
}: CustomerPortalConfig): APIRoute => {
  const getHandler = async ({ request }: APIContext) => {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customer_id");
    const sendEmailParam = searchParams.get("send_email");
    const params: { send_email?: boolean } = {};
    if (sendEmailParam !== null) {
      // searchParams.get() already returns a single string or null
      params.send_email = sendEmailParam === "true";
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
  return getHandler;
};

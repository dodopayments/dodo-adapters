import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

/**
 * TanStack React Start Customer Portal handler
 * Usage: export const GET = CustomerPortal(config);
 */
export function CustomerPortal({
  bearerToken,
  environment,
}: CustomerPortalConfig) {
  return async function (request: Request) {
    // Extract customerId from query parameters
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
      return Response.redirect(session.link, 302);
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
}

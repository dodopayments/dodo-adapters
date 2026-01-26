import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

export const CustomerPortal = ({
  bearerToken,
  environment,
}: CustomerPortalConfig) => {
  const getHandler = async (request: Request): Promise<Response> => {
    // Extract customerId from query parameters
    const url = new URL(request.url);
    const customerId = url.searchParams.get("customer_id");
    const sendEmail = url.searchParams.get("send_email");

    const params = {
      send_email: false,
    };

    if (sendEmail === "true") {
      params.send_email = true;
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
        params
      );
      return Response.redirect(session.link);
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      return new Response(
        `Failed to create customer portal session: ${error.message}`,
        { status: 500 }
      );
    }
  };

  return getHandler;
};

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
  const handler = async (req: Request) => {
    const customerId = await getCustomerId(req);

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session =
        await dodopayments.customers.customerPortal.create(customerId);
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

  return handler;
};

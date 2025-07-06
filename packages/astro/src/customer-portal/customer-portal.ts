import type { APIRoute } from "astro";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
> & {
  getCustomerId: (request: Request) => Promise<string>;
};

export const CustomerPortal = ({
  bearerToken,
  environment,
  getCustomerId,
}: CustomerPortalConfig): APIRoute => {
  return async ({ request, redirect }) => {
    const customerId = await getCustomerId(request);

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session =
        await dodopayments.customers.customerPortal.create(customerId);
      return redirect(session.link);
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

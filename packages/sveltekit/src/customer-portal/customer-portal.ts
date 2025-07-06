import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
> & {
  getCustomerId: (event: Parameters<RequestHandler>[0]) => Promise<string>;
};

export const CustomerPortal = ({
  bearerToken,
  environment,
  getCustomerId,
}: CustomerPortalConfig): RequestHandler => {
  return async (event) => {
    const customerId = await getCustomerId(event);

    const dodopayments = new DodoPayments({
      bearerToken,
      environment,
    });

    try {
      const session =
        await dodopayments.customers.customerPortal.create(customerId);
      throw redirect(302, session.link);
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

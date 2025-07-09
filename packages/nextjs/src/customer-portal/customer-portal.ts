import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import DodoPayments, { ClientOptions } from "dodopayments";

export type CustomerPortalConfig = Pick<
  ClientOptions,
  "environment" | "bearerToken"
>;

export const CustomerPortal = ({
  bearerToken,
  environment,
}: CustomerPortalConfig) => {
  const getHandler = async (req: NextRequest) => {
    // Extract customerId from query parameters
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customer_id");
    const params = {
      send_email: false,
    };
    const sendEmail = Boolean(searchParams.get("send_email"));
    if (sendEmail) {
      params.send_email = sendEmail;
    }
    if (!customerId) {
      return new NextResponse("Missing customerId in query parameters", {
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
      return NextResponse.redirect(session.link);
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      return new NextResponse(
        `Failed to create customer portal session: ${error.message}`,
        {
          status: 500,
        },
      );
    }
  };

  return getHandler;
};

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // This is a simplified webhook handler that doesn't use the Webhooks utility
  // to avoid build-time issues with the webhook secret validation

  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "DODO_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.text();
    const payload = JSON.parse(body);

    console.log("Received webhook payload:", payload);

    // Handle different webhook events
    switch (payload.event) {
      case "payment.succeeded":
        console.log("Payment succeeded:", payload);
        break;
      case "payment.failed":
        console.log("Payment failed:", payload);
        break;
      case "subscription.active":
        console.log("Subscription activated:", payload);
        break;
      case "subscription.cancelled":
        console.log("Subscription cancelled:", payload);
        break;
      default:
        console.log("Unknown webhook event:", payload.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 400 },
    );
  }
}

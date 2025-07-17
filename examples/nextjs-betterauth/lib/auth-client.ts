import { createAuthClient } from "better-auth/react";
import { dodopaymentsClient } from "@dodopayments/betterauth";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [dodopaymentsClient()],
});

async function sample() {
  // return a list of subscriptions purchased the signed in user
  await authClient.customer.subscriptions.list({
    query: {
      limit: 10,
      page: 1,
      active: true, // default is false, omit this to get all subscriptions
    },
  });

  // return a list of payments made by the signed in user
  await authClient.customer.payments.list({
    query: {
      limit: 10,
      page: 1,
      status: "succeeded", // omit this to get all payments
    },
  });

  // gives a link to the customer portal for the signed in user
  // the developer has to do a redirect
  await authClient.customer.portal();
}

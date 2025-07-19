import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import {
  dodopayments,
  checkout,
  portal,
  webhooks,
} from "@dodopayments/better-auth";
import DodoPayments from "dodopayments";

export const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment:
    process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
});

export const auth = betterAuth({
  database: new Database("./db.sqlite"),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3000"],
  plugins: [
    dodopayments({
      client: dodoPayments,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "pdt_nZuwz45WAs64n3l07zpQR",
              slug: "the-alchemist",
            },
          ],
          successUrl: process.env.RETURN_URL || "/dashboard",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
          onPayload: async (payload) => {
            console.log("Webhook payload received:", payload);
          },
          onPaymentSucceeded: async (payload) => {
            console.log("Payment succeeded:", payload);
          },
        }),
      ],
    }),
  ],
});

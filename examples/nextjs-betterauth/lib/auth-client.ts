import { createAuthClient } from "better-auth/react";
import { dodopaymentsClient } from "@dodopayments/betterauth";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [dodopaymentsClient()],
});

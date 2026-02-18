import { createAuthClient } from "better-auth/react";
import type { BetterAuthClientPlugin } from "better-auth";
import type { dodopayments } from "@dodopayments/better-auth";

// Defined locally for this example to avoid Turbopack client-bundling issues with root imports.
// In normal usage, import `dodopaymentsClient` from `@dodopayments/better-auth`.
const dodopaymentsClient = () => {
  return {
    id: "dodopayments-client",
    $InferServerPlugin: {} as ReturnType<typeof dodopayments>,
  } satisfies BetterAuthClientPlugin;
};

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [dodopaymentsClient()],
});

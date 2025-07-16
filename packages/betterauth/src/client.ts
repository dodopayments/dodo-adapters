import type { BetterAuthClientPlugin } from "better-auth";
import type { dodopayments } from "./index";

export const dodoPaymentsClient = () => {
  return {
    id: "dodopayments-client",
    $InferServerPlugin: {} as ReturnType<typeof dodopayments>,
  } satisfies BetterAuthClientPlugin;
};

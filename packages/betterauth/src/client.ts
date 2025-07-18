import type { BetterAuthClientPlugin } from "better-auth";
import type { dodopayments } from "./index";

export const dodopaymentsClient = () => {
  return {
    id: "dodopayments-client",
    $InferServerPlugin: {} as ReturnType<typeof dodopayments>,
  } satisfies BetterAuthClientPlugin;
};

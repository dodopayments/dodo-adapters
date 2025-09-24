import { defineEventHandler } from "h3";
import { checkoutHandler } from "../../../../src/runtime/server/checkout";

export default defineEventHandler((event) => {
  const {
    private: { bearerToken, environment },
  } = useRuntimeConfig();

  const handler = checkoutHandler({
    bearerToken,
    environment: environment as "live_mode" | "test_mode",
    type: "dynamic",
  });

  return handler(event);
});

import { defineEventHandler } from 'h3'
import { customerPortalHandler } from "../../../../src/runtime/server/customer-portal"

export default defineEventHandler((event) => {
  const {
    private: { bearerToken, environment }
  } = useRuntimeConfig()

  const handler = customerPortalHandler({
    bearerToken,
    environment: environment as "live_mode" | "test_mode",
  })

  return handler(event)
})

import { defineEventHandler } from 'h3'
import { Webhooks } from "../../../../src/runtime/server/webhooks"

export default defineEventHandler((event) => {
    const {
        private: { webhookKey }
    } = useRuntimeConfig()

    const handler = Webhooks({
        webhookKey: webhookKey,
        onPayload: async (payload) => {
            // Handle here
        }
    })

    return handler(event)
})

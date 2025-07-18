import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ["../src/module"],
  devtools: { enabled: true },
  compatibilityDate: "2025-02-25",
  runtimeConfig: {
    private: {
      bearerToken: process.env.NUXT_PRIVATE_BEARER_TOKEN,
      webhookKey: process.env.NUXT_PRIVATE_BEARER_TOKEN,
      environment: process.env.NUXT_PRIVATE_ENVIRONMENT,
    },
  },
  vite: {
    server: {
      allowedHosts: [
        '33aca32030ab.ngrok-free.app'
      ]
    }
  }
});

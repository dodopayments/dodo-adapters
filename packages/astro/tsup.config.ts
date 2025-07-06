import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/checkout/checkout.ts",
    "src/webhooks/webhooks.ts",
    "src/customer-portal/customer-portal.ts",
  ],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
});

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
  clean: true,
  splitting: false,
  sourcemap: true,
});

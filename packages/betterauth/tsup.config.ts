import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    client: "src/client.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  skipNodeModulesBundle: true,
  external: ["better-auth", "@dodopayments/core"],
  noExternal: [],
});

import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  skipNodeModulesBundle: true,
  external: ["better-auth"],
});

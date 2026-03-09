import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "dist/index.cjs",
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
      }),
    ],
    external: [
      "elysia",
      "@dodopayments/core",
      "@dodopayments/core/webhook",
      "@dodopayments/core/schemas",
      "@dodopayments/core/checkout",
      "dodopayments",
      "standardwebhooks",
      "zod",
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    plugins: [dts()],
    external: [
      "elysia",
      "@dodopayments/core",
      "dodopayments",
      "standardwebhooks",
      "zod",
    ],
  },
];

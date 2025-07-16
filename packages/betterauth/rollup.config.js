import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const entries = [
  {
    name: "index",
    input: "src/index.ts",
    outDir: "dist",
  },
  {
    name: "checkout",
    input: "src/plugins/checkout.ts",
    outDir: "dist/plugins",
  },
  {
    name: "portal",
    input: "src/plugins/portal.ts",
    outDir: "dist/plugins",
  },
  {
    name: "webhooks",
    input: "src/plugins/webhooks.ts",
    outDir: "dist/plugins",
  },
  {
    name: "usage",
    input: "src/plugins/usage.ts",
    outDir: "dist/plugins",
  },
];

export default [
  // JavaScript builds
  ...entries.map(({ input, outDir, name }) => ({
    input,
    output: [
      {
        file: `${outDir}/${name}.js`,
        format: "esm",
        sourcemap: true,
      },
      {
        file: `${outDir}/${name}.cjs`,
        format: "cjs",
        sourcemap: true,
        exports: "auto",
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
    external: ["better-auth", "dodopayments", "zod", "@dodopayments/core"],
  })),

  // TypeScript declaration builds
  ...entries.map(({ input, outDir, name }) => ({
    input,
    output: {
      file: `${outDir}/${name}.d.ts`,
      format: "es",
    },
    plugins: [dts()],
    external: ["better-auth", "dodopayments", "zod", "@dodopayments/core"],
  })),
];

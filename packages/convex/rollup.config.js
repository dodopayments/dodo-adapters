import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import { execSync } from "child_process";
import fs from "fs";

const distDir = "dist";

// Clean dist directory before build
if (fs.existsSync(distDir)) {
  execSync(`rimraf ${distDir}`);
}

const config = [
  // Main JS Bundles (ESM and CJS)
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
        exports: "named",
      },
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist",
        emitDeclarationOnly: false,
      }),
    ],
    external: ["convex", "zod", "@dodopayments/core", "dodopayments"],
  },
  // Component Config Bundles (ESM and CJS)
  {
    input: "src/component/convex.config.ts",
    output: [
      {
        file: "dist/component/convex.config.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "dist/component/convex.config.cjs",
        format: "cjs",
        sourcemap: true,
        exports: "default",
      },
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist",
        emitDeclarationOnly: false,
      }),
    ],
    external: ["convex/server"],
  },
  // Type Declarations
  {
    input: "dist/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default config;

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
  // JS Bundles (ESM and CJS)
  {
    input: "src/module.ts",
    output: [
      {
        file: "dist/module.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "dist/module.cjs",
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
    external: ["nuxt", "vue", "vue-router", "zod", "@dodopayments/core"],
  },
  // Type Declarations
  {
    input: "dist/module.d.ts",
    output: [{ file: "dist/module.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default config; 
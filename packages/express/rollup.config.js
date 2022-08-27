import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { createBanner } from "../../rollup.utilities";

const version = require("./package.json").version;

/**
 * @returns { import("rollup").RollupOptions[] }
 */
export default function () {
  return [
    {
      input: `./index.ts`,
      treeshake: { propertyReadSideEffects: false },
      output: {
        file: `./index.js`,
        format: "cjs",
        banner: createBanner("@picx/express", version),
        sourcemap: false
      },
      external: ["path", "fs", "picx"],
      plugins: [
        nodeResolve({ extensions: [".ts"] }),
        typescript({
          rootDir: ".",
          outDir: ".",
          declaration: true,
          compilerOptions: {
            module: "ES2020",
            target: "es5"
          }
        })
      ]
    }
  ];
}

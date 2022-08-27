import path from "path";
import { uglify } from "rollup-plugin-uglify";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
import nodeResolve from "@rollup/plugin-node-resolve";
import { createBanner } from "../../rollup.utilities";

const version = require("./package.json").version;
const sourceDir = path.resolve(__dirname, "src");
const outputDir = path.resolve(__dirname, "dist");
const banner = createBanner("picx", version);

/**
 * @param { string } target
 * @return { import("@rollup/plugin-typescript").RollupTypescriptPluginOptions }
 */
function tsConfig(target) {
  return {
    tsconfig: "./tsconfig.json",
    rootDir: "src",
    outDir: "./dist",
    declaration: true,
    declarationDir: "./dist",
    compilerOptions: {
      module: "ES2020",
      target
    }
  };
}

// Requires
/** @type { import("@rollup/plugin-replace").RollupReplaceOptions } */
const browserFS = {
  preventAssignment: true,
  include: "./src/options.ts",
  delimiters: ["", ""],
  "./fs/node": "./fs/browser"
};
/** @type { import("@rollup/plugin-replace").RollupReplaceOptions } */
const browserStream = {
  preventAssignment: true,
  include: "./src/render/render.ts",
  delimiters: ["", ""],
  "../emitters/streamed-emitter": "../emitters/streamed-emitter-browser"
};
/** @type { import("@rollup/plugin-replace").RollupReplaceOptions } */
const esmRequire = {
  preventAssignment: true,
  include: "./src/fs/node.ts",
  delimiters: ["", ""],
  "./node-require": "./node-require.mjs"
};

// Outputs
/** @type { import("rollup").RollupOptions } */
const defaultOptions = {
  input: `${sourceDir}/index.ts`,
  treeshake: {
    propertyReadSideEffects: false
  }
};
/** @type { import("rollup").RollupOptions } */
const nodeCJS = {
  ...defaultOptions,
  output: {
    file: `${outputDir}/index.node.cjs.js`,
    format: "cjs",
    banner,
    sourcemap: false
  },
  external: ["path", "fs"],
  plugins: [nodeResolve({ extensions: [".ts"] }), typescript(tsConfig("es5"))]
};
/** @type { import("rollup").RollupOptions } */
const nodeEsm = {
  ...defaultOptions,
  output: {
    file: `${outputDir}/index.node.esm.js`,
    format: "esm",
    banner,
    sourcemap: false
  },
  external: ["path", "fs"],
  plugins: [nodeResolve({ extensions: [".ts"] }), replace(esmRequire), typescript(tsConfig("es6"))]
};
/** @type { import("rollup").RollupOptions } */
const browserEsm = {
  ...defaultOptions,
  output: {
    file: `${outputDir}/index.browser.esm.js`,
    format: "esm",
    banner,
    sourcemap: true
  },
  external: ["path", "fs"],
  plugins: [
    nodeResolve({ extensions: [".ts"] }),
    replace(browserFS),
    replace(browserStream),
    typescript(tsConfig("es6"))
  ]
};
/** @type { import("rollup").RollupOptions } */
const browserUmd = {
  ...defaultOptions,
  output: {
    file: `${outputDir}/index.browser.umd.js`,
    name: "picx",
    format: "umd",
    banner,
    sourcemap: true
  },
  external: ["path", "fs"],
  plugins: [
    nodeResolve({ extensions: [".ts"] }),
    replace(browserFS),
    replace(browserStream),
    typescript(tsConfig("es5"))
  ]
};
/** @type { import("rollup").RollupOptions } */
const browserMin = {
  ...defaultOptions,
  output: {
    file: `${outputDir}/index.browser.min.js`,
    name: "picx",
    format: "umd",
    banner,
    sourcemap: true
  },
  external: ["path", "fs"],
  plugins: [
    nodeResolve({ extensions: [".ts"] }),
    replace(browserFS),
    replace(browserStream),
    typescript(tsConfig("es5")),
    uglify()
  ]
};

/**
 * @returns { import("rollup").RollupOptions[] }
 */
export default function () {
  const bundles = [nodeCJS, nodeEsm, browserEsm, browserUmd, browserMin];
  return bundles;
}

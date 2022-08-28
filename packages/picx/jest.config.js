const ignorePatterns = [
  "\\/build\\/",
  "\\/dist\\/",
  "\\/coverage\\/",
  "\\/\\.vscode\\/",
  "\\/\\.tmp\\/",
  "\\/\\.cache\\/"
];

/**
 * @type { import("jest").Config }
 */
module.exports = {
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: ["**/src/*"],
  coverageDirectory: "coverage",
  globals: { "ts-jest": { tsconfig: "tsconfig.test.json" } },
  modulePathIgnorePatterns: ignorePatterns,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        suiteName: "picx",
        outputDirectory: "test/__junit___",
        usePathForSuiteName: "true",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}"
      }
    ]
  ],
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.[jt]s"],
  transform: {
    // "\\.[jt]s?$": require.resolve("./jest.babel-transformer.js"),
    "\\.[jt]s?$": "ts-jest"
  },
  transformIgnorePatterns: ["/node_modules/(?!(module)/)"]
};

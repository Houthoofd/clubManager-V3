/** @type {import('jest').Config} */
module.exports = {
  displayName: "clubmanager-integration",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  rootDir: ".",

  testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],

  globalSetup: "<rootDir>/tests/integration/setup/globalSetup.cjs",

  setupFiles: ["<rootDir>/tests/integration/setup/env.setup.cjs"],

  modulePaths: ["<rootDir>/src"],
  moduleNameMapper: {
    // Alias imports WITH .js extension (ESM TypeScript convention) must strip the
    // extension so Jest can find the .ts source file via moduleFileExtensions.
    "^@/modules/(.*)\.js$": "<rootDir>/src/modules/$1",
    "^@/modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@/shared/(.*)\.js$": "<rootDir>/src/shared/$1",
    "^@/shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@/core/(.*)\.js$": "<rootDir>/src/core/$1",
    "^@/core/(.*)$": "<rootDir>/src/core/$1",
    "^@/config/(.*)\.js$": "<rootDir>/src/config/$1",
    "^@/config/(.*)$": "<rootDir>/src/config/$1",
    "^@clubmanager/types$": "<rootDir>/../packages/types/src/index.ts",
    // Relative .js imports → strip extension so Jest resolves to .ts
    "^(\.{1,2}/.*)\.js$": "$1",
  },

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "ESNext",
          moduleResolution: "node",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  verbose: true,
  testTimeout: 30000,

  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],
  watchPathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],

  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": { useESM: true },
  },
};

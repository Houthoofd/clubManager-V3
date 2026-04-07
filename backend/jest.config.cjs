/** @type {import('jest').Config} */
module.exports = {
  displayName: 'clubmanager-backend',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  // Root directory
  rootDir: '.',

  // Test files pattern
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/tests/**/*.test.ts'
  ],

  // Module paths
  modulePaths: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/core/(.*)$': '<rootDir>/src/core/$1',
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
    '^@clubmanager/types$': '<rootDir>/../packages/types/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  // Transform
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true
        }
      }
    ]
  },

  // Extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/server.ts',
    '!src/**/index.ts'
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Setup files
  setupFilesAfterEnv: [],

  // Clear mocks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Timeouts
  testTimeout: 10000,

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.vscode/',
    '/coverage/'
  ],

  // Watch ignore
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // ESM support
  extensionsToTreatAsEsm: ['.ts'],

  // Globals
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};

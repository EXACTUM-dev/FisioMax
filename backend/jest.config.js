export default {
  testEnvironment: "node",
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  // Ignore archived/duplicate helper folders to avoid accidental test discovery
  testPathIgnorePatterns: ["<rootDir>/tests/**/_helpers/"],
  testMatch: ["**/tests/**/*.js", "**/?(*.)+(spec|test).js"],
  setupFiles: ["./tests/setup.js"],
  // Configure different setups for different types of tests
  projects: [
    {
      displayName: "unit",
      testMatch: [
        "<rootDir>/tests/api/**/*.js",
        "<rootDir>/tests/security/**/*.js",
        "<rootDir>/tests/services/**/*.js",
      ],
      setupFiles: ["./tests/setup.js"],
      testEnvironment: "node",
      transform: {},
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.{test,spec}.js"],
      // Run common setup and the integration-specific setup which registers
      // middleware mocks and test-only routes before integration tests.
      setupFiles: ["./tests/setup.js", "./tests/integration/setup.js"],
      testTimeout: 30000,
      testEnvironment: "node",
      transform: {},
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
    },
  ],
};

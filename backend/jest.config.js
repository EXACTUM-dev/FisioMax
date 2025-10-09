export default {
  testEnvironment: "node",
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/tests/**/*.js", "**/?(*.)+(spec|test).js"],
  setupFiles: [],

  projects: [
    {
      displayName: "integration",
      testEnvironment: "node",
      transform: {},
      testMatch: ["<rootDir>/tests/integration/**/*.js"],
      setupFiles: ["<rootDir>/tests/integration/setup.js"],
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
    },
  ],
};

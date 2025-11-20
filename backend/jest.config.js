export default {
  testEnvironment: "node",
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/tests/**/*.js", "**/?(*.)+(spec|test).js"],
  setupFiles: ["./tests/setup.js"],
  // Configuración para pruebas de integración
  testTimeout: 30000,
  // Configurar diferentes setups para diferentes tipos de pruebas
  projects: [
    {
      displayName: "unit",
      testMatch: [
        "<rootDir>/tests/api/**/*.js",
        "<rootDir>/tests/security/**/*.js",
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
      testMatch: ["<rootDir>/tests/integration/**/*.js"],
      setupFiles: ["./tests/setup.js"],
      testTimeout: 30000,
      testEnvironment: "node",
      transform: {},
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
    },
  ],
};

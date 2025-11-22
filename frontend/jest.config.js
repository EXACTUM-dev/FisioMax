export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest", // Quitamos el rootMode:"upward"
  },
  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/mocks/fileMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/tests/**/*.jsx", "**/?(*.)+(spec|test).jsx"],
  transformIgnorePatterns: [
    "/node_modules/(?!(@clerk|react-router|react-router-dom)/)",
  ],
};

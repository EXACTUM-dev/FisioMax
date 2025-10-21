/**
 * @fileoverview Jest configuration specific for membership application tests
 * @version 1.0.0
 * @author EXACTUM-dev
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Configuration files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/membershipApplication.setup.js'
  ],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.jsx',
    '<rootDir>/tests/**/*.test.js'
  ],
  
  // Transformations
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Modules to ignore in transformations
  transformIgnorePatterns: [
    'node_modules/(?!(clerk|@clerk)/)'
  ],
  
  // Module mocks
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.{js,jsx}',
    '!src/**/index.{js,jsx}',
    '!src/main.jsx'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Coverage reports
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Reports directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Timeout configuration
  testTimeout: 10000,
  
  // Verbose configuration
  verbose: true,
  
  // Automatically clear mocks
  clearMocks: true,
  
  // Automatically restore mocks
  restoreMocks: true
};

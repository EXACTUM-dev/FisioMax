/**
 * @fileoverview Configuración de Jest específica para pruebas de solicitud de membresías
 * @version 1.0.0
 * @author EXACTUM-dev
 */

module.exports = {
  // Entorno de prueba
  testEnvironment: 'jsdom',
  
  // Archivos de configuración
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/membershipApplication.setup.js'
  ],
  
  // Patrones de archivos de prueba
  testMatch: [
    '<rootDir>/tests/**/*.test.jsx',
    '<rootDir>/tests/**/*.test.js'
  ],
  
  // Transformaciones
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Módulos a ignorar en transformaciones
  transformIgnorePatterns: [
    'node_modules/(?!(clerk|@clerk)/)'
  ],
  
  // Mocks de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Configuración de cobertura
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.{js,jsx}',
    '!src/**/index.{js,jsx}',
    '!src/main.jsx'
  ],
  
  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Reportes de cobertura
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Directorio de reportes
  coverageDirectory: '<rootDir>/coverage',
  
  // Configuración de timeouts
  testTimeout: 10000,
  
  // Configuración de verbose
  verbose: true,
  
  // Limpiar mocks automáticamente
  clearMocks: true,
  
  // Restaurar mocks automáticamente
  restoreMocks: true
};

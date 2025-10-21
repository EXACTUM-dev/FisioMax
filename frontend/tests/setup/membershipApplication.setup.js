/**
 * @fileoverview Specific configuration for membership application tests
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import '@testing-library/jest-dom';

global.fetch = jest.fn();

global.alert = jest.fn();

/**
 * Mock console methods to avoid noise in tests.
 * @type {Function} originalConsoleError - Original console.error function
 * @type {Function} originalConsoleWarn - Original console.warn function
 */
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

/**
 * Jest hook to set up console mocking before all tests.
 * Suppresses React deprecation warnings and lifecycle warnings.
 */
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillMount'))
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

/**
 * Jest hook to restore original console methods after all tests.
 */
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

/**
 * Mock URL.createObjectURL and URL.revokeObjectURL for file tests.
 */
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

/**
 * Mock FileReader class for file loading tests.
 * @class MockFileReader
 */
global.FileReader = class {
  constructor() {
    this.result = null;
    this.error = null;
    this.onload = null;
    this.onerror = null;
  }

  readAsDataURL() {
    setTimeout(() => {
      this.result = 'data:application/pdf;base64,mock-data';
      if (this.onload) this.onload();
    }, 0);
  }

  readAsText() {
    setTimeout(() => {
      this.result = 'mock-file-content';
      if (this.onload) this.onload();
    }, 0);
  }
};

/**
 * Mock ResizeObserver class for DOM observation tests.
 * @class MockResizeObserver
 */
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  
  observe() {}
  
  unobserve() {}
  
  disconnect() {}
};

/**
 * Jest hook to clear all mocks after each test.
 * Ensures clean state between test runs.
 */
afterEach(() => {
  jest.clearAllMocks();
  global.alert.mockClear();
});
/**
 * @fileoverview Configuración específica para pruebas de solicitud de membresías
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import '@testing-library/jest-dom';

// Mock global de fetch para pruebas de API
global.fetch = jest.fn();

// Mock de window.alert
global.alert = jest.fn();

// Mock de console para evitar ruido en las pruebas
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

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

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock de URL.createObjectURL para pruebas de archivos
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock de FileReader para pruebas de carga de archivos
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

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Limpiar mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
  global.alert.mockClear();
});

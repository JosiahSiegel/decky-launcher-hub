/**
 * Jest setup file for Launcher Hub tests
 * Configures the test environment and global mocks
 */

// Add custom matchers from jest-dom
require('@testing-library/jest-dom');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  // Keep log, info, and debug for debugging
  log: console.log,
  info: console.info,
  debug: console.debug,
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock Decky global objects
global.DFL = {
  definePlugin: jest.fn(),
  PluginController: {
    pluginList: [],
  },
};

global.SP_REACT = {
  useState: jest.fn(),
  useEffect: jest.fn(),
  createElement: jest.fn(),
  Fragment: jest.fn(),
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
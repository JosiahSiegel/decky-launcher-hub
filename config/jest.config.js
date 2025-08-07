/**
 * Jest configuration for Launcher Hub Decky plugin
 * 
 * Configured for testing React components with TypeScript/JavaScript
 * in the Decky plugin environment
 */

const path = require('path');

module.exports = {
  // Use jsdom for browser-like environment
  testEnvironment: 'jsdom',
  
  // Set root directory to project root
  rootDir: path.resolve(__dirname, '..'),
  
  // Setup files to run after test framework is installed
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  
  // Module name mapping for static assets and CSS
  moduleNameMapper: {
    // Mock CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Mock static file imports
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/__mocks__/fileMock.js',
    
    // Mock Decky plugin modules
    '@decky/api': '<rootDir>/tests/__mocks__/deckyApi.js',
    '@decky/ui': '<rootDir>/tests/__mocks__/deckyUi.js',
    'decky-frontend-lib': '<rootDir>/tests/__mocks__/decky-frontend-lib.js',
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.spec.{js,jsx,ts,tsx}',
  ],
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.js', // Exclude compiled file
    '!**/node_modules/**',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
  // Verbose output
  verbose: true,
  
  // Clear mocks automatically between tests
  clearMocks: true,
  
  // Restore mocks automatically between tests
  restoreMocks: true,
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
};
// Jest setup file
require('@testing-library/jest-dom');

// Mock global objects
global.SP_REACT = require('react');
global.SP_REACTDOM = require('react-dom');
global.DFL = require('./mocks/deckyUi.cjs');

// Mock window objects
global.window = {
  ...global.window,
  __DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit: {
    connect: jest.fn(() => ({
      _version: 2,
    })),
  },
};
/**
 * Mock for decky-frontend-lib
 * Provides mock implementations for Decky Frontend Library
 */

const React = require('react');

// Mock definePlugin function
const definePlugin = jest.fn((pluginDef) => {
  // If pluginDef is a function, call it with mock serverApi
  if (typeof pluginDef === 'function') {
    return pluginDef({
      callPluginMethod: jest.fn().mockResolvedValue({ result: [] }),
      toaster: {
        toast: jest.fn()
      }
    });
  }
  return pluginDef;
});

// Mock static classes
const staticClasses = {
  Title: 'decky-title',
  Panel: 'decky-panel',
  Button: 'decky-button',
  Field: 'decky-field',
  Focusable: 'decky-focusable',
  Label: 'decky-label',
  ModalRoot: 'decky-modal-root'
};

// Mock Router
const Router = {
  Navigate: jest.fn(),
  NavigateToLibraryTab: jest.fn(),
  NavigateToStore: jest.fn(),
  NavigateBack: jest.fn(),
  NavigateToExternalWeb: jest.fn(),
  NavigateToChat: jest.fn(),
  NavigateToSettings: jest.fn(),
  NavigateToLayoutPreview: jest.fn(),
  CloseSideMenus: jest.fn(),
  OpenPowerMenu: jest.fn()
};

// Mock Toaster
const Toaster = {
  toast: jest.fn((title, message) => Promise.resolve())
};

// Mock ServerAPI
const ServerAPI = jest.fn().mockImplementation(() => ({
  callPluginMethod: jest.fn().mockResolvedValue({ result: [] }),
  toaster: {
    toast: jest.fn()
  }
}));

// Mock other utilities
const sleep = jest.fn((ms) => new Promise(resolve => setTimeout(resolve, ms)));
const joinClassNames = jest.fn((...classes) => classes.filter(Boolean).join(' '));

module.exports = {
  definePlugin,
  staticClasses,
  Router,
  Toaster,
  ServerAPI,
  sleep,
  joinClassNames
};
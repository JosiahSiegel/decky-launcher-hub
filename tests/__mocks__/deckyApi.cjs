/**
 * Mock for @decky/api module
 */

module.exports = {
  definePlugin: jest.fn((callback) => {
    return callback({
      callPluginMethod: jest.fn(),
      toaster: {
        toast: jest.fn(),
      },
      routerHook: {
        addRoute: jest.fn(),
        removeRoute: jest.fn(),
      },
    });
  }),
  
  serverAPI: {
    callPluginMethod: jest.fn(),
  },
  
  // Mock other commonly used exports
  Navigation: {
    CloseSideMenus: jest.fn(),
    NavigateBack: jest.fn(),
    NavigateToLibraryTab: jest.fn(),
  },
  
  Static: {
    DECKY_PLUGIN_DIR: '/home/deck/homebrew/plugins',
  },
};
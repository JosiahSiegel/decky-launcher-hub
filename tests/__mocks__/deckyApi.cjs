module.exports = {
  definePlugin: jest.fn((fn) => fn),
  routerHook: {
    addPatch: jest.fn(),
    removePatch: jest.fn(),
  },
  serverAPI: {
    callPluginMethod: jest.fn(),
  },
  toaster: {
    toast: jest.fn(),
  },
};
/**
 * Custom babel transformer for Jest that uses babel.config.cjs
 */

const babelJest = require('babel-jest').default;
const path = require('path');

// Load the CommonJS babel config directly
const babelConfig = require('../config/babel.config.cjs');

module.exports = babelJest.createTransformer({
  ...babelConfig,
  rootMode: 'upward-optional',
  configFile: false, // Don't try to load any config file
  babelrc: false // Don't look for .babelrc files
});
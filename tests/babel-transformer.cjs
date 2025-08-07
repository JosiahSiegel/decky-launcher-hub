/**
 * Custom babel transformer for Jest that uses babel.config.cjs
 */

const babelJest = require('babel-jest').default;

module.exports = babelJest.createTransformer({
  rootMode: 'upward',
  configFile: require.resolve('../babel.config.cjs')
});
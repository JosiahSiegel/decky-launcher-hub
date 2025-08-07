#!/usr/bin/env node
/**
 * Simple build script to create proper IIFE for Decky
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('Building optimized frontend...');

// First, build with rollup
try {
  execSync('npx rollup -c rollup.config.simple.js', { stdio: 'inherit' });
} catch (e) {
  console.error('Rollup build failed:', e);
  process.exit(1);
}

// Read the built file
let content = fs.readFileSync('dist/index.temp.js', 'utf8');

// Wrap in proper IIFE for Decky
const wrappedContent = `(function(DFL, SP_REACT) {
  ${content}
  
  // Return the default export from the IIFE
  return deckyplugin.default;
})(DFL, SP_REACT);`;

// Write final file
fs.writeFileSync('dist/index.js', wrappedContent);
fs.unlinkSync('dist/index.temp.js');

console.log('✅ Build complete!');
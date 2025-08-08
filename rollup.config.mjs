import deckyPlugin from "@decky/rollup";

export default deckyPlugin({
  output: {
    format: 'iife',
    name: 'LauncherHub',
    exports: 'default',
    globals: {
      'react': 'SP_REACT',
      'react-dom': 'SP_REACTDOM',
      '@decky/ui': 'DFL',
      '@decky/api': 'DFL'
    }
  }
});
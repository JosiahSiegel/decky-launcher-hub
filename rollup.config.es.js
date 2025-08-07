import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/index.tsx',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  external: [
    'react',
    'react-dom',
    'react-icons/fa',
    'decky-frontend-lib'
  ],
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    resolve({
      preferBuiltins: false,
      browser: true
    }),
    commonjs(),
    typescript({
      tsconfig: false,
      jsx: 'react',
      jsxFactory: 'React.createElement',
      jsxFragmentFactory: 'React.Fragment',
      target: 'es2020',
      module: 'esnext',
      lib: ['es2020', 'dom'],
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      moduleResolution: 'node',
      skipLibCheck: true,
      strict: false,
      declaration: false,
      sourceMap: true
    })
  ]
};
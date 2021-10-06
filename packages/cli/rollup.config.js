import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import cleanup from 'rollup-plugin-cleanup';
import json from '@rollup/plugin-json';

const packageJson = require('./package.json');

// Deps to not bundle
const external = Object.keys(packageJson.devDependencies);

const plugins = [
  webWorkerLoader({ targetPlatform: 'node' }),
  resolve({
    browser: false,
    preferBuiltins: true,
  }),
  json(),
  typescript({ module: 'CommonJS' }),
  commonjs({ extensions: ['.js', '.ts'] }),
  cleanup({ comments: 'none' }),
  terser(),
];

export default {
  input: 'index.ts',
  output: {
    file: packageJson.main,
    format: 'cjs',
    exports: 'auto',
    sourcemap: true,
  },
  plugins,
  external,
};

import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import typescript from 'rollup-plugin-typescript2';
import builtins from 'rollup-plugin-node-builtins';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import json from '@rollup/plugin-json';

const packageJson = require('./package.json');

const globals = {
  ...packageJson.devDependencies,
  // 'threads/worker': '*',
};

const plugins = [
  webWorkerLoader({
    targetPlatform: 'browser',
  }),
  builtins(),
  resolve({ jsnext: true, preferBuiltins: true, browser: true }),
  json(),
  typescript({
    useTsconfigDeclarationDir: true,
  }),
  commonjs(),
  cleanup({
    comments: 'none',
  }),
];

const configWorker = {
  input: 'src/workers/axios.ts',
  output: {
    dir: 'dist/workers',
    format: 'esm',
    sourcemap: true,
    intro: 'const global = self;',
  },
  plugins,
  external: Object.keys(globals),
};

const mainConfig = {
  input: 'index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    exports: 'auto',
    sourcemap: true,
  },
  plugins,
  context: 'self',
  moduleContext: 'self',
  external: Object.keys(globals),
};

export default [configWorker, mainConfig];

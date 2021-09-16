import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import typescript from 'rollup-plugin-typescript2';
import builtins from 'rollup-plugin-node-builtins';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import cleanup from 'rollup-plugin-cleanup';
import json from '@rollup/plugin-json';

const packageJson = require('./package.json');

// Deps to not bundle
const external = Object.keys({
  ...packageJson.devDependencies,
  threads: '',
  fs: '',
});

const plugins = (browser = false, minify = false) => [
  webWorkerLoader({
    targetPlatform: browser ? 'browser' : 'node',
  }),
  builtins(),
  replace({
    'process.env.IS_NODE_ENV': false,
    preventAssignment: true,
  }),
  resolve({
    browser,
    jsnext: true,
    mainFields: ['module', 'main'],
    preferBuiltins: true,
  }),
  json(),
  typescript({
    module: 'esnext',
    tsconfig: 'tsconfig.json',
    rollupCommonJSResolveHack: true,
    useTsconfigDeclarationDir: true,
  }),
  commonjs(),
  cleanup({
    comments: 'none',
  }),
  ...(minify ? [terser()] : []),
];

// Browser only
const iife = {
  input: 'index.ts',
  output: {
    file: packageJson.browser,
    format: 'iife',
    sourcemap: true,
    name: 'scrapito',
  },
  plugins: plugins(true, true),
  external,
};

const esmBrowser = {
  input: 'index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    exports: 'auto',
    sourcemap: true,
  },
  plugins: plugins(true, false),
  moduleContext: 'this',
  context: 'this',
  external,
};

const esmNode = {
  input: 'index.ts',
  output: {
    dir: 'dist/esm',
    format: 'esm',
    sourcemap: true,
  },
  plugins: plugins(false, false),
  external,
};

const cjs = {
  input: 'index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    exports: 'auto',
    sourcemap: true,
  },
  plugins: plugins(false, false),
  external,
};

const configWorkerBrowser = {
  input: ['src/workers/axios.ts', 'src/workers/puppeteer.ts'],
  output: {
    dir: 'dist/workers',
    format: 'esm',
    sourcemap: true,
    intro: 'const global = self;',
  },
  plugins: plugins(true, false),
  external,
};

const configWorker = {
  input: 'src/workers/axios.ts',
  output: {
    dir: 'dist/workers',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: plugins(false, false),
  external,
};

export default [esmBrowser, configWorkerBrowser];

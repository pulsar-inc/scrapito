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
  replace({
    'process.env.IS_NODE_ENV': false,
    preventAssignment: true,
    'process.env.__puppeteerWorker__': JSON.stringify(
      browser ? './browser-workers/puppeteer.js' : './workers/puppeteer.js'
    ),
    'process.env.__axiosWorker__': JSON.stringify(
      browser ? './browser-workers/axios.js' : './workers/axios.js'
    ),
  }),
  webWorkerLoader({
    targetPlatform: browser ? 'browser' : 'node',
  }),
  builtins(),
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

const esmBrowser = {
  input: 'index.ts',
  output: {
    file: 'dist/browser.js',
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
    file: packageJson.module,
    format: 'esm',
    exports: 'auto',
    sourcemap: true,
  },
  plugins: plugins(false, false),
  external,
};

const cjsNode = {
  input: 'index.ts',
  output: {
    file: packageJson.main,
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
    dir: 'dist/browser-workers',
    format: 'esm',
    sourcemap: true,
    intro: 'const global = self;',
  },
  plugins: plugins(true, false),
  external,
};

const configWorker = {
  input: ['src/workers/axios.ts', 'src/workers/puppeteer.ts'],
  output: {
    dir: 'dist/workers',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: plugins(false, false),
  external,
};

export default [cjsNode, esmNode, esmBrowser, configWorker, configWorkerBrowser];

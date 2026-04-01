import { readFileSync } from 'fs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const sdkVersion = `@journium/js@${pkg.version}`;

export default [
  // Regular package builds (CJS, ESM, UMD)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'journium',
        sourcemap: true,
        globals: {
          '@journium/core': 'JourniumCore',
        },
      },
    ],
    plugins: [
      replace({ __SDK_VERSION__: sdkVersion, preventAssignment: true }),
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
    external: [],
  },

  // CDN build - optimized for script snippet usage
  {
    input: 'src/cdn.ts',
    output: [
      {
        file: 'dist/journium.js',
        format: 'iife',
        sourcemap: true,
        banner: '/* Journium Analytics SDK - Browser CDN Build */',
      },
      {
        file: 'dist/journium.min.js',
        format: 'iife',
        sourcemap: true,
        banner: '/* Journium Analytics SDK - Browser CDN Build (Minified) */',
        plugins: [terser({
          format: {
            comments: /^!/,  // Keep banner comments
          },
          compress: {
            drop_console: false,  // Keep console statements for debugging
            drop_debugger: true,
          },
          mangle: {
            reserved: ['journium'], // Don't mangle global names
          },
        })],
      },
    ],
    plugins: [
      replace({ __SDK_VERSION__: sdkVersion, preventAssignment: true }),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
    external: [],
  },
  
  // TypeScript definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
    external: [],
  },
];
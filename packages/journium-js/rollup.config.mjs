import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

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
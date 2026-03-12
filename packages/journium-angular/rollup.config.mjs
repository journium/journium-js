import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

const external = [
  '@angular/core',
  '@angular/common',
  '@angular/router',
  '@journium/js',
  '@journium/core',
  'rxjs',
  'rxjs/operators',
];

const plugins = [
  nodeResolve(),
  typescript({ tsconfig: './tsconfig.json' }),
];

export default [
  // Main entry (standalone API — no Angular decorators)
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.cjs', format: 'cjs', sourcemap: true },
      { file: 'dist/index.mjs', format: 'esm', sourcemap: true },
    ],
    plugins,
    external,
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'esm' },
    plugins: [dts()],
    external,
  },
  // NgModule entry (for Angular apps using NgModule pattern)
  {
    input: 'src/ngmodule.ts',
    output: [
      { file: 'dist/ngmodule.cjs', format: 'cjs', sourcemap: true },
      { file: 'dist/ngmodule.mjs', format: 'esm', sourcemap: true },
    ],
    plugins,
    external,
  },
  {
    input: 'src/ngmodule.ts',
    output: { file: 'dist/ngmodule.d.ts', format: 'esm' },
    plugins: [dts()],
    external,
  },
];

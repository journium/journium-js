import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

/**
 * Rollup configuration for @journium/nextjs package
 * 
 * NOTE: The "use client" directive is added as a banner to preserve it in the bundled output.
 * This is necessary because Rollup strips module-level directives during bundling, but Next.js
 * needs the directive to recognize client components when importing from the package.
 * 
 * The directive only affects React components - utility functions like `isServerSide` and
 * `getPagePropsForSSR` can still be used in server components even though they're exported
 * from a file with "use client" at the top.
 * 
 * @type {import('rollup').RollupOptions[]}
 */
const config = [
  {
    input: 'src/index.tsx',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
        banner: '"use client"',
      },
      {
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap: true,
        banner: '"use client"',
      },
    ],
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
    external: ['react', 'next/navigation', '@journium/react', '@journium/core', 'journium-js'],
  },
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
    external: ['react', 'next/navigation', '@journium/react', '@journium/core', 'journium-js'],
  },
];

export default config;
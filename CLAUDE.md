# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @journium/js test

# Run a specific test file
pnpm --filter @journium/js test -- pageview.test.ts

# Lint
pnpm lint
pnpm lint:fix

# Type check
pnpm typecheck

# Format code
pnpm format

# Build CDN bundles (for @journium/js only)
pnpm build:cdn

# Start all dev servers + watch mode
pnpm dev

# Clean all dist directories
pnpm clean
```

## Architecture

This is a **pnpm monorepo** using **Turbo** for task orchestration. It's the official JavaScript SDK for Journium — a web analytics and user tracking platform.

### Package Dependency Graph

```
@journium/core  (types, identity, event definitions)
       ↓
@journium/js    (browser client — CJS, ESM, UMD, CDN/IIFE bundles)
       ↓
@journium/react    (React hooks + JourniumProvider)
@journium/nextjs   (Next.js SSR-aware wrapper around @journium/react)
@journium/angular  (Angular service + NgModule/standalone support)
```

- **`@journium/core`** — Shared types, utilities, identity management, and event definitions. No runtime dependencies except `uuidv7`.
- **`@journium/js`** — Core browser SDK. Built with Rollup into 4 bundle formats. This is the foundation for all other packages.
- **`@journium/react`** — React 16.8+ hooks (`useJournium`) and context provider. Peer dep on React.
- **`@journium/nextjs`** — Thin wrapper around `@journium/react` adding Next.js-specific setup for SSR.
- **`@journium/angular`** — Angular 15+ service with both standalone and NgModule support. Built with ng-packagr (not Rollup).

### Build System

Each package (except Angular) uses **Rollup** with `rollup.config.mjs`. The `@journium/js` package produces 4 outputs: CJS, ESM, UMD, and a CDN IIFE bundle (minified with Terser). All packages emit TypeScript declaration files.

Internal workspace dependencies use `workspace:*` syntax in package.json.

### Testing

Tests use **Jest 29** with `ts-jest` and `jest-environment-jsdom`. The root `jest.config.js` sets up module name mapping so `@journium/*` imports resolve to the workspace packages. Per-package jest configs extend the root.

CI runs compatibility matrices for React (16.8, 16.14, 17, 18) and Angular (15–21) via separate GitHub Actions workflows.

### Versioning & Release

Uses **Changesets** for versioning. When making changes:
1. `pnpm changeset` — create a changeset entry
2. `pnpm version` — bump package versions
3. `pnpm release` — build + publish to npm with provenance

### Key Configuration Files

- `turbo.json` — task graph, concurrency (20), cache outputs
- `tsconfig.base.json` — TypeScript strict mode, target ES2018, module ESNext
- `.eslintrc.js` — TypeScript-aware rules; `no-var`, `prefer-const`, warn on `any`
- `.prettierrc` — single quotes, semi, 100 char width, trailing commas (es5)

# Angular Compatibility Test Suite

This directory contains the compatibility test suite for `@journium/angular`, verifying
correct behaviour across Angular 15–19.

## Structure

```
test-compat/
├── test-all.sh           # Run all version tests sequentially
├── test-angular-15.sh    # Angular 15.x
├── test-angular-16.sh    # Angular 16.x
├── test-angular-17.sh    # Angular 17.x
├── test-angular-18.sh    # Angular 18.x
├── test-angular-19.sh    # Angular 19.x
└── test-suite/
    ├── compatibility.spec.ts   # Test cases (TestBed-based, no DOM renderer)
    └── setup.ts                # jest-preset-angular bootstrap + fetch mock
```

## How It Works

Each per-version script:
1. Creates an isolated temporary directory
2. Writes a `package.json` with exact Angular version + correct tooling versions
3. Builds `@journium/core` and `@journium/js` workspace deps
4. Installs all npm dependencies
5. Packs `@journium/angular` as a tarball and installs it
6. Copies the shared `test-suite/` into `tests/`
7. Writes `jest.config.js` and `tsconfig.spec.json` inline
8. Runs `npm test` and reports pass/fail

## Test Suites

| Suite | Description |
|-------|-------------|
| Suite 1 | `provideJournium()` standalone pattern — 9 assertions |
| Suite 2 | `JourniumModule.forRoot()` NgModule pattern — 9 assertions |
| Suite 3 | `withJourniumRouter()` router integration — 3 assertions |
| Suite 4 | Subpath export resolution (`@journium/angular` + `@journium/angular/ngmodule`) |
| Suite 5 | Angular version detection + zone-agnostic environment checks |

## Dependency Matrix

| Angular | zone.js  | TypeScript | jest-preset-angular |
|---------|----------|------------|---------------------|
| 15.x    | ~0.12.0  | ~4.9.5     | ^13.0.0             |
| 16.x    | ~0.13.0  | ~5.0.4     | ^13.0.0             |
| 17.x    | ~0.14.0  | ~5.2.2     | ^14.0.0             |
| 18.x    | ~0.14.0  | ~5.4.5     | ^14.0.0             |
| 19.x    | ~0.15.0  | ~5.6.3     | ^14.0.0             |

All versions use `jest@^29`, `jest-environment-jsdom@^29`, `rxjs@^7.8.0`.

## Running Locally

```bash
# From packages/journium-angular
pnpm test:compat           # all versions
pnpm test:compat:19        # Angular 19 only (smoke test)
pnpm test:compat:15        # Angular 15 only

# Or directly
cd test-compat
./test-angular-19.sh
./test-all.sh
```

## CI

Tests run automatically on every push/PR that touches `packages/journium-angular/**`.
See `.github/workflows/angular-compatibility.yml`.

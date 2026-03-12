# Quick Start — Angular Compatibility Tests

## Prerequisites

- Node.js 20+
- pnpm 8+
- npm (for isolated test environments)

## Smoke Test (Angular 19, ~2 min)

```bash
cd packages/journium-angular
pnpm test:compat:19
```

## Full Suite (all 5 versions, ~10 min)

```bash
cd packages/journium-angular
pnpm test:compat
```

## Single Version

```bash
cd packages/journium-angular
pnpm test:compat:15   # Angular 15
pnpm test:compat:16   # Angular 16
pnpm test:compat:17   # Angular 17
pnpm test:compat:18   # Angular 18
pnpm test:compat:19   # Angular 19
```

## What Gets Tested

Each run installs the target Angular version in an isolated temp directory,
packs `@journium/angular` as a tarball, and runs the shared test suite:

- `provideJournium()` standalone DI pattern
- `JourniumModule.forRoot()` NgModule pattern
- `withJourniumRouter()` router integration
- Subpath exports (`@journium/angular` + `@journium/angular/ngmodule`)
- Angular version detection + zone-agnostic environment

## Troubleshooting

**`pnpm pack` fails**: Run `pnpm --filter @journium/angular build` first.

**`jest-preset-angular` errors on Angular 15/16**: These versions use
`jest-preset-angular@^13`. Angular 17+ uses `^14`. This is handled automatically
by each version script.

**Peer dependency warnings**: Expected. The `--legacy-peer-deps` flag is used
intentionally to allow installing the exact Angular version being tested.

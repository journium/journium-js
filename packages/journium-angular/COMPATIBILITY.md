# Angular Version Compatibility

## Supported Angular Versions

`@journium/angular` officially supports Angular versions **15.0.0 and above**.

### Why Angular 15+?

Angular 15 stabilised the standalone component API and introduced
`makeEnvironmentProviders`, which underpins `provideJournium()`.
The package uses:
- `makeEnvironmentProviders` / `EnvironmentProviders` — standalone DI
- `InjectionToken` / `inject()` — factory-based service creation
- `APP_INITIALIZER` — router pageview tracking hook
- `NgModule` / `ModuleWithProviders` — traditional module pattern

## Tested Versions

| Angular Version | Status | Notes |
|----------------|--------|-------|
| **15.x** | Certified | Minimum supported version |
| **16.x** | Certified | Signals preview; standalone API stable |
| **17.x** | Certified | Signals stable; new control flow |
| **18.x** | Certified | Zoneless preview |
| **19.x** | Certified | Latest stable release |

## DI Entry Points

### Standalone (`provideJournium`)

```typescript
// app.config.ts
import { provideJournium, withJourniumRouter } from '@journium/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideJournium({ publishableKey: 'your-key' }),
    withJourniumRouter(), // optional — auto-tracks route changes
  ],
};
```

### NgModule (`JourniumModule`)

```typescript
// app.module.ts
import { JourniumModule } from '@journium/angular/ngmodule';

@NgModule({
  imports: [
    JourniumModule.forRoot({ publishableKey: 'your-key' }),
  ],
})
export class AppModule {}
```

### Service injection

`JourniumService` has **no `@Injectable()` decorator** — it is always created
via `useFactory`. Inject it through the DI system, not directly:

```typescript
// component.ts
import { JourniumService } from '@journium/angular';

@Component({ ... })
export class MyComponent {
  constructor(private journium: JourniumService) {}
}
```

## Compatibility Features

### Angular 15.x
- Standalone API (`provideJournium`) fully supported
- `makeEnvironmentProviders` introduced in this version
- NgModule pattern fully supported

### Angular 16.x
- All Angular 15 features
- Signals (preview) — does not affect JourniumService
- `inject()` in constructor contexts stable

### Angular 17.x
- New control flow (`@if`, `@for`) — JourniumService unaffected
- Signals stabilised — JourniumService works with signal-based components
- `@defer` blocks — service injected lazily as expected

### Angular 18.x
- Zoneless change detection (experimental) — JourniumService is zone-agnostic
- Stable signals API

### Angular 19.x
- Latest Angular — full compatibility verified

## Running Compatibility Tests

### Local Testing

```bash
# All versions
pnpm test:compat

# Specific version
pnpm test:compat:15
pnpm test:compat:16
pnpm test:compat:17
pnpm test:compat:18
pnpm test:compat:19
```

### CI Testing

Compatibility tests run automatically on:
- Every pull request touching `packages/journium-angular/**`
- Commits to `main` or `develop`
- Manual workflow dispatch

See [.github/workflows/angular-compatibility.yml](../../.github/workflows/angular-compatibility.yml)

## Test Suite

The compatibility test suite (`test-compat/test-suite/compatibility.spec.ts`) uses
`TestBed` from `@angular/core/testing` — no DOM renderer, no `@testing-library/angular`.

### Suite 1 — `provideJournium()` standalone
- Service injectable via `TestBed.inject`
- All 8 service methods: `track`, `identify`, `reset`, `capturePageview`,
  `startAutocapture`, `stopAutocapture`, `getEffectiveOptions`, `ngOnDestroy`

### Suite 2 — `JourniumModule.forRoot()` NgModule
- Same 9 assertions via NgModule provider path

### Suite 3 — `withJourniumRouter()` router integration
- Service remains injectable alongside `provideRouter([])`

### Suite 4 — Subpath export resolution
- `@journium/angular` main export
- `@journium/angular/ngmodule` subpath export

### Suite 5 — Version detection
- Angular major version >= 15
- Zone-patched jest environment compatibility

## TypeScript Support

| TypeScript | Angular |
|------------|---------|
| ~4.9.5     | 15.x    |
| ~5.0.4     | 16.x    |
| ~5.2.2     | 17.x    |
| ~5.4.5     | 18.x    |
| ~5.6.3     | 19.x    |

## Known Limitations

### Angular < 15
Not supported. `makeEnvironmentProviders` does not exist; use `@journium/js` directly.

### Server-Side Rendering (Angular Universal / SSR)
`@journium/angular` is designed for browser environments. For SSR, guard service
calls with `isPlatformBrowser()`.

### Zoneless change detection (Angular 18+)
The service itself is zone-agnostic. If you enable zoneless (`provideExperimentalZonelessChangeDetection`),
remove `zone.js` from `polyfills` but keep it for testing if using `jest-preset-angular`.

## Getting Help

Report issues at [github.com/journium/journium-js/issues](https://github.com/journium/journium-js/issues)
including Angular version, `@journium/angular` version, and a minimal reproduction.

---

**Last Updated**: March 2026
**Tested Versions**: 15.2.0, 16.2.0, 17.3.0, 18.2.0, 19.0.0

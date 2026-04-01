# @journium/angular

## 2.1.0

### Minor Changes

- 538eedf: Added SDK version in events. Added support for capturing data attributes of tags.

### Patch Changes

- Updated dependencies [538eedf]
  - @journium/js@1.3.0
  - @journium/core@1.3.0

## 2.0.0

### Major Changes

- 91e3b34: Fix duplicate pageview events and remote config compliance across framework SDKs.

  **@journium/angular (BREAKING):** Minimum Angular version bumped from 15 to 19. Migrated from `APP_INITIALIZER` multi-provider to `provideAppInitializer()`. Added `_frameworkHandlesPageviews` flag so remote config `autoTrackPageviews: false` is respected. NavigationEnd handler now checks effective options at event time.

  **@journium/nextjs:** Fixed spurious pageview emission when remote config toggles `autoTrackPageviews` from false to true without navigation. Replaced `autoTrackPageviews` object-form override with `_frameworkHandlesPageviews` flag. Removed `effectiveOptions` from outer tracker effect deps to prevent TrackerImpl remounting on config changes.

  **@journium/js:** Added `_frameworkHandlesPageviews` support to `resolvePageviewOptions` — disables built-in pageview tracking without modifying `autoTrackPageviews`.

  **@journium/core:** Added `_frameworkHandlesPageviews` internal field to `JourniumLocalOptions`.

### Patch Changes

- Updated dependencies [91e3b34]
  - @journium/js@1.2.3
  - @journium/core@1.2.2

## 1.1.0

### Minor Changes

- 8030889: Fixed duplicate pageview events in NextJS SDK. Added comments in all SDKs.

## 1.0.4

### Patch Changes

- 161b7f3: Fix exports

## 1.0.3

### Patch Changes

- 1f31dbc: NgModule migration

## 1.0.2

### Patch Changes

- 1817127: Update docs
- Updated dependencies [1817127]
  - @journium/js@1.2.2

## 1.0.1

### Patch Changes

- c296fb1: Fix release
- Updated dependencies [c296fb1]
  - @journium/core@1.2.1
  - @journium/js@1.2.1

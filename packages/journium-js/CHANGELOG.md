# @journium/js

## 1.3.1

### Patch Changes

- decb8d8: enriched autocapture event data
- Updated dependencies [decb8d8]
  - @journium/core@1.3.1

## 1.3.0

### Minor Changes

- 538eedf: Added SDK version in events. Added support for capturing data attributes of tags.

### Patch Changes

- Updated dependencies [538eedf]
  - @journium/core@1.3.0

## 1.2.3

### Patch Changes

- 91e3b34: Fix duplicate pageview events and remote config compliance across framework SDKs.

  **@journium/angular (BREAKING):** Minimum Angular version bumped from 15 to 19. Migrated from `APP_INITIALIZER` multi-provider to `provideAppInitializer()`. Added `_frameworkHandlesPageviews` flag so remote config `autoTrackPageviews: false` is respected. NavigationEnd handler now checks effective options at event time.

  **@journium/nextjs:** Fixed spurious pageview emission when remote config toggles `autoTrackPageviews` from false to true without navigation. Replaced `autoTrackPageviews` object-form override with `_frameworkHandlesPageviews` flag. Removed `effectiveOptions` from outer tracker effect deps to prevent TrackerImpl remounting on config changes.

  **@journium/js:** Added `_frameworkHandlesPageviews` support to `resolvePageviewOptions` — disables built-in pageview tracking without modifying `autoTrackPageviews`.

  **@journium/core:** Added `_frameworkHandlesPageviews` internal field to `JourniumLocalOptions`.

- Updated dependencies [91e3b34]
  - @journium/core@1.2.2

## 1.2.2

### Patch Changes

- 1817127: Update docs

## 1.2.1

### Patch Changes

- c296fb1: Fix release
- Updated dependencies [c296fb1]
  - @journium/core@1.2.1

## 1.2.0

### Minor Changes

- 2b6c9a1: Added periodic fetching of remote options. Added support for remotely stopping/pausing event ingestion.

### Patch Changes

- Updated dependencies [2b6c9a1]
  - @journium/core@1.2.0

## 1.1.1

### Patch Changes

- 919d983: Added support for CDN script based installation. Updated docs for cdn script based installation. Simplified JS SDK's exposed APIs.
- Updated dependencies [919d983]
  - @journium/core@1.1.1

## 1.1.0

### Minor Changes

- 3659c54: Eliminated use of default configs. Made remote config prerequisites for sdk initialisation. Removed unused options.

### Patch Changes

- Updated dependencies [3659c54]
  - @journium/core@1.1.0

## 1.0.7

### Patch Changes

- 75b2e5f: Remote config changes for autocapture settings (autoTrackPageviews, captureClicks, captureFormSubmits, etc.) were not applied after SDK initialization. This fix ensures remote config changes are respected immediately, restoring the intended remote control functionality.

## 1.0.6

### Patch Changes

- bfdfb5f: Added Logger in core sdk
- Updated dependencies [bfdfb5f]
  - @journium/core@1.0.4

## 1.0.5

### Patch Changes

- e091a1d: Comments added.

## 1.0.4

### Patch Changes

- bb2cab6: This is sample change made. No functionality is updated, added or removed.
- 83ae866: Refactoring

## 1.0.3

### Patch Changes

- b0d8841: This is sample changelog. This is the first automated publish of sdks.
- Updated dependencies [b0d8841]
  - @journium/core@1.0.3

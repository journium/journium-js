# @journium/nextjs

## 1.4.1

### Patch Changes

- Updated dependencies [decb8d8]
  - @journium/js@1.3.1
  - @journium/core@1.3.1
  - @journium/react@1.3.1

## 1.4.0

### Minor Changes

- 538eedf: Added SDK version in events. Added support for capturing data attributes of tags.

### Patch Changes

- Updated dependencies [538eedf]
  - @journium/react@1.3.0
  - @journium/js@1.3.0
  - @journium/core@1.3.0

## 1.3.0

### Minor Changes

- 91e3b34: Fix duplicate pageview events and remote config compliance across framework SDKs.

  **@journium/angular (BREAKING):** Minimum Angular version bumped from 15 to 19. Migrated from `APP_INITIALIZER` multi-provider to `provideAppInitializer()`. Added `_frameworkHandlesPageviews` flag so remote config `autoTrackPageviews: false` is respected. NavigationEnd handler now checks effective options at event time.

  **@journium/nextjs:** Fixed spurious pageview emission when remote config toggles `autoTrackPageviews` from false to true without navigation. Replaced `autoTrackPageviews` object-form override with `_frameworkHandlesPageviews` flag. Removed `effectiveOptions` from outer tracker effect deps to prevent TrackerImpl remounting on config changes.

  **@journium/js:** Added `_frameworkHandlesPageviews` support to `resolvePageviewOptions` — disables built-in pageview tracking without modifying `autoTrackPageviews`.

  **@journium/core:** Added `_frameworkHandlesPageviews` internal field to `JourniumLocalOptions`.

### Patch Changes

- Updated dependencies [91e3b34]
  - @journium/js@1.2.3
  - @journium/core@1.2.2
  - @journium/react@1.2.1

## 1.2.0

### Minor Changes

- 8030889: Fixed duplicate pageview events in NextJS SDK. Added comments in all SDKs.

### Patch Changes

- Updated dependencies [8030889]
  - @journium/react@1.2.0

## 1.1.4

### Patch Changes

- 1817127: Update docs
- Updated dependencies [1817127]
  - @journium/react@1.1.4
  - @journium/js@1.2.2

## 1.1.3

### Patch Changes

- c296fb1: Fix release
- Updated dependencies [c296fb1]
  - @journium/core@1.2.1
  - @journium/js@1.2.1
  - @journium/react@1.1.3

## 1.1.2

### Patch Changes

- Updated dependencies [2b6c9a1]
  - @journium/js@1.2.0
  - @journium/core@1.2.0
  - @journium/react@1.1.2

## 1.1.1

### Patch Changes

- Updated dependencies [919d983]
  - @journium/react@1.1.1
  - @journium/js@1.1.1
  - @journium/core@1.1.1

## 1.1.0

### Minor Changes

- 3659c54: Eliminated use of default configs. Made remote config prerequisites for sdk initialisation. Removed unused options.

### Patch Changes

- Updated dependencies [3659c54]
  - @journium/react@1.1.0
  - @journium/js@1.1.0
  - @journium/core@1.1.0

## 1.0.17

### Patch Changes

- bb95323: Fix auto-track updates for Next.js

## 1.0.16

### Patch Changes

- Updated dependencies [75b2e5f]
  - @journium/react@1.0.7
  - @journium/js@1.0.7

## 1.0.15

### Patch Changes

- c9cbf16: Override API Host via NEXT_PUBLIC_JOURNIUM_API_HOST environment variable in Next.js. This has lower precedence over direct config parameter.

## 1.0.14

### Patch Changes

- 1c8d92c: Added support for Next.js Pages Router
- 1c8d92c: Added dynamic router fixes

## 1.0.13

### Patch Changes

- c55a4a8: Added support for Next.js Pages Router

## 1.0.12

### Patch Changes

- Updated dependencies [bfdfb5f]
  - @journium/js@1.0.6
  - @journium/core@1.0.4
  - @journium/react@1.0.6

## 1.0.11

### Patch Changes

- Updated dependencies [e091a1d]
  - @journium/js@1.0.5
  - @journium/react@1.0.5

## 1.0.10

### Patch Changes

- Updated dependencies [bb2cab6]
- Updated dependencies [83ae866]
  - @journium/js@1.0.4
  - @journium/react@1.0.4

## 1.0.9

### Patch Changes

- b0d8841: This is sample changelog. This is the first automated publish of sdks.
- Updated dependencies [b0d8841]
  - @journium/react@1.0.3
  - @journium/js@1.0.3
  - @journium/core@1.0.3

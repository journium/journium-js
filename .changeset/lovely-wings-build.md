---
'@journium/angular': major
'@journium/nextjs': minor
'@journium/js': patch
'@journium/core': patch
---

Fix duplicate pageview events and remote config compliance across framework SDKs.

**@journium/angular (BREAKING):** Minimum Angular version bumped from 15 to 19. Migrated from `APP_INITIALIZER` multi-provider to `provideAppInitializer()`. Added `_frameworkHandlesPageviews` flag so remote config `autoTrackPageviews: false` is respected. NavigationEnd handler now checks effective options at event time.

**@journium/nextjs:** Fixed spurious pageview emission when remote config toggles `autoTrackPageviews` from false to true without navigation. Replaced `autoTrackPageviews` object-form override with `_frameworkHandlesPageviews` flag. Removed `effectiveOptions` from outer tracker effect deps to prevent TrackerImpl remounting on config changes.

**@journium/js:** Added `_frameworkHandlesPageviews` support to `resolvePageviewOptions` — disables built-in pageview tracking without modifying `autoTrackPageviews`.

**@journium/core:** Added `_frameworkHandlesPageviews` internal field to `JourniumLocalOptions`.

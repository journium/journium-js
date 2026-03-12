# React Version Compatibility

## Supported React Versions

`@journium/react` officially supports React versions **16.8.0 and above**.

### Why React 16.8.0+?

React 16.8.0 introduced **Hooks**, which are fundamental to our implementation.
The package uses:
- `useState` — managing analytics instance state
- `useEffect` — initialization and cleanup
- `useContext` — sharing the analytics instance across components
- `useCallback` — memoizing event tracking functions

## Tested Versions

| React Version | Status | Notes |
|--------------|--------|-------|
| **16.8.0** | Certified | Minimum supported version |
| **16.14.0** | Certified | Last React 16 release |
| **17.0.2** | Certified | React 17 stable |
| **18.x** | Certified | Latest React with concurrent features |

## API Entry Point

### Provider + hooks

```tsx
// app.tsx
import { JourniumProvider } from '@journium/react';

export default function App() {
  return (
    <JourniumProvider config={{ publishableKey: 'your-key' }}>
      <YourApp />
    </JourniumProvider>
  );
}
```

### Hooks

```tsx
import {
  useJournium,        // access the analytics instance
  useTrackEvent,      // track custom events
  useIdentify,        // identify users
  useReset,           // reset analytics state
  useTrackPageview,   // manual pageview tracking
  useAutoTrackPageview, // automatic pageview on mount/dep change
  useAutocapture,     // start/stop autocapture
} from '@journium/react';
```

All hooks must be used inside a `<JourniumProvider>` — calling them outside
the provider throws `"useJournium must be used within a JourniumProvider"`.

## Compatibility Features

### React 16.8 - 16.14
- All hooks work correctly
- Context API fully supported
- No concurrent features required
- Compatible with class components via `Context.Consumer`

### React 17.x
- New JSX Transform supported
- Event delegation changes handled
- No breaking changes from 16.x

### React 18.x
- Concurrent rendering compatible
- Automatic batching supported
- StrictMode double-invoke effects handled correctly
- Transition API compatible when used

## Running Compatibility Tests

### Local Testing

```bash
# All versions
pnpm test:compat

# Specific version
pnpm test:compat:16.8   # React 16.8.0
pnpm test:compat:16.14  # React 16.14.0
pnpm test:compat:17     # React 17.0.2
pnpm test:compat:18     # React 18.x
```

### CI Testing

Compatibility tests run automatically on:
- Every pull request touching `packages/journium-react/**`
- Commits to `main` or `develop`
- Manual workflow dispatch

See [.github/workflows/react-compatibility.yml](../../.github/workflows/react-compatibility.yml)

## Test Suite

The compatibility test suite (`test-compat/test-suite/compatibility.test.tsx`) uses
`@testing-library/react` with `render` + `screen` — no browser required.

### Suite 1 — `JourniumProvider`
- Renders children correctly
- Initializes analytics instance
- Propagates config to children
- Cleans up on unmount without throwing

### Suite 2 — `useJournium`
- Throws when called outside provider
- Returns analytics instance inside provider

### Suite 3 — Core tracking hooks
- `useTrackEvent` — tracks events; handles calls before analytics ready
- `useIdentify` — identifies users
- `useReset` — resets analytics state
- `useTrackPageview` — manual pageview tracking

### Suite 4 — Advanced hooks
- `useAutoTrackPageview` — auto-tracks on mount; re-tracks when deps change
- `useAutocapture` — `startAutocapture` / `stopAutocapture` do not throw

### Suite 5 — Integration + React version specific
- Multiple hooks used together
- Concurrent features (React 18+)
- Works with React StrictMode
- Rapid re-renders
- Nested providers

## TypeScript Support

| TypeScript | React |
|-----------|-------|
| >= 4.5    | 16.8.0+ |
| >= 4.5    | 17.x    |
| >= 4.9    | 18.x    |

## Known Limitations

### React < 16.8.0
Not supported. Hooks do not exist in older versions; use `@journium/js` directly.

### React Server Components (RSC)
`@journium/react` is designed for client-side use. For Next.js App Router with RSC:
- Use `@journium/nextjs` (recommended)
- Or mark components using `@journium/react` with `'use client'`

## Getting Help

Report issues at [github.com/journium/journium-js/issues](https://github.com/journium/journium-js/issues)
including React version, `@journium/react` version, and a minimal reproduction.

---

**Last Updated**: March 2026
**Tested Versions**: 16.8.0, 16.14.0, 17.0.2, 18.0.0, 18.2.0, 18.3.1

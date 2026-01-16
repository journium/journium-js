# React Version Compatibility

## Supported React Versions

`@journium/react` officially supports React versions **16.8.0 and above**.

### Why React 16.8.0+?

React 16.8.0 introduced **Hooks**, which are fundamental to our implementation. The package uses:
- `useState` - For managing analytics instance state
- `useEffect` - For initialization and cleanup
- `useContext` - For sharing analytics instance across components
- `useCallback` - For memoizing event tracking functions

## Tested Versions

We actively test compatibility with the following React versions:

| React Version | Status | Notes |
|--------------|--------|-------|
| **16.8.0** | ✅ Certified | Minimum supported version |
| **16.14.0** | ✅ Certified | Last React 16 release |
| **17.0.2** | ✅ Certified | React 17 stable |
| **18.x** | ✅ Certified | Latest React with concurrent features |

### Testing Frequency

- **CI/CD**: Every commit and pull request
- **Manual**: Before each release
- **Versions**: 6+ versions tested per run

## Compatibility Features

### React 16.8 - 16.14
- ✅ All hooks work correctly
- ✅ Context API fully supported
- ✅ No concurrent features required
- ✅ Compatible with Class Components via Context Consumer

### React 17.x
- ✅ New JSX Transform supported
- ✅ Event delegation changes handled
- ✅ No breaking changes from 16.x
- ✅ Full backward compatibility

### React 18.x
- ✅ Concurrent rendering compatible
- ✅ Automatic batching supported
- ✅ StrictMode effects handling
- ✅ No warnings in development mode
- ✅ Transition API compatible (when used)

## Known Limitations

### React Versions < 16.8.0
**Not Supported** - These versions don't include Hooks, which are essential to our implementation.

If you need to use React < 16.8.0, please use the vanilla JavaScript SDK (`@journium/js`) directly.

### React Server Components (RSC)
Currently, `@journium/react` is designed for client-side use. For Next.js App Router with RSC:
- Use `@journium/nextjs` package (recommended)
- Or mark components using `@journium/react` with `'use client'` directive

## TypeScript Support

TypeScript types are compatible with:
- `@types/react` >= 16.8.0
- TypeScript >= 4.5

```typescript
import { JourniumProvider, useJournium } from '@journium/react';
// Full type safety and IntelliSense support
```

## Running Compatibility Tests

### Local Testing

```bash
# Test all versions
pnpm test:compat

# Test specific version
pnpm test:compat:16.8   # React 16.8.0
pnpm test:compat:16.14  # React 16.14.0
pnpm test:compat:17     # React 17.0.2
pnpm test:compat:18     # React 18.x
```

### CI Testing

Compatibility tests run automatically on:
- Every pull request
- Commits to main branch
- Manual workflow dispatch

See [.github/workflows/react-compatibility.yml](../../.github/workflows/react-compatibility.yml)

## Compatibility Test Suite

Our comprehensive test suite verifies:

### Core Functionality
- ✅ Provider initialization and mounting
- ✅ Analytics instance creation
- ✅ Context propagation to children
- ✅ Cleanup on unmount
- ✅ No memory leaks

### All Hooks
- ✅ `useJournium` - Access analytics instance
- ✅ `useTrackEvent` - Track custom events
- ✅ `useIdentify` - Identify users
- ✅ `useReset` - Reset analytics state
- ✅ `useTrackPageview` - Manual pageview tracking
- ✅ `useAutoTrackPageview` - Automatic pageview tracking
- ✅ `useAutocapture` - Autocapture controls

### Edge Cases
- ✅ Rapid re-renders
- ✅ Multiple effect runs (StrictMode)
- ✅ Hooks called before analytics ready
- ✅ Provider unmount/remount cycles
- ✅ Concurrent rendering (React 18+)

### Integration
- ✅ Multiple hooks used together
- ✅ Works with React Router
- ✅ Works with Next.js Pages Router
- ✅ Works with other context providers

## Migration Guide

### From React < 16.8

If you're upgrading from an older React version:

1. **Update React**:
   ```bash
   npm install react@^18.0.0 react-dom@^18.0.0
   ```

2. **Remove class components using analytics** (if any):
   ```javascript
   // Before (Class Component)
   class MyComponent extends React.Component {
     componentDidMount() {
       // Manual analytics setup
     }
   }
   
   // After (Functional Component with Hooks)
   function MyComponent() {
     const { analytics } = useJournium();
     useEffect(() => {
       // Analytics automatically available
     }, [analytics]);
   }
   ```

3. **Test thoroughly** before deploying

### From Other Analytics SDKs

If you're migrating from another analytics provider:

1. **Wrap app with JourniumProvider**:
   ```tsx
   <JourniumProvider config={journiumConfig}>
     <App />
   </JourniumProvider>
   ```

2. **Replace tracking calls**:
   ```typescript
   // Other SDK
   analytics.track('event_name', { prop: 'value' });
   
   // @journium/react
   const trackEvent = useTrackEvent();
   trackEvent('event_name', { prop: 'value' });
   ```

3. **Update user identification**:
   ```typescript
   // Other SDK
   analytics.identify('user-123', { name: 'John' });
   
   // @journium/react
   const identify = useIdentify();
   identify('user-123', { name: 'John' });
   ```

## Performance Considerations

### React 16.x & 17.x
- Synchronous rendering
- Effects run after paint
- Standard event batching

### React 18.x
- Automatic batching (better performance)
- Concurrent rendering support
- Effects may run multiple times in StrictMode

**Optimization Tips**:
- Use `useCallback` for event handlers (we do this internally)
- Memoize event properties when possible
- Avoid creating new objects in render

## Troubleshooting

### "useJournium must be used within a JourniumProvider"

**Cause**: Hook used outside provider context

**Solution**: Ensure component is wrapped in `<JourniumProvider>`

```tsx
// ❌ Wrong
function App() {
  const { analytics } = useJournium(); // Error!
  return <div>...</div>;
}

// ✅ Correct
function App() {
  return (
    <JourniumProvider config={config}>
      <MyComponent /> {/* Can use hooks here */}
    </JourniumProvider>
  );
}
```

### Type errors with @types/react

**Cause**: Mismatched React types version

**Solution**: Ensure `@types/react` matches your React version

```bash
# For React 16.x
npm install -D @types/react@^16.14.0

# For React 17.x
npm install -D @types/react@^17.0.0

# For React 18.x
npm install -D @types/react@^18.0.0
```

### Hooks running multiple times in development

**Cause**: React 18 StrictMode intentionally runs effects twice

**Solution**: This is expected behavior and won't happen in production

```tsx
// This is normal in React 18 StrictMode
useEffect(() => {
  console.log('This logs twice in dev, once in prod');
}, []);
```

### Concurrent rendering issues (React 18+)

**Cause**: State updates not batched correctly

**Solution**: Our hooks handle this automatically, but ensure you're using latest version

## Getting Help

### Report Compatibility Issues

If you find a compatibility issue:

1. Check [existing issues](https://github.com/journium/journium-js/issues)
2. Create a new issue with:
   - React version
   - `@journium/react` version
   - Minimal reproduction
   - Error messages

### Contributing

Help us test more versions:

1. Add test cases to `test-compat/test-suite/`
2. Update test scripts if needed
3. Run tests locally
4. Submit PR with results

## Version Support Policy

| Status | Support Level | Duration |
|--------|--------------|----------|
| ✅ **Active** | Full support & testing | React 16.8+ |
| ⚠️ **Maintenance** | Bug fixes only | TBD |
| ❌ **Unsupported** | No support | React < 16.8 |

We commit to supporting:
- Current React major version (18.x)
- Previous major version (17.x)
- React 16.8+ as long as significant usage exists

## Future Compatibility

### React 19 (Upcoming)

We're monitoring React 19 development and will:
- Test against release candidates
- Update as needed before stable release
- Maintain backward compatibility

### Deprecated APIs

We don't use any deprecated React APIs:
- ✅ No legacy context
- ✅ No string refs
- ✅ No deprecated lifecycle methods
- ✅ Modern event system only

## Additional Resources

- [Test Suite Documentation](test-compat/README.md)
- [GitHub Actions Workflow](../../.github/workflows/react-compatibility.yml)
- [React Versions Documentation](https://react.dev/versions)
- [React 18 Upgrade Guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)

---

**Last Updated**: January 2026  
**Tested Versions**: 16.8.0, 16.14.0, 17.0.2, 18.0.0, 18.2.0, 18.3.1

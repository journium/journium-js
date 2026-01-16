# React Version Compatibility Testing Guide

This guide provides step-by-step instructions for testing `@journium/react` compatibility with different React versions.

## Quick Start

### Run All Compatibility Tests

```bash
cd packages/journium-react
pnpm build
pnpm test:compat
```

This will test against React 16.8.0, 16.14.0, 17.0.2, and 18.x sequentially.

### Run Individual Version Tests

```bash
# Test specific React version
pnpm test:compat:16.8   # React 16.8.0
pnpm test:compat:16.14  # React 16.14.0
pnpm test:compat:17     # React 17.0.2
pnpm test:compat:18     # React 18.x
```

## Detailed Testing Process

### 1. Prerequisites

Before running compatibility tests:

```bash
# Install dependencies
pnpm install

# Build the package
cd packages/journium-react
pnpm build
```

**Important**: The package must be built before testing, as the scripts install the built package.

### 2. Understanding the Test Structure

```
packages/journium-react/
├── test-compat/
│   ├── test-all.sh           # Run all versions
│   ├── test-react-16.8.sh    # Test React 16.8.0
│   ├── test-react-16.14.sh   # Test React 16.14.0
│   ├── test-react-17.sh      # Test React 17.0.2
│   ├── test-react-18.sh      # Test React 18.x
│   ├── test-suite/
│   │   ├── setup.ts          # Jest setup
│   │   └── compatibility.test.tsx  # Test cases
│   └── README.md             # Documentation
```

### 3. How the Tests Work

Each test script:

1. **Creates isolated environment**: Uses a temporary directory to avoid conflicts
2. **Installs specific React version**: Ensures exact version being tested
3. **Links local package**: Tests your built `@journium/react` package
4. **Copies test suite**: Runs comprehensive compatibility tests
5. **Reports results**: Clear success/failure messages
6. **Cleans up**: Removes temporary files automatically

### 4. Reading Test Output

#### Successful Test Output

```bash
🧪 Testing @journium/react with React 16.8.0...
📦 Setting up test environment...
📥 Installing React 16.8.0 and dependencies...
🔗 Linking @journium/react package...
📋 Copying test files...
▶️  Running compatibility tests...

 PASS  tests/compatibility.test.tsx
  React Compatibility Tests
    JourniumProvider
      ✓ should render children correctly (45ms)
      ✓ should initialize analytics instance (123ms)
      ...
    
✅ React 16.8.0 compatibility test passed!
```

#### Failed Test Output

```bash
🧪 Testing @journium/react with React 17.0.2...
...
▶️  Running compatibility tests...

 FAIL  tests/compatibility.test.tsx
  React Compatibility Tests
    useTrackEvent Hook
      ✗ should track events correctly (156ms)
      
        Error: Expected function to be called
        
❌ React 17.0.2 compatibility test failed!
```

### 5. Test Coverage

The compatibility test suite verifies:

#### Provider Tests
- ✅ Renders children correctly
- ✅ Initializes analytics instance
- ✅ Provides config to children
- ✅ Cleans up on unmount
- ✅ No memory leaks

#### Hook Tests
- ✅ `useJournium` - Returns analytics instance
- ✅ `useTrackEvent` - Tracks custom events
- ✅ `useIdentify` - Identifies users
- ✅ `useReset` - Resets analytics
- ✅ `useTrackPageview` - Tracks pageviews
- ✅ `useAutoTrackPageview` - Auto-tracks on mount
- ✅ `useAutocapture` - Controls autocapture

#### Integration Tests
- ✅ Multiple hooks working together
- ✅ Rapid re-renders
- ✅ Nested providers
- ✅ StrictMode compatibility

#### React Version Specific
- ✅ Concurrent features (React 18+)
- ✅ Automatic batching (React 18+)
- ✅ Legacy event system (React 16-17)

### 6. Adding New Test Cases

To add new compatibility tests:

```typescript
// packages/journium-react/test-compat/test-suite/compatibility.test.tsx

describe('My New Feature', () => {
  test('should work across all React versions', async () => {
    const TestComponent = () => {
      const { analytics } = useJournium();
      // Your test logic here
      return <div>Test</div>;
    };

    render(
      <JourniumProvider config={mockConfig}>
        <TestComponent />
      </JourniumProvider>
    );

    // Assertions
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
```

### 7. Troubleshooting

#### "Package not found" Error

**Cause**: Package not built before testing

**Solution**:
```bash
cd packages/journium-react
pnpm build
pnpm test:compat
```

#### "Permission denied" Error

**Cause**: Scripts not executable

**Solution**:
```bash
chmod +x packages/journium-react/test-compat/*.sh
```

#### Tests Pass Locally but Fail in CI

**Possible causes**:
1. Different Node.js version
2. Missing build step
3. Dependency version mismatch

**Solution**: Check CI logs and ensure:
- Same Node.js version locally and in CI
- Build runs before tests
- Dependencies are locked (pnpm-lock.yaml)

#### React Version Not Installing

**Cause**: Network issues or invalid version

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try again
pnpm test:compat:16.8
```

### 8. Testing Against New React Versions

To test against a new React version (e.g., React 19):

1. **Create new test script**:
```bash
cp test-compat/test-react-18.sh test-compat/test-react-19.sh
```

2. **Update version in script**:
```bash
# Edit test-react-19.sh
# Change: "react": "^18.0.0" to "react": "^19.0.0"
```

3. **Update test-all.sh**:
```bash
# Add to test-all.sh:
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "$SCRIPT_DIR/test-react-19.sh"; then
  PASSED_TESTS+=("React 19.x")
else
  FAILED_TESTS+=("React 19.x")
fi
```

4. **Update CI workflow**:
```yaml
# .github/workflows/react-compatibility.yml
matrix:
  react-version:
    - '16.8.0'
    - '16.14.0'
    - '17.0.2'
    - '18.3.1'
    - '19.0.0'  # Add new version
```

5. **Test locally first**:
```bash
pnpm build
./test-compat/test-react-19.sh
```

### 9. Continuous Integration

#### GitHub Actions Workflow

Tests run automatically on:
- **Pull Requests**: Tests all versions
- **Commits to main**: Tests all versions
- **Manual Trigger**: Via GitHub UI

#### Viewing CI Results

1. Go to [Actions tab](https://github.com/journium/journium-js/actions)
2. Click on "React Version Compatibility Tests"
3. View matrix results for each version
4. Check job summary for detailed report

#### CI Test Matrix

The CI runs tests in parallel against:
- React 16.8.0
- React 16.14.0
- React 17.0.2
- React 18.0.0
- React 18.2.0
- React 18.3.1

Each test runs independently, so one failure doesn't stop others.

### 10. Manual Testing

For manual integration testing with real apps:

#### Create Test App

```bash
# React 18 (latest)
npx create-react-app test-app --template typescript
cd test-app

# Install @journium/react
npm install /path/to/packages/journium-react

# Test in app
npm start
```

#### Test with Specific React Version

```bash
# Create app with specific version
npx create-react-app test-app --template typescript
cd test-app

# Downgrade to specific React version
npm install react@16.14.0 react-dom@16.14.0 @types/react@16.14.0

# Install @journium/react
npm install /path/to/packages/journium-react

# Test
npm start
```

### 11. Certification Checklist

Before certifying a React version:

- [ ] All automated tests pass
- [ ] Manual testing in sample app
- [ ] TypeScript types work correctly
- [ ] No console warnings/errors
- [ ] Performance is acceptable
- [ ] Works in production build
- [ ] StrictMode compatible
- [ ] No memory leaks
- [ ] Documentation updated
- [ ] COMPATIBILITY.md updated

### 12. Reporting Issues

If you find compatibility issues:

1. **Gather information**:
   - React version
   - `@journium/react` version
   - Node.js version
   - Error messages
   - Stack traces

2. **Create minimal reproduction**:
```tsx
// Minimal failing example
import { JourniumProvider } from '@journium/react';

function App() {
  return (
    <JourniumProvider config={{ projectApiKey: 'test' }}>
      {/* Your failing component */}
    </JourniumProvider>
  );
}
```

3. **Report on GitHub**:
   - Use "Bug Report" template
   - Tag with "compatibility"
   - Include reproduction steps

### 13. Best Practices

#### Before Making Changes
```bash
# Always test current state first
pnpm test:compat
```

#### After Making Changes
```bash
# Rebuild and test
pnpm build
pnpm test:compat
```

#### Before Releasing
```bash
# Full test suite
pnpm build
pnpm test        # Unit tests
pnpm test:compat # Compatibility tests
pnpm typecheck   # TypeScript
pnpm lint        # Linting
```

#### During Development
```bash
# Test specific version you're working with
pnpm build
pnpm test:compat:18  # If developing with React 18
```

### 14. Performance Testing

To test performance across versions:

```typescript
// Add to compatibility.test.tsx
test('should have acceptable performance', async () => {
  const start = performance.now();
  
  render(
    <JourniumProvider config={mockConfig}>
      <TestComponent />
    </JourniumProvider>
  );
  
  await waitFor(() => {
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });
  
  const end = performance.now();
  const duration = end - start;
  
  // Should initialize in under 100ms
  expect(duration).toBeLessThan(100);
});
```

### 15. Resources

- [React Versions](https://react.dev/versions)
- [React 18 Upgrade Guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

## Quick Reference

### Commands
```bash
pnpm test:compat         # Test all versions
pnpm test:compat:16.8    # Test React 16.8
pnpm test:compat:16.14   # Test React 16.14
pnpm test:compat:17      # Test React 17
pnpm test:compat:18      # Test React 18
```

### Files
- `test-compat/*.sh` - Test scripts
- `test-compat/test-suite/*.tsx` - Test cases
- `COMPATIBILITY.md` - Compatibility documentation
- `.github/workflows/react-compatibility.yml` - CI workflow

### Support
- [GitHub Issues](https://github.com/journium/journium-js/issues)
- [Discord Community](https://journium.app/discord)

# React Version Compatibility Testing

This directory contains scripts and test suites to verify `@journium/react` compatibility with different React versions.

## Overview

The `@journium/react` package declares `react >= 16.8.0` as a peer dependency. This test suite verifies compatibility across major React versions to ensure the package works correctly.

## Tested React Versions

| React Version | Status | Notes |
|--------------|--------|-------|
| 16.8.0 | ✅ | Minimum supported version (Hooks introduced) |
| 16.14.0 | ✅ | Last React 16 release |
| 17.0.2 | ✅ | React 17 major version |
| 18.x | ✅ | Latest React with concurrent features |

## Local Testing

### Prerequisites

- Node.js 16+ installed
- `@journium/react` package built locally
- Bash shell (macOS/Linux/WSL)

### Running Tests

#### Test All Versions

```bash
cd packages/journium-react/test-compat
./test-all.sh
```

This will sequentially test against all supported React versions and provide a summary report.

#### Test Individual Versions

```bash
# Test React 16.8.0 (minimum version)
./test-react-16.8.sh

# Test React 16.14.0 (last React 16)
./test-react-16.14.sh

# Test React 17.0.2
./test-react-17.sh

# Test React 18.x (latest)
./test-react-18.sh
```

### How It Works

Each test script:
1. Creates a temporary isolated environment
2. Installs the specific React version and dependencies
3. Links the local `@journium/react` package
4. Copies and runs the compatibility test suite
5. Cleans up temporary files
6. Reports success or failure

## Test Suite

The `test-suite/` directory contains comprehensive compatibility tests that verify:

- ✅ Provider initialization and mounting
- ✅ Context propagation
- ✅ All hooks functionality
- ✅ Analytics instance creation
- ✅ Event tracking
- ✅ Pageview tracking
- ✅ Autocapture features
- ✅ Provider cleanup on unmount
- ✅ No memory leaks
- ✅ TypeScript type compatibility

## CI/CD Integration

These tests are also run automatically in CI via GitHub Actions on:
- Every pull request
- Commits to main branch
- Manual workflow dispatch

See `.github/workflows/react-compatibility.yml` for CI configuration.

## Adding New Test Cases

To add new compatibility tests:

1. Add test cases to `test-suite/compatibility.test.tsx`
2. Run locally: `./test-all.sh`
3. Verify all versions pass
4. Commit changes

## Troubleshooting

### Tests Fail on Specific Version

Check the error output to identify:
- API incompatibilities
- Type mismatches
- Breaking changes in React

### Permission Denied

Make scripts executable:
```bash
chmod +x *.sh
```

### Build Required

Ensure the package is built before testing:
```bash
cd packages/journium-react
pnpm build
```

## Manual Testing

For manual integration testing with specific React versions:

```bash
# Create test app
npx create-react-app test-app --template typescript
cd test-app

# Install specific React version
npm install react@16.8.0 react-dom@16.8.0

# Install @journium/react
npm install /path/to/packages/journium-react

# Test in your app
```

## Reporting Issues

If you find compatibility issues:

1. Note the React version
2. Include error messages
3. Provide reproduction steps
4. Open an issue on GitHub

## Maintenance

Update this test suite when:
- New React versions are released
- New features are added to `@journium/react`
- Peer dependency requirements change
- Known issues are discovered

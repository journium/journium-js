# Quick Start: React Compatibility Testing

## 🚀 Run Tests Now

### Test All React Versions
```bash
cd packages/journium-react
pnpm build
pnpm test:compat
```

Expected output:
```
🚀 Testing @journium/react compatibility with all React versions...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Testing @journium/react with React 16.8.0...
✅ React 16.8.0 compatibility test passed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Testing @journium/react with React 16.14.0...
✅ React 16.14.0 compatibility test passed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Testing @journium/react with React 17.0.2...
✅ React 17.0.2 compatibility test passed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Testing @journium/react with React 18.x...
✅ React 18.x compatibility test passed!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 COMPATIBILITY TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PASSED (4):
   ✓ React 16.8.0
   ✓ React 16.14.0
   ✓ React 17.0.2
   ✓ React 18.x

🎉 All compatibility tests passed!
```

### Test Specific Version
```bash
pnpm test:compat:16.8    # React 16.8.0 (minimum)
pnpm test:compat:16.14   # React 16.14.0
pnpm test:compat:17      # React 17.0.2
pnpm test:compat:18      # React 18.x (latest)
```

## 📋 What Gets Tested

Each test verifies:
- ✅ Provider initialization and cleanup
- ✅ All hooks (`useJournium`, `useTrackEvent`, `useIdentify`, etc.)
- ✅ Event tracking functionality
- ✅ Pageview tracking
- ✅ Autocapture features
- ✅ No memory leaks
- ✅ StrictMode compatibility
- ✅ Rapid re-renders
- ✅ Multiple hooks integration

## ⚙️ How It Works

1. **Creates isolated environment** - Temporary directory for each test
2. **Installs specific React version** - Exact version from test script
3. **Links your package** - Tests your local build
4. **Runs comprehensive tests** - 30+ test cases
5. **Reports results** - Clear pass/fail status
6. **Cleans up** - Removes temporary files

## 🔄 CI/CD Integration

Tests run automatically on:
- ✅ Every pull request
- ✅ Commits to main/develop
- ✅ Manual workflow dispatch

View results: [GitHub Actions](https://github.com/journium/journium-js/actions)

## 📚 Documentation

- **Full Testing Guide**: [TESTING_GUIDE.md](../TESTING_GUIDE.md)
- **Compatibility Info**: [COMPATIBILITY.md](../COMPATIBILITY.md)
- **Test Suite Details**: [README.md](README.md)

## 🛠️ Troubleshooting

### Permission Denied
```bash
chmod +x test-compat/*.sh
```

### Package Not Found
```bash
# Build first!
pnpm build
```

### Tests Failing
Check the output for specific errors, then see [TESTING_GUIDE.md](../TESTING_GUIDE.md)

## 🎯 Next Steps

1. **Run tests locally** to verify current compatibility
2. **Add to your workflow** before each release
3. **Monitor CI results** for automatic testing
4. **Update docs** when adding new React versions

---

**Need help?** Open an issue or check the [full documentation](../TESTING_GUIDE.md).

# Journium Release Scripts

Automated package management and publishing tools for the Journium JavaScript SDK monorepo.

## Overview

This directory contains scripts to automate the complete release process for all Journium packages:

1. **Version Bumping** - Increment versions across all packages and update internal dependencies
2. **Building** - Clean and build all packages in dependency order
3. **Testing** - Run comprehensive test suite
4. **Publishing** - Publish packages to npm in correct order with proper authentication

## Scripts

### 🚀 `release.js` - Main Orchestration Script

The primary script that handles the complete release workflow.

```bash
# Interactive release (prompts for bump type)
node scripts/release.js

# Direct release with specific bump type
node scripts/release.js patch
node scripts/release.js minor
node scripts/release.js major
node scripts/release.js prerelease

# Dry run (safe to test)
node scripts/release.js patch --dry-run

# Skip build (if already built)
node scripts/release.js patch --skip-build

# Skip tests (if already tested)
node scripts/release.js patch --skip-tests

# Force publish (override existing versions)
node scripts/release.js patch --force

# Custom npm tag
node scripts/release.js prerelease --tag alpha
```

**What it does:**
1. ✅ Checks prerequisites (git status, npm auth, etc.)
2. 📊 Displays current package versions
3. 📝 Bumps versions across all packages
4. 📥 Installs dependencies
5. 🔨 Builds all packages
6. 🧪 Runs tests
7. 📤 Publishes to npm
8. 🏷️ Creates git tags
9. 📢 Shows next steps

### 📝 `bump-versions.js` - Version Management

Handles version increments and internal dependency updates.

```bash
# Interactive version selection
node scripts/bump-versions.js

# Direct version bump
node scripts/bump-versions.js patch
node scripts/bump-versions.js minor
node scripts/bump-versions.js major
node scripts/bump-versions.js prerelease
```

**Features:**
- 🔍 Analyzes current versions
- 📊 Shows before/after preview
- 🔗 Updates internal dependencies automatically
- ⚡ Respects workspace: syntax for monorepo
- 🛡️ Validates bump types

### 📤 `publish.js` - Build & Publish

Handles building and publishing packages to npm.

```bash
# Full build and publish
node scripts/publish.js

# Dry run (test without publishing)
node scripts/publish.js --dry-run

# Skip build step
node scripts/publish.js --skip-build

# Skip tests
node scripts/publish.js --skip-tests

# Force publish
node scripts/publish.js --force

# Custom npm tag
node scripts/publish.js --tag alpha
```

**Features:**
- 🔨 Clean builds in dependency order
- 🧪 Runs comprehensive tests
- 🔐 Verifies npm authentication
- 📦 Publishes with proper tags
- ⏱️ Rate limiting between publishes
- 📊 Detailed success/failure reporting

## Package Dependency Order

The scripts respect this dependency hierarchy:

```
1. @journium/core       (no dependencies)
2. journium-js          (depends on: core)
3. @journium/react      (depends on: core, journium-js)
4. @journium/nextjs     (depends on: core, journium-js, react)
```

## Bump Types

| Type | Description | Example |
|------|-------------|---------|
| `patch` | Bug fixes | `0.1.0` → `0.1.1` |
| `minor` | New features | `0.1.0` → `0.2.0` |
| `major` | Breaking changes | `0.1.0` → `1.0.0` |
| `prerelease` | Pre-release increment | `0.1.0-alpha.1` → `0.1.0-alpha.2` |
| `prepatch` | Pre-release patch | `0.1.0` → `0.1.1-alpha.0` |
| `preminor` | Pre-release minor | `0.1.0` → `0.2.0-alpha.0` |
| `premajor` | Pre-release major | `0.1.0` → `1.0.0-alpha.0` |

## Prerequisites

Before running any scripts, ensure:

### 1. Git Setup
```bash
# Working directory should be clean
git status

# Commit any pending changes
git add .
git commit -m "Prepare for release"
```

### 2. npm Authentication
```bash
# Login to npm
npm login

# Verify authentication
npm whoami

# Check access to @journium scope
npm access list packages
```

### 3. Node.js & Dependencies
```bash
# Node.js 18+ required
node --version

# Install dependencies
npm install
```

## Workflow Examples

### 📋 Standard Release Workflow

```bash
# 1. Prepare repository
git pull origin main
git status  # Ensure clean working directory

# 2. Run complete release
node scripts/release.js minor

# 3. Follow prompts and confirm changes

# 4. Verify published packages
npm view journium-js
npm view @journium/core
npm view @journium/react
```

### 🔍 Safe Testing Workflow

```bash
# 1. Test with dry run first
node scripts/release.js patch --dry-run

# 2. If satisfied, run actual release
node scripts/release.js patch
```

### ⚡ Quick Hotfix Workflow

```bash
# 1. Make your fixes and commit
git add .
git commit -m "fix: critical bug in tracking"

# 2. Patch release
node scripts/release.js patch

# 3. Verify deployment
npm view journium-js
```

### 🧪 Pre-release Workflow

```bash
# 1. Feature branch development
git checkout -b feature/new-feature
# ... develop feature ...
git commit -m "feat: add new feature"

# 2. Pre-release for testing
node scripts/release.js prerelease --tag alpha

# 3. Test the alpha version
npm install journium-js@alpha

# 4. When ready, merge and full release
git checkout main
git merge feature/new-feature
node scripts/release.js minor
```

## Troubleshooting

### ❌ Common Issues

#### npm Authentication Failed
```bash
# Solution
npm logout
npm login
```

#### Version Already Published
```bash
# Option 1: Use force flag (not recommended)
node scripts/release.js patch --force

# Option 2: Bump to next version
node scripts/release.js minor
```

#### Build Failures
```bash
# Clean and rebuild
npm run clean
npm install
npm run build

# Then try again
node scripts/publish.js --skip-build
```

#### Git Working Directory Not Clean
```bash
# Check what's uncommitted
git status

# Commit or stash changes
git add .
git commit -m "WIP: preparation for release"
# OR
git stash
```

#### Package Dependencies Out of Sync
```bash
# Reinstall all dependencies
rm -rf node_modules
rm -rf packages/*/node_modules
npm install

# Rebuild everything
npm run build
```

### 🔍 Debugging

#### Verbose npm Output
```bash
# Add npm debug flags for more info
npm config set loglevel verbose
node scripts/publish.js
npm config set loglevel warn  # Reset
```

#### Package-specific Issues
```bash
# Test individual package builds
cd packages/core
npm run build

cd packages/journium-js  
npm run build
```

#### Version Verification
```bash
# Check current versions
node -e "console.log(require('./packages/core/package.json').version)"
node -e "console.log(require('./packages/journium-js/package.json').version)"

# Check published versions
npm view @journium/core version
npm view journium-js version
```

## Advanced Usage

### 🔧 Custom Configurations

#### Environment Variables
```bash
# Custom npm registry
export NPM_CONFIG_REGISTRY=https://custom-registry.com/
node scripts/release.js patch

# Skip npm authentication check
export SKIP_NPM_AUTH=true
node scripts/release.js patch --dry-run
```

#### Git Hooks Integration
```bash
# Add to .git/hooks/pre-push
#!/bin/bash
echo "Running pre-push validation..."
node scripts/bump-versions.js patch --dry-run
```

### 📊 CI/CD Integration

#### GitHub Actions Example
```yaml
name: Release
on:
  workflow_dispatch:
    inputs:
      bump_type:
        description: 'Version bump type'
        required: true
        default: 'patch'
        type: choice
        options: ['patch', 'minor', 'major', 'prerelease']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm install
      
      - name: Release packages
        run: node scripts/release.js ${{ github.event.inputs.bump_type }}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### Manual Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No uncommitted changes
- [ ] npm authentication verified
- [ ] Branch is up to date with main

## Script Architecture

### 📁 File Structure
```
scripts/
├── README.md           # This documentation
├── release.js          # Main orchestration script
├── bump-versions.js    # Version management
└── publish.js          # Build and publish
```

### 🔄 Data Flow
```
release.js
├── 1. Prerequisites check
├── 2. Status display
├── 3. bump-versions.js execution
├── 4. publish.js execution
└── 5. Post-release actions

bump-versions.js
├── 1. Load package.json files
├── 2. Calculate new versions
├── 3. Update package versions
└── 4. Update internal dependencies

publish.js
├── 1. Install dependencies
├── 2. Build packages (in order)
├── 3. Run tests
└── 4. Publish to npm (in order)
```

### 🛡️ Safety Features
- ✅ Dry-run mode for safe testing
- ✅ Interactive confirmation prompts
- ✅ Git working directory checks
- ✅ npm authentication validation
- ✅ Dependency order enforcement
- ✅ Error recovery and rollback
- ✅ Detailed logging and progress tracking

## Support

### 📚 Resources
- [npm CLI Documentation](https://docs.npmjs.com/cli)
- [Semantic Versioning](https://semver.org/)
- [npm Publishing Guide](https://docs.npmjs.com/getting-started/publishing-npm-packages)

### 🐛 Issues
If you encounter issues with these scripts:

1. Check the troubleshooting section above
2. Verify prerequisites are met
3. Try with `--dry-run` first
4. Check npm and git authentication
5. Review error messages carefully

### 💡 Contributing
To improve these scripts:

1. Test changes with `--dry-run`
2. Update documentation
3. Add error handling
4. Consider backward compatibility
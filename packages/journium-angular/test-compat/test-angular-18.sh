#!/bin/bash
# Test @journium/angular compatibility with Angular 18.x

set -e

echo "Testing @journium/angular with Angular 18.x..."

# Save current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"

# Create temporary test directory
TEST_DIR=$(mktemp -d)
trap "rm -rf $TEST_DIR" EXIT

cd "$TEST_DIR"

echo "Setting up test environment..."

# Create package.json with Angular 18.x
cat > package.json <<'PKGJSON'
{
  "name": "angular-18-compat-test",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "jest"
  },
  "dependencies": {
    "@angular/common": "^18.0.0",
    "@angular/compiler": "^18.0.0",
    "@angular/core": "^18.0.0",
    "@angular/platform-browser": "^18.0.0",
    "@angular/platform-browser-dynamic": "^18.0.0",
    "@angular/router": "^18.0.0",
    "rxjs": "^7.8.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@types/jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "jest-preset-angular": "^14.0.0",
    "typescript": "~5.4.5"
  }
}
PKGJSON

# Build workspace dependencies first
echo "Building workspace dependencies..."
cd "$PACKAGE_DIR/../.."
pnpm --filter @journium/core build > /dev/null 2>&1
pnpm --filter @journium/js build > /dev/null 2>&1

# Install dependencies
echo "Installing Angular 18.x and dependencies..."
cd "$TEST_DIR"
npm install --no-audit --no-fund --legacy-peer-deps

# Pack the @journium/angular package using pnpm (handles workspace deps)
echo "Creating @journium/angular package tarball..."
cd "$PACKAGE_DIR"
PACKAGE_FILE=$(pnpm pack 2>&1 | grep -o '[^/]*\.tgz$')
PACKAGE_PATH="$PACKAGE_DIR/$PACKAGE_FILE"

# Install the packed package
echo "Installing @journium/angular..."
cd "$TEST_DIR"
npm install --no-save --no-audit --no-fund --legacy-peer-deps "$PACKAGE_PATH"

# Clean up package tarball
rm "$PACKAGE_PATH"

# Copy test files
echo "Copying test files..."
cp -r "$SCRIPT_DIR/test-suite" ./tests

# Create Jest config
cat > jest.config.js <<'JESTCFG'
module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.(ts|js|html|mjs)$': ['jest-preset-angular', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$'
    }]
  },
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@angular/|@journium/))'],
  moduleNameMapper: {
    '^@journium/angular/ngmodule$': '<rootDir>/node_modules/@journium/angular/dist/fesm2022/journium-angular-ngmodule.mjs',
    '^@journium/angular$': '<rootDir>/node_modules/@journium/angular/dist/fesm2022/journium-angular.mjs'
  }
};
JESTCFG

# Create tsconfig.spec.json
cat > tsconfig.spec.json <<'TSCONFIG'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "isolatedModules": true,
    "lib": ["ES2022", "dom"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": false,
    "types": ["jest", "node"]
  }
}
TSCONFIG

# Run tests
echo "Running compatibility tests..."
npm test

echo "Angular 18.x compatibility test passed!"

#!/bin/bash
# Test @journium/react compatibility with React 16.14.0 (last React 16 version)

set -e

echo "🧪 Testing @journium/react with React 16.14.0..."

# Save current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"

# Create temporary test directory
TEST_DIR=$(mktemp -d)
trap "rm -rf $TEST_DIR" EXIT

cd "$TEST_DIR"

echo "📦 Setting up test environment..."

# Create package.json with React 16.14.0
cat > package.json <<EOF
{
  "name": "react-16.14-compat-test",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "jest"
  },
  "dependencies": {
    "react": "16.14.0",
    "react-dom": "16.14.0"
  },
  "devDependencies": {
    "@types/react": "^16.14.0",
    "@types/react-dom": "^16.9.0",
    "@testing-library/react": "^9.5.0",
    "@testing-library/jest-dom": "^5.16.5",
    "typescript": "^4.9.0",
    "ts-jest": "^29.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
EOF

# Build dependencies first
echo "📦 Building workspace dependencies..."
cd "$PACKAGE_DIR/../.."
pnpm --filter @journium/core build > /dev/null 2>&1
pnpm --filter @journium/js build > /dev/null 2>&1

# Install dependencies first
echo "📥 Installing React 16.14.0 and dependencies..."
cd "$TEST_DIR"
npm install --no-audit --no-fund

# Pack the @journium/react package using pnpm (handles workspace deps)
echo "📦 Creating @journium/react package tarball..."
cd "$PACKAGE_DIR"
PACKAGE_FILE=$(pnpm pack 2>&1 | grep -o '[^/]*\.tgz$')
PACKAGE_PATH="$PACKAGE_DIR/$PACKAGE_FILE"

# Install the packed package
echo "🔗 Installing @journium/react..."
cd "$TEST_DIR"
npm install --no-save --no-audit --no-fund "$PACKAGE_PATH"

# Clean up package file
rm "$PACKAGE_PATH"

# Copy test files
echo "📋 Copying test files..."
cp -r "$SCRIPT_DIR/test-suite" ./tests

# Create Jest config
cat > jest.config.js <<EOF
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@journium/react$': '<rootDir>/node_modules/@journium/react'
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        module: 'commonjs',
        target: 'es5'
      }
    }
  }
};
EOF

# Run tests
echo "▶️  Running compatibility tests..."
npm test

echo "✅ React 16.14.0 compatibility test passed!"

#!/bin/bash
# Test @journium/react compatibility with all supported React versions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Testing @journium/react compatibility with all React versions..."
echo ""

# Track results
FAILED_TESTS=()
PASSED_TESTS=()

# Test React 16.8.0
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "$SCRIPT_DIR/test-react-16.8.sh"; then
  PASSED_TESTS+=("React 16.8.0")
else
  FAILED_TESTS+=("React 16.8.0")
fi
echo ""

# Test React 16.14.0
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "$SCRIPT_DIR/test-react-16.14.sh"; then
  PASSED_TESTS+=("React 16.14.0")
else
  FAILED_TESTS+=("React 16.14.0")
fi
echo ""

# Test React 17.0.2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "$SCRIPT_DIR/test-react-17.sh"; then
  PASSED_TESTS+=("React 17.0.2")
else
  FAILED_TESTS+=("React 17.0.2")
fi
echo ""

# Test React 18.x
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "$SCRIPT_DIR/test-react-18.sh"; then
  PASSED_TESTS+=("React 18.x")
else
  FAILED_TESTS+=("React 18.x")
fi
echo ""

# Print summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 COMPATIBILITY TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ${#PASSED_TESTS[@]} -gt 0 ]; then
  echo "✅ PASSED (${#PASSED_TESTS[@]}):"
  for test in "${PASSED_TESTS[@]}"; do
    echo "   ✓ $test"
  done
  echo ""
fi

if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
  echo "❌ FAILED (${#FAILED_TESTS[@]}):"
  for test in "${FAILED_TESTS[@]}"; do
    echo "   ✗ $test"
  done
  echo ""
  exit 1
else
  echo "🎉 All compatibility tests passed!"
  echo ""
  exit 0
fi

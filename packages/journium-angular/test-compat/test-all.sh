#!/bin/bash
# Test @journium/angular compatibility with all supported Angular versions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Testing @journium/angular compatibility with all Angular versions..."
echo ""

# Track results
FAILED_TESTS=()
PASSED_TESTS=()

# Test Angular 19.x
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "$SCRIPT_DIR/test-angular-19.sh"; then
  PASSED_TESTS+=("Angular 19.x")
else
  FAILED_TESTS+=("Angular 19.x")
fi
echo ""

# Test Angular 21.x
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "$SCRIPT_DIR/test-angular-21.sh"; then
  PASSED_TESTS+=("Angular 21.x")
else
  FAILED_TESTS+=("Angular 21.x")
fi
echo ""

# Print summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "COMPATIBILITY TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ${#PASSED_TESTS[@]} -gt 0 ]; then
  echo "PASSED (${#PASSED_TESTS[@]}):"
  for test in "${PASSED_TESTS[@]}"; do
    echo "   + $test"
  done
  echo ""
fi

if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
  echo "FAILED (${#FAILED_TESTS[@]}):"
  for test in "${FAILED_TESTS[@]}"; do
    echo "   x $test"
  done
  echo ""
  exit 1
else
  echo "All compatibility tests passed!"
  echo ""
  exit 0
fi

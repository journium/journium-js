// Setup file for Angular compatibility tests
// Supports jest-preset-angular v13 (Angular 15/16) and v14 (Angular 17+)
//
// jest-preset-angular v14 introduced setupZoneTestEnv() as the preferred API.
// v13 uses the legacy setup-jest import (which also requires platform-browser-dynamic).
// We try the modern API first and fall back to the legacy one.

try {
  // jest-preset-angular v14+ (Angular 17/18/19)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { setupZoneTestEnv } = require('jest-preset-angular/setup-env/zone');
  setupZoneTestEnv();
} catch {
  // jest-preset-angular v13 (Angular 15/16) — setupZoneTestEnv not available yet
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('jest-preset-angular/setup-jest');
}

// Mock fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
) as jest.Mock;

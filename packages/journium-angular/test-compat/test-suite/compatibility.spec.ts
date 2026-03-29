/**
 * Angular Version Compatibility Tests
 *
 * These tests verify that @journium/angular works correctly across
 * Angular versions 19+ using TestBed without DOM rendering.
 *
 * @journium/js is mocked to avoid async network calls and zone.js timer
 * pollution. The tests focus on Angular DI wiring: provider registration,
 * token resolution, and method signatures — not @journium/js internals.
 *
 * Important: @journium/angular ships two separate CJS bundles (index.cjs
 * and ngmodule.cjs). Each bundle inlines JourniumService, so the two class
 * objects are different references. Suite 1/3/5 inject via the index.cjs
 * token; Suite 2 injects via the ngmodule.cjs token.
 */

// Mock @journium/js before any imports so jest hoisting applies it to both
// @journium/angular entry points (index.cjs and ngmodule.cjs).
jest.mock('@journium/js', () => {
  const createMockAnalytics = () => ({
    track: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
    capturePageview: jest.fn(),
    startAutocapture: jest.fn(),
    stopAutocapture: jest.fn(),
    getEffectiveOptions: jest.fn(() => ({})),
    destroy: jest.fn(),
  });
  return { init: jest.fn(createMockAnalytics) };
});

import { TestBed } from '@angular/core/testing';
import { VERSION } from '@angular/core';
import { provideRouter } from '@angular/router';

// index.cjs — standalone DI entry point
import { JourniumService, provideJournium, withJourniumRouter } from '@journium/angular';

// ngmodule.cjs — NgModule entry point.
// JourniumModule.forRoot() registers its own copy of JourniumService (inlined
// in ngmodule.cjs). Import it under an alias so Suite 2 injects the correct token.
import {
  JourniumModule,
  JourniumService as NgModuleJourniumService,
} from '@journium/angular/ngmodule';

const mockConfig = {
  publishableKey: 'test-api-key',
};

describe('Angular Compatibility Tests', () => {
  // Suite 5 prelude: log Angular version in CI for visibility
  beforeAll(() => {
    console.log(`Running compatibility tests against Angular ${VERSION.full}`);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 1 — provideJournium() standalone pattern
  // ─────────────────────────────────────────────────────────────────────────
  describe('Suite 1 — provideJournium() standalone pattern', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideJournium(mockConfig)],
      });
    });

    it('JourniumService is injectable', () => {
      const service = TestBed.inject(JourniumService);
      expect(service).toBeDefined();
    });

    it('track() does not throw', () => {
      const service = TestBed.inject(JourniumService);
      expect(() => service.track('test_event', { prop: 'value' })).not.toThrow();
    });

    it('identify() does not throw', () => {
      const service = TestBed.inject(JourniumService);
      expect(() => service.identify('user-123', { name: 'Test User' })).not.toThrow();
    });

    it('reset() does not throw', () => {
      const service = TestBed.inject(JourniumService);
      expect(() => service.reset()).not.toThrow();
    });

    it('capturePageview() does not throw', () => {
      const service = TestBed.inject(JourniumService);
      expect(() => service.capturePageview({ page: '/test' })).not.toThrow();
    });

    it('startAutocapture() does not throw', () => {
      const service = TestBed.inject(JourniumService);
      expect(() => service.startAutocapture()).not.toThrow();
    });

    it('stopAutocapture() does not throw', () => {
      const service = TestBed.inject(JourniumService);
      expect(() => service.stopAutocapture()).not.toThrow();
    });

    it('getEffectiveOptions() returns an object', () => {
      const service = TestBed.inject(JourniumService);
      const options = service.getEffectiveOptions();
      expect(options).toBeDefined();
      expect(typeof options).toBe('object');
    });

    it('ngOnDestroy() does not throw', () => {
      const service = TestBed.inject(JourniumService);
      expect(() => service.ngOnDestroy()).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 2 — JourniumModule.forRoot() NgModule pattern
  //
  // JourniumModule.forRoot() uses JourniumService from ngmodule.cjs.
  // TestBed.inject must use the same token (NgModuleJourniumService).
  // ─────────────────────────────────────────────────────────────────────────
  describe('Suite 2 — JourniumModule.forRoot() NgModule pattern', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JourniumModule.forRoot(mockConfig)],
      });
    });

    it('JourniumService is injectable via NgModule', () => {
      const service = TestBed.inject(NgModuleJourniumService);
      expect(service).toBeDefined();
    });

    it('track() does not throw', () => {
      const service = TestBed.inject(NgModuleJourniumService);
      expect(() => service.track('ng_event', { source: 'ngmodule' })).not.toThrow();
    });

    it('identify() does not throw', () => {
      const service = TestBed.inject(NgModuleJourniumService);
      expect(() => service.identify('ng-user-456')).not.toThrow();
    });

    it('reset() does not throw', () => {
      const service = TestBed.inject(NgModuleJourniumService);
      expect(() => service.reset()).not.toThrow();
    });

    it('capturePageview() does not throw', () => {
      const service = TestBed.inject(NgModuleJourniumService);
      expect(() => service.capturePageview()).not.toThrow();
    });

    it('startAutocapture() does not throw', () => {
      const service = TestBed.inject(NgModuleJourniumService);
      expect(() => service.startAutocapture()).not.toThrow();
    });

    it('stopAutocapture() does not throw', () => {
      const service = TestBed.inject(NgModuleJourniumService);
      expect(() => service.stopAutocapture()).not.toThrow();
    });

    it('getEffectiveOptions() returns an object', () => {
      const service = TestBed.inject(NgModuleJourniumService);
      const options = service.getEffectiveOptions();
      expect(options).toBeDefined();
      expect(typeof options).toBe('object');
    });

    it('ngOnDestroy() does not throw', () => {
      const service = TestBed.inject(NgModuleJourniumService);
      expect(() => service.ngOnDestroy()).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 3 — withJourniumRouter() router integration
  // ─────────────────────────────────────────────────────────────────────────
  describe('Suite 3 — withJourniumRouter() router integration', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideJournium(mockConfig),
          provideRouter([]),
          withJourniumRouter(),
        ],
      });
    });

    it('JourniumService is injectable alongside router integration', () => {
      const service = TestBed.inject(JourniumService);
      expect(service).toBeDefined();
    });

    it('track() does not throw with router integration configured', () => {
      const service = TestBed.inject(JourniumService);
      expect(() => service.track('router_event')).not.toThrow();
    });

    it('capturePageview() does not throw with router integration configured', () => {
      const service = TestBed.inject(JourniumService);
      expect(() => service.capturePageview()).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 4 — Subpath export resolution
  // ─────────────────────────────────────────────────────────────────────────
  describe('Suite 4 — Subpath export resolution', () => {
    it('JourniumService and provideJournium resolve from @journium/angular', () => {
      // Resolution proved by successful import at the top of this file
      expect(JourniumService).toBeDefined();
      expect(provideJournium).toBeDefined();
      expect(typeof provideJournium).toBe('function');
    });

    it('withJourniumRouter resolves from @journium/angular', () => {
      expect(withJourniumRouter).toBeDefined();
      expect(typeof withJourniumRouter).toBe('function');
    });

    it('JourniumModule resolves from @journium/angular/ngmodule', () => {
      expect(JourniumModule).toBeDefined();
      expect(typeof JourniumModule.forRoot).toBe('function');
    });

    it('provideJournium() returns a value at runtime', () => {
      const providers = provideJournium(mockConfig);
      expect(providers).toBeDefined();
    });

    it('JourniumModule.forRoot() returns a ModuleWithProviders-shaped object', () => {
      const mwp = JourniumModule.forRoot(mockConfig);
      expect(mwp).toBeDefined();
      expect(mwp.ngModule).toBe(JourniumModule);
      expect(Array.isArray(mwp.providers)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Suite 5 — Angular version detection + zone-agnostic note
  // ─────────────────────────────────────────────────────────────────────────
  describe('Suite 5 — Angular version detection', () => {
    it('Angular major version is >= 19', () => {
      const major = parseInt(VERSION.major, 10);
      expect(major).toBeGreaterThanOrEqual(19);
    });

    it('VERSION.full is a non-empty string', () => {
      expect(typeof VERSION.full).toBe('string');
      expect(VERSION.full.length).toBeGreaterThan(0);
    });

    it('service operates correctly in zone-aware jest test environment', () => {
      TestBed.configureTestingModule({
        providers: [provideJournium(mockConfig)],
      });
      const service = TestBed.inject(JourniumService);
      expect(service).toBeDefined();
      expect(() =>
        service.track('zone_check', { angularVersion: VERSION.full })
      ).not.toThrow();
    });

    it('multiple service instances do not interfere when modules are reset', () => {
      TestBed.configureTestingModule({
        providers: [provideJournium({ publishableKey: 'key-a' })],
      });
      const serviceA = TestBed.inject(JourniumService);
      expect(serviceA).toBeDefined();
      TestBed.resetTestingModule();

      TestBed.configureTestingModule({
        providers: [provideJournium({ publishableKey: 'key-b' })],
      });
      const serviceB = TestBed.inject(JourniumService);
      expect(serviceB).toBeDefined();
      expect(serviceA).not.toBe(serviceB);
    });
  });
});

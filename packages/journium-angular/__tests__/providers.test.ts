// Mock Angular core
jest.mock('@angular/core', () => ({
  Injectable: () => (ctor: unknown) => ctor,
  Inject: () => () => {},
  InjectionToken: class MockInjectionToken {
    constructor(public desc: string) {}
    toString() { return `InjectionToken ${this.desc}`; }
  },
  NgModule: () => (ctor: unknown) => ctor,
  makeEnvironmentProviders: (providers: unknown[]) => ({ ɵproviders: providers }),
  APP_INITIALIZER: 'APP_INITIALIZER',
  // Mock provideAppInitializer to return a recognizable flat provider so helpers can find it
  provideAppInitializer: (fn: () => void) => ({
    provide: 'APP_INITIALIZER',
    useFactory: () => fn,
    multi: true,
  }),
  inject: jest.fn(),
}));

jest.mock('@angular/router', () => ({
  Router: class MockRouter {},
  NavigationEnd: class MockNavigationEnd {
    constructor(public id: number, public url: string, public urlAfterRedirects: string) {}
  },
}));

jest.mock('@journium/js', () => ({
  init: jest.fn().mockReturnValue({
    track: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
    capturePageview: jest.fn(),
    startAutocapture: jest.fn(),
    stopAutocapture: jest.fn(),
    getEffectiveOptions: jest.fn().mockReturnValue({}),
    destroy: jest.fn(),
  }),
}));

jest.mock('@journium/core', () => ({}));

import { provideJournium, withJourniumRouter, JOURNIUM_ROUTER_FEATURE } from '../src/providers';
import { JOURNIUM_CONFIG } from '../src/tokens';
import { JourniumService } from '../src/service';

const mockConfig = {
  publishableKey: 'test-pk-providers',
  options: { debug: true },
};

describe('provideJournium()', () => {
  test('returns EnvironmentProviders containing JOURNIUM_CONFIG value provider', () => {
    const result = provideJournium(mockConfig) as unknown as { ɵproviders: unknown[] };
    expect(result).toBeDefined();
    expect(result.ɵproviders).toBeDefined();
    const configProvider = result.ɵproviders.find(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        (p as Record<string, unknown>)['provide'] === JOURNIUM_CONFIG
    );
    expect(configProvider).toBeDefined();
    expect((configProvider as Record<string, unknown>)['useValue']).toBe(mockConfig);
  });

  test('returns EnvironmentProviders containing a JourniumService useFactory provider', () => {
    const result = provideJournium(mockConfig) as unknown as { ɵproviders: unknown[] };
    const serviceProvider = result.ɵproviders.find(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        (p as Record<string, unknown>)['provide'] === JourniumService &&
        typeof (p as Record<string, unknown>)['useFactory'] === 'function'
    );
    expect(serviceProvider).toBeDefined();
  });

  test('accepts config without options', () => {
    const minimalConfig = { publishableKey: 'pk-minimal' };
    const result = provideJournium(minimalConfig) as unknown as { ɵproviders: unknown[] };
    expect(result.ɵproviders).toBeDefined();
  });
});

describe('withJourniumRouter()', () => {
  test('returns EnvironmentProviders containing JOURNIUM_ROUTER_FEATURE', () => {
    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    expect(result).toBeDefined();
    expect(result.ɵproviders).toBeDefined();
    const featureProvider = result.ɵproviders.find(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        (p as Record<string, unknown>)['provide'] === JOURNIUM_ROUTER_FEATURE
    );
    expect(featureProvider).toBeDefined();
  });

  test('returns EnvironmentProviders containing app initializer provider', () => {
    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const initializerProvider = result.ɵproviders.find(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        (p as Record<string, unknown>)['provide'] === 'APP_INITIALIZER'
    );
    expect(initializerProvider).toBeDefined();
  });

  test('app initializer provider has multi: true', () => {
    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const initializerProvider = result.ɵproviders.find(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        (p as Record<string, unknown>)['provide'] === 'APP_INITIALIZER'
    ) as Record<string, unknown> | undefined;
    expect(initializerProvider?.['multi']).toBe(true);
  });
});

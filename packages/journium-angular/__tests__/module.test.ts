// Mock Angular core decorators as no-ops
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
  inject: jest.fn(),
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

import { JourniumModule } from '../src/module';
import { JourniumService } from '../src/service';
import { JOURNIUM_CONFIG } from '../src/tokens';

const mockConfig = {
  publishableKey: 'test-pk-module',
  options: { debug: false },
};

describe('JourniumModule', () => {
  test('forRoot() returns a ModuleWithProviders with ngModule set to JourniumModule', () => {
    const result = JourniumModule.forRoot(mockConfig);
    expect(result).toBeDefined();
    expect(result.ngModule).toBe(JourniumModule);
  });

  test('forRoot() providers array includes JOURNIUM_CONFIG with useValue: config', () => {
    const result = JourniumModule.forRoot(mockConfig);
    expect(result.providers).toBeDefined();
    const configProvider = (result.providers as unknown[]).find(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        (p as Record<string, unknown>)['provide'] === JOURNIUM_CONFIG
    );
    expect(configProvider).toBeDefined();
    expect((configProvider as Record<string, unknown>)['useValue']).toBe(mockConfig);
  });

  test('forRoot() providers array includes a JourniumService useFactory provider', () => {
    const result = JourniumModule.forRoot(mockConfig);
    expect(result.providers).toBeDefined();
    const serviceProvider = (result.providers as unknown[]).find(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        (p as Record<string, unknown>)['provide'] === JourniumService &&
        typeof (p as Record<string, unknown>)['useFactory'] === 'function'
    );
    expect(serviceProvider).toBeDefined();
  });

  test('forRoot() returns different provider instances for different configs', () => {
    const config1 = { publishableKey: 'pk-1' };
    const config2 = { publishableKey: 'pk-2' };
    const result1 = JourniumModule.forRoot(config1);
    const result2 = JourniumModule.forRoot(config2);
    const getConfigProvider = (providers: unknown[]) =>
      (providers as Record<string, unknown>[]).find(
        (p) => p['provide'] === JOURNIUM_CONFIG
      );
    expect(
      (getConfigProvider(result1.providers as unknown[]) as Record<string, unknown>)['useValue']
    ).toBe(config1);
    expect(
      (getConfigProvider(result2.providers as unknown[]) as Record<string, unknown>)['useValue']
    ).toBe(config2);
  });
});

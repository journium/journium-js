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

// Export the same NavigationEnd class so instanceof checks work
class MockNavigationEnd {
  constructor(
    public id: number,
    public url: string,
    public urlAfterRedirects: string
  ) {}
}

jest.mock('@angular/router', () => ({
  NavigationEnd: MockNavigationEnd,
  Router: class MockRouter {},
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
    onOptionsChange: jest.fn().mockReturnValue(() => {}),
    destroy: jest.fn(),
  }),
}));

jest.mock('@journium/core', () => ({}));

import { Subject } from 'rxjs';
import { withJourniumRouter, JOURNIUM_ROUTER_FEATURE } from '../src/providers';
import { inject as ngInject } from '@angular/core';
import { JourniumService } from '../src/service';

/** Helper: extract the app initializer factory from withJourniumRouter() providers. */
function getInitializerFactory(providers: unknown[]): () => () => void {
  const provider = providers.find(
    (p): p is Record<string, unknown> =>
      typeof p === 'object' &&
      p !== null &&
      (p as Record<string, unknown>)['provide'] === 'APP_INITIALIZER'
  );
  return provider?.['useFactory'] as () => () => void;
}

/** Helper: extract the JourniumService factory from withJourniumRouter() providers. */
function getServiceFactory(providers: unknown[]): (config: unknown) => JourniumService {
  const provider = providers.find(
    (p): p is Record<string, unknown> =>
      typeof p === 'object' &&
      p !== null &&
      (p as Record<string, unknown>)['provide'] === JourniumService
  );
  return provider?.['useFactory'] as () => JourniumService;
}

describe('withJourniumRouter()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns providers that register JOURNIUM_ROUTER_FEATURE token', () => {
    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const featureProvider = result.ɵproviders.find(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        (p as Record<string, unknown>)['provide'] === JOURNIUM_ROUTER_FEATURE
    );
    expect(featureProvider).toBeDefined();
  });

  test('app initializer subscribes to NavigationEnd and calls capturePageview', () => {
    const routerEvents$ = new Subject<unknown>();
    const capturePageviewMock = jest.fn();

    const mockRouter = { events: routerEvents$.asObservable() };
    const mockJourniumService = {
      capturePageview: capturePageviewMock,
      getEffectiveOptions: jest.fn().mockReturnValue({ autoTrackPageviews: true }),
    };
    const mockConfig = { publishableKey: 'pk_test' };

    (ngInject as jest.Mock)
      .mockImplementationOnce(() => mockRouter)
      .mockImplementationOnce(() => mockJourniumService)
      .mockImplementationOnce(() => mockConfig);

    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const factory = getInitializerFactory(result.ɵproviders);
    factory()();

    routerEvents$.next(new MockNavigationEnd(1, '/home', '/home'));
    expect(capturePageviewMock).toHaveBeenCalledTimes(1);
  });

  test('capturePageview() is called for each NavigationEnd event', () => {
    const routerEvents$ = new Subject<unknown>();
    const capturePageviewMock = jest.fn();

    const mockRouter = { events: routerEvents$.asObservable() };
    const mockJourniumService = {
      capturePageview: capturePageviewMock,
      getEffectiveOptions: jest.fn().mockReturnValue({ autoTrackPageviews: true }),
    };
    const mockConfig = { publishableKey: 'pk_test' };

    (ngInject as jest.Mock)
      .mockImplementationOnce(() => mockRouter)
      .mockImplementationOnce(() => mockJourniumService)
      .mockImplementationOnce(() => mockConfig);

    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const factory = getInitializerFactory(result.ɵproviders);
    factory()();

    routerEvents$.next(new MockNavigationEnd(1, '/home', '/home'));
    routerEvents$.next(new MockNavigationEnd(2, '/about', '/about'));
    routerEvents$.next(new MockNavigationEnd(3, '/contact', '/contact'));
    expect(capturePageviewMock).toHaveBeenCalledTimes(3);
  });

  test('non-NavigationEnd events do not trigger capturePageview', () => {
    const routerEvents$ = new Subject<unknown>();
    const capturePageviewMock = jest.fn();

    const mockRouter = { events: routerEvents$.asObservable() };
    const mockJourniumService = {
      capturePageview: capturePageviewMock,
      getEffectiveOptions: jest.fn().mockReturnValue({ autoTrackPageviews: true }),
    };
    const mockConfig = { publishableKey: 'pk_test' };

    (ngInject as jest.Mock)
      .mockImplementationOnce(() => mockRouter)
      .mockImplementationOnce(() => mockJourniumService)
      .mockImplementationOnce(() => mockConfig);

    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const factory = getInitializerFactory(result.ɵproviders);
    factory()();

    // Non-NavigationEnd events should be filtered out
    routerEvents$.next({ type: 'NavigationStart', url: '/home' });
    routerEvents$.next({ type: 'RoutesRecognized', url: '/home' });
    expect(capturePageviewMock).not.toHaveBeenCalled();

    // Real NavigationEnd should fire capturePageview
    routerEvents$.next(new MockNavigationEnd(1, '/home', '/home'));
    expect(capturePageviewMock).toHaveBeenCalledTimes(1);
  });

  test('does not subscribe to NavigationEnd when autoTrackPageviews is false', () => {
    const routerEvents$ = new Subject<unknown>();
    const capturePageviewMock = jest.fn();

    const mockRouter = { events: routerEvents$.asObservable() };
    const mockJourniumService = { capturePageview: capturePageviewMock };
    const mockConfig = { publishableKey: 'pk_test', options: { autoTrackPageviews: false } };

    (ngInject as jest.Mock)
      .mockImplementationOnce(() => mockRouter)
      .mockImplementationOnce(() => mockJourniumService)
      .mockImplementationOnce(() => mockConfig);

    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const factory = getInitializerFactory(result.ɵproviders);
    factory()();

    routerEvents$.next(new MockNavigationEnd(1, '/home', '/home'));
    expect(capturePageviewMock).not.toHaveBeenCalled();
  });

  test('skips capturePageview when effective autoTrackPageviews becomes false after init', () => {
    const routerEvents$ = new Subject<unknown>();
    const capturePageviewMock = jest.fn();
    const getEffectiveOptionsMock = jest.fn().mockReturnValue({ autoTrackPageviews: true });

    const mockRouter = { events: routerEvents$.asObservable() };
    const mockJourniumService = {
      capturePageview: capturePageviewMock,
      getEffectiveOptions: getEffectiveOptionsMock,
    };
    const mockConfig = { publishableKey: 'pk_test' };

    (ngInject as jest.Mock)
      .mockImplementationOnce(() => mockRouter)
      .mockImplementationOnce(() => mockJourniumService)
      .mockImplementationOnce(() => mockConfig);

    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const factory = getInitializerFactory(result.ɵproviders);
    factory()();

    // First navigation — autoTrackPageviews not false, should fire
    routerEvents$.next(new MockNavigationEnd(1, '/home', '/home'));
    expect(capturePageviewMock).toHaveBeenCalledTimes(1);

    // Remote config sets autoTrackPageviews to false — should NOT fire
    getEffectiveOptionsMock.mockReturnValue({ autoTrackPageviews: false });
    routerEvents$.next(new MockNavigationEnd(2, '/about', '/about'));
    expect(capturePageviewMock).toHaveBeenCalledTimes(1); // still 1, not 2
  });

  test('JourniumService factory sets _frameworkHandlesPageviews instead of modifying autoTrackPageviews', () => {
    const mockConfig = { publishableKey: 'pk_test', options: { autoTrackPageviews: true } };

    const { init } = require('@journium/js');

    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const serviceFactory = getServiceFactory(result.ɵproviders);
    serviceFactory(mockConfig);

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          autoTrackPageviews: true,
          _frameworkHandlesPageviews: true,
        }),
      })
    );
  });

  test('JourniumService factory preserves autoTrackPageviews: false when user disables tracking', () => {
    const mockConfig = { publishableKey: 'pk_test', options: { autoTrackPageviews: false } };

    const { init } = require('@journium/js');

    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const serviceFactory = getServiceFactory(result.ɵproviders);
    serviceFactory(mockConfig);

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          autoTrackPageviews: false,
          _frameworkHandlesPageviews: true,
        }),
      })
    );
  });
});

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
    destroy: jest.fn(),
  }),
}));

jest.mock('@journium/core', () => ({}));

import { Subject } from 'rxjs';
import { withJourniumRouter, JOURNIUM_ROUTER_FEATURE } from '../src/providers';
import { inject as ngInject } from '@angular/core';

describe('withJourniumRouter()', () => {
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

  test('APP_INITIALIZER factory subscribes to NavigationEnd and calls capturePageview', () => {
    const routerEvents$ = new Subject<unknown>();
    const capturePageviewMock = jest.fn();

    const mockRouter = { events: routerEvents$.asObservable() };
    const mockJourniumService = { capturePageview: capturePageviewMock };

    (ngInject as jest.Mock)
      .mockImplementationOnce(() => mockRouter)
      .mockImplementationOnce(() => mockJourniumService);

    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const initializerProvider = result.ɵproviders.find(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        (p as Record<string, unknown>)['provide'] === 'APP_INITIALIZER'
    ) as Record<string, unknown> | undefined;

    const factory = initializerProvider?.['useFactory'] as () => () => void;
    const initializer = factory();
    initializer();

    // Emit a NavigationEnd event
    routerEvents$.next(new MockNavigationEnd(1, '/home', '/home'));
    expect(capturePageviewMock).toHaveBeenCalledTimes(1);
  });

  test('capturePageview() is called for each NavigationEnd event', () => {
    const routerEvents$ = new Subject<unknown>();
    const capturePageviewMock = jest.fn();

    const mockRouter = { events: routerEvents$.asObservable() };
    const mockJourniumService = { capturePageview: capturePageviewMock };

    (ngInject as jest.Mock)
      .mockImplementationOnce(() => mockRouter)
      .mockImplementationOnce(() => mockJourniumService);

    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const initializerProvider = result.ɵproviders.find(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        (p as Record<string, unknown>)['provide'] === 'APP_INITIALIZER'
    ) as Record<string, unknown> | undefined;

    const factory = initializerProvider?.['useFactory'] as () => () => void;
    const initializer = factory();
    initializer();

    routerEvents$.next(new MockNavigationEnd(1, '/home', '/home'));
    routerEvents$.next(new MockNavigationEnd(2, '/about', '/about'));
    routerEvents$.next(new MockNavigationEnd(3, '/contact', '/contact'));
    expect(capturePageviewMock).toHaveBeenCalledTimes(3);
  });

  test('non-NavigationEnd events do not trigger capturePageview', () => {
    const routerEvents$ = new Subject<unknown>();
    const capturePageviewMock = jest.fn();

    const mockRouter = { events: routerEvents$.asObservable() };
    const mockJourniumService = { capturePageview: capturePageviewMock };

    (ngInject as jest.Mock)
      .mockImplementationOnce(() => mockRouter)
      .mockImplementationOnce(() => mockJourniumService);

    const result = withJourniumRouter() as unknown as { ɵproviders: unknown[] };
    const initializerProvider = result.ɵproviders.find(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        (p as Record<string, unknown>)['provide'] === 'APP_INITIALIZER'
    ) as Record<string, unknown> | undefined;

    const factory = initializerProvider?.['useFactory'] as () => () => void;
    const initializer = factory();
    initializer();

    // Non-NavigationEnd events should be filtered out
    routerEvents$.next({ type: 'NavigationStart', url: '/home' });
    routerEvents$.next({ type: 'RoutesRecognized', url: '/home' });
    expect(capturePageviewMock).not.toHaveBeenCalled();

    // Real NavigationEnd should fire capturePageview
    routerEvents$.next(new MockNavigationEnd(1, '/home', '/home'));
    expect(capturePageviewMock).toHaveBeenCalledTimes(1);
  });
});

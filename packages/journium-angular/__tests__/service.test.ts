// Mock @angular/core — Injectable is a decorator no-op; OnDestroy is an interface (no runtime value)
jest.mock('@angular/core', () => ({
  Injectable: () => (ctor: unknown) => ctor,
}));

const mockAnalytics = {
  track: jest.fn(),
  identify: jest.fn(),
  reset: jest.fn(),
  capturePageview: jest.fn(),
  startAutocapture: jest.fn(),
  stopAutocapture: jest.fn(),
  getEffectiveOptions: jest.fn().mockReturnValue({ debug: true }),
  destroy: jest.fn(),
  onOptionsChange: jest.fn().mockReturnValue(() => {}),
};

jest.mock('@journium/js', () => ({
  init: jest.fn().mockReturnValue(mockAnalytics),
}));

jest.mock('@journium/core', () => ({}));

import { init } from '@journium/js';
import { JourniumService } from '../src/service';

const mockConfig = {
  publishableKey: 'test-pk-123',
  options: { debug: true },
};

describe('JourniumService', () => {
  let service: JourniumService;

  beforeEach(() => {
    jest.clearAllMocks();
    (init as jest.Mock).mockReturnValue(mockAnalytics);
    service = new JourniumService(mockConfig);
  });

  test('constructor calls init(config) with the provided config', () => {
    expect(init).toHaveBeenCalledWith(mockConfig);
    expect(init).toHaveBeenCalledTimes(1);
  });

  test('track() delegates to analytics.track() with event and properties', () => {
    service.track('button_clicked', { page: 'home' });
    expect(mockAnalytics.track).toHaveBeenCalledWith('button_clicked', { page: 'home' });
  });

  test('track() works without properties', () => {
    service.track('page_loaded');
    expect(mockAnalytics.track).toHaveBeenCalledWith('page_loaded', undefined);
  });

  test('identify() delegates to analytics.identify() with distinctId and attributes', () => {
    service.identify('user-123', { name: 'Alice' });
    expect(mockAnalytics.identify).toHaveBeenCalledWith('user-123', { name: 'Alice' });
  });

  test('identify() works without attributes', () => {
    service.identify('user-456');
    expect(mockAnalytics.identify).toHaveBeenCalledWith('user-456', undefined);
  });

  test('reset() delegates to analytics.reset()', () => {
    service.reset();
    expect(mockAnalytics.reset).toHaveBeenCalledTimes(1);
  });

  test('capturePageview() delegates to analytics.capturePageview()', () => {
    service.capturePageview({ page: '/home' });
    expect(mockAnalytics.capturePageview).toHaveBeenCalledWith({ page: '/home' });
  });

  test('capturePageview() works without properties', () => {
    service.capturePageview();
    expect(mockAnalytics.capturePageview).toHaveBeenCalledWith(undefined);
  });

  test('startAutocapture() delegates to analytics.startAutocapture()', () => {
    service.startAutocapture();
    expect(mockAnalytics.startAutocapture).toHaveBeenCalledTimes(1);
  });

  test('stopAutocapture() delegates to analytics.stopAutocapture()', () => {
    service.stopAutocapture();
    expect(mockAnalytics.stopAutocapture).toHaveBeenCalledTimes(1);
  });

  test('getEffectiveOptions() returns options from analytics', () => {
    const options = service.getEffectiveOptions();
    expect(mockAnalytics.getEffectiveOptions).toHaveBeenCalledTimes(1);
    expect(options).toEqual({ debug: true });
  });

  test('ngOnDestroy() calls analytics.destroy()', () => {
    service.ngOnDestroy();
    expect(mockAnalytics.destroy).toHaveBeenCalledTimes(1);
  });

  test('ngOnDestroy() does not throw when called multiple times', () => {
    expect(() => {
      service.ngOnDestroy();
      service.ngOnDestroy();
    }).not.toThrow();
  });
});

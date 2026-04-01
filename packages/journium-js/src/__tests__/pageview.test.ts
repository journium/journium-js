import { PageviewTracker } from '../PageviewTracker.js';
import { JourniumClient } from '../JourniumClient.js';
import * as coreUtils from '@journium/core';

jest.mock('../JourniumClient.js');
jest.mock('@journium/core', () => ({
  ...jest.requireActual('@journium/core'),
  getCurrentUrl: jest.fn(),
  getPageTitle: jest.fn(),
  getReferrer: jest.fn(),
}));

describe('PageviewTracker', () => {
  let mockClient: jest.Mocked<JourniumClient>;
  let pageviewTracker: PageviewTracker;

  beforeEach(() => {
    mockClient = {
      track: jest.fn(),
      flush: jest.fn(),
      destroy: jest.fn(),
    } as any;
    
    pageviewTracker = new PageviewTracker(mockClient);
    
    // Mock the core utility functions
    (coreUtils.getCurrentUrl as jest.Mock).mockReturnValue('https://example.com/test?param=value');
    (coreUtils.getPageTitle as jest.Mock).mockReturnValue('Test Page');
    (coreUtils.getReferrer as jest.Mock).mockReturnValue('https://google.com');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startAutoPageviewTracking', () => {
    let originalPushState: typeof window.history.pushState;

    beforeEach(() => {
      originalPushState = window.history.pushState;
    });

    afterEach(() => {
      window.history.pushState = originalPushState;
      pageviewTracker.stopAutocapture();
    });

    it('captures initial pageview when captureInitialPageview is true', () => {
      pageviewTracker.startAutoPageviewTracking(true, false);
      expect(mockClient.track).toHaveBeenCalledTimes(1);
      expect(mockClient.track).toHaveBeenCalledWith('$pageview', expect.any(Object));
    });

    it('does not capture initial pageview when captureInitialPageview is false', () => {
      pageviewTracker.startAutoPageviewTracking(false, false);
      expect(mockClient.track).not.toHaveBeenCalled();
    });

    it('patches history.pushState when patchHistory is true', () => {
      pageviewTracker.startAutoPageviewTracking(false, true);
      expect(window.history.pushState).not.toBe(originalPushState);
    });

    it('does NOT patch history.pushState when patchHistory is false', () => {
      pageviewTracker.startAutoPageviewTracking(false, false);
      expect(window.history.pushState).toBe(originalPushState);
    });

    it('fires pageview on pushState when patchHistory is true', async () => {
      pageviewTracker.startAutoPageviewTracking(false, true);
      window.history.pushState({}, '', '/new-route');
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockClient.track).toHaveBeenCalledWith('$pageview', expect.any(Object));
    });

    it('does NOT fire pageview on pushState when patchHistory is false', async () => {
      pageviewTracker.startAutoPageviewTracking(false, false);
      window.history.pushState({}, '', '/new-route');
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockClient.track).not.toHaveBeenCalled();
    });
  });

  describe('capturePageview', () => {
    it('should capture pageview with correct properties', () => {
      pageviewTracker.capturePageview();

      expect(mockClient.track).toHaveBeenCalledWith('$pageview', {
        $current_url: 'https://example.com/test?param=value',
        $host: 'example.com',
        $pathname: '/test',
        $search: '?param=value',
        $page_title: 'Test Page',
        $referrer: 'https://google.com',
      });
    });

    it('should merge custom properties', () => {
      const customProps = { custom_prop: 'value' };
      pageviewTracker.capturePageview(customProps);

      expect(mockClient.track).toHaveBeenCalledWith('$pageview', {
        $current_url: 'https://example.com/test?param=value',
        $host: 'example.com',
        $pathname: '/test',
        $search: '?param=value',
        $page_title: 'Test Page',
        $referrer: 'https://google.com',
        custom_prop: 'value',
      });
    });
  });
});
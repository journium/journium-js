import { JourniumAnalytics } from '../JourniumAnalytics.js';
import { JourniumClient } from '../JourniumClient.js';
import { PageviewTracker } from '../PageviewTracker.js';
import { AutoTrackPageviewsOptions } from '@journium/core';

jest.mock('../JourniumClient.js');
jest.mock('../PageviewTracker.js');

describe('JourniumAnalytics — resolvePageviewOptions integration', () => {
  let mockClientInstance: jest.Mocked<JourniumClient>;
  let mockPageviewTracker: jest.Mocked<PageviewTracker>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClientInstance = {
      track: jest.fn(),
      flush: jest.fn(),
      destroy: jest.fn(),
      getEffectiveOptions: jest.fn(),
      onOptionsChange: jest.fn().mockReturnValue(() => {}),
    } as any;

    mockPageviewTracker = {
      capturePageview: jest.fn(),
      startAutoPageviewTracking: jest.fn(),
      stopAutocapture: jest.fn(),
    } as any;

    (JourniumClient as unknown as jest.Mock).mockImplementation(() => mockClientInstance);
    (PageviewTracker as unknown as jest.Mock).mockImplementation(() => mockPageviewTracker);
  });

  function makeAnalytics(autoTrackPageviews: boolean | AutoTrackPageviewsOptions) {
    mockClientInstance.getEffectiveOptions.mockReturnValue({ autoTrackPageviews, autocapture: false });
    return new JourniumAnalytics({ publishableKey: 'pk_test' });
  }

  describe('autoTrackPageviews: true (default)', () => {
    it('starts tracking with captureInitialPageview=true and patchHistory=true', () => {
      makeAnalytics(true);
      expect(mockPageviewTracker.startAutoPageviewTracking).toHaveBeenCalledWith(true, true);
    });
  });

  describe('autoTrackPageviews: false', () => {
    it('does not start pageview tracking at all', () => {
      makeAnalytics(false);
      expect(mockPageviewTracker.startAutoPageviewTracking).not.toHaveBeenCalled();
    });
  });

  describe('autoTrackPageviews: { trackSpaPageviews: false }', () => {
    it('fires initial pageview but skips history patching', () => {
      makeAnalytics({ trackSpaPageviews: false });
      expect(mockPageviewTracker.startAutoPageviewTracking).toHaveBeenCalledWith(true, false);
    });
  });

  describe('autoTrackPageviews: { trackSpaPageviews: false, trackInitialPageview: false }', () => {
    it('skips both initial pageview and history patching (Next.js internal mode)', () => {
      makeAnalytics({ trackSpaPageviews: false, trackInitialPageview: false });
      expect(mockPageviewTracker.startAutoPageviewTracking).toHaveBeenCalledWith(false, false);
    });
  });

  describe('_frameworkHandlesPageviews: true', () => {
    it('does not start built-in pageview tracking even when autoTrackPageviews is not false', () => {
      mockClientInstance.getEffectiveOptions.mockReturnValue({
        autoTrackPageviews: true,
        autocapture: false,
        _frameworkHandlesPageviews: true,
      });
      new JourniumAnalytics({ publishableKey: 'pk_test', options: { _frameworkHandlesPageviews: true } as any });
      expect(mockPageviewTracker.startAutoPageviewTracking).not.toHaveBeenCalled();
    });

    it('still allows manual capturePageview calls', () => {
      mockClientInstance.getEffectiveOptions.mockReturnValue({
        autoTrackPageviews: true,
        autocapture: false,
        _frameworkHandlesPageviews: true,
      });
      const analytics = new JourniumAnalytics({ publishableKey: 'pk_test', options: { _frameworkHandlesPageviews: true } as any });
      analytics.capturePageview();
      expect(mockPageviewTracker.capturePageview).toHaveBeenCalledTimes(1);
    });
  });
});
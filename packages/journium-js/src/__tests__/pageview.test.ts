import { PageviewTracker } from '../pageview.js';
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

  describe('capturePageview', () => {
    it('should capture pageview with correct properties', () => {
      pageviewTracker.capturePageview();

      expect(mockClient.track).toHaveBeenCalledWith('$pageview', {
        $current_url: 'https://example.com/test?param=value',
        $host: 'example.com',
        $pathname: '/test',
        $search: '?param=value',
        $title: 'Test Page',
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
        $title: 'Test Page',
        $referrer: 'https://google.com',
        custom_prop: 'value',
      });
    });
  });
});
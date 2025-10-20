import { PageviewTracker } from '../pageview';
import { JourniumClient } from '../client';

jest.mock('../client');

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
    
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://example.com/test?param=value',
        host: 'example.com',
        pathname: '/test',
        search: '?param=value',
      },
      writable: true,
    });
    
    Object.defineProperty(document, 'title', {
      value: 'Test Page',
      writable: true,
    });
    
    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com',
      writable: true,
    });
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
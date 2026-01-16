/**
 * React Version Compatibility Tests
 * 
 * These tests verify that @journium/react works correctly across
 * different React versions (16.8+, 17.x, 18.x)
 */

import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { JourniumProvider, useJournium, useTrackEvent, useIdentify, useReset, useTrackPageview, useAutoTrackPageview, useAutocapture } from '@journium/react';

// Detect React version
const REACT_VERSION = React.version;
const REACT_MAJOR_VERSION = parseInt(REACT_VERSION.split('.')[0], 10);

// Helper for act() that works across React versions
// React 16: act() is synchronous
// React 17+: act() is async
const actCompat = (callback: () => void | Promise<void>) => {
  if (REACT_MAJOR_VERSION >= 17) {
    // React 17+ supports async act
    return act(async () => {
      await callback();
    });
  } else {
    // React 16 only supports sync act
    act(() => {
      callback();
    });
    return Promise.resolve();
  }
};

// waitFor helper for compatibility
const waitFor = async (callback: () => void, options = { timeout: 3000 }) => {
  const startTime = Date.now();
  while (Date.now() - startTime < options.timeout) {
    try {
      callback();
      return;
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  callback(); // Final attempt
};

// Mock configuration for tests
const mockConfig = {
  publishableKey: 'test-api-key',
  options: {
    autocapture: false, // Disabled by default for controlled testing
  },
};

describe('React Compatibility Tests', () => {
  beforeEach(() => {
    // Clear any existing mocks
    jest.clearAllMocks();
    
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock;
  });

  describe('JourniumProvider', () => {
    test('should render children correctly', () => {
      render(
        <JourniumProvider config={mockConfig}>
          <div>Test Content</div>
        </JourniumProvider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('should initialize analytics instance', async () => {
      const TestComponent = () => {
        const { analytics } = useJournium();
        return <div>{analytics ? 'Analytics Ready' : 'Loading'}</div>;
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Analytics Ready')).toBeInTheDocument();
      });
    });

    test('should provide config to children', async () => {
      const TestComponent = () => {
        const { config } = useJournium();
        return <div>{config?.publishableKey || 'No Config'}</div>;
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(mockConfig.publishableKey)).toBeInTheDocument();
      });
    });

    test('should cleanup on unmount', async () => {
      const TestComponent = () => {
        const { analytics } = useJournium();
        return <div>{analytics ? 'Mounted' : 'Not Mounted'}</div>;
      };

      const { unmount } = render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Mounted')).toBeInTheDocument();
      });

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('useJournium Hook', () => {
    test('should throw error when used outside provider', () => {
      const TestComponent = () => {
        useJournium();
        return <div>Test</div>;
      };

      // Suppress expected error in console
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useJournium must be used within a JourniumProvider'
      );

      spy.mockRestore();
    });

    test('should return analytics instance', async () => {
      const TestComponent = () => {
        const { analytics } = useJournium();
        return <div>{analytics !== null ? 'Has Analytics' : 'No Analytics'}</div>;
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Has Analytics')).toBeInTheDocument();
      });
    });
  });

  describe('useTrackEvent Hook', () => {
    test('should track events correctly', async () => {
      const TestComponent = () => {
        const trackEvent = useTrackEvent();
        
        React.useEffect(() => {
          trackEvent('test_event', { prop: 'value' });
        }, [trackEvent]);

        return <div>Event Tracked</div>;
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Event Tracked')).toBeInTheDocument();
      });
    });

    test('should handle events before analytics is ready', () => {
      const TestComponent = () => {
        const trackEvent = useTrackEvent();
        
        // Should not throw even if called immediately
        expect(() => trackEvent('early_event')).not.toThrow();

        return <div>Test</div>;
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );
    });
  });

  describe('useIdentify Hook', () => {
    test('should identify users correctly', async () => {
      const TestComponent = () => {
        const identify = useIdentify();
        
        React.useEffect(() => {
          identify('user-123', { name: 'Test User' });
        }, [identify]);

        return <div>User Identified</div>;
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('User Identified')).toBeInTheDocument();
      });
    });
  });

  describe('useReset Hook', () => {
    test('should reset analytics correctly', async () => {
      const TestComponent = () => {
        const reset = useReset();
        
        return (
          <button onClick={() => reset()}>
            Reset Analytics
          </button>
        );
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      const button = screen.getByText('Reset Analytics');
      
      // Should not throw when clicked
      await actCompat(() => {
        button.click();
      });

      expect(button).toBeInTheDocument();
    });
  });

  describe('useTrackPageview Hook', () => {
    test('should track pageviews correctly', async () => {
      const TestComponent = () => {
        const trackPageview = useTrackPageview();
        
        React.useEffect(() => {
          trackPageview({ page: '/test' });
        }, [trackPageview]);

        return <div>Pageview Tracked</div>;
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Pageview Tracked')).toBeInTheDocument();
      });
    });
  });

  describe('useAutoTrackPageview Hook', () => {
    test('should auto-track pageviews on mount', async () => {
      const TestComponent = () => {
        useAutoTrackPageview([], { page: '/auto-tracked' });
        return <div>Auto Tracked</div>;
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Auto Tracked')).toBeInTheDocument();
      });
    });

    test('should re-track when dependencies change', async () => {
      const TestComponent = ({ page }: { page: string }) => {
        useAutoTrackPageview([page], { page });
        return <div>Page: {page}</div>;
      };

      const { rerender } = render(
        <JourniumProvider config={mockConfig}>
          <TestComponent page="/page1" />
        </JourniumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Page: /page1')).toBeInTheDocument();
      });

      rerender(
        <JourniumProvider config={mockConfig}>
          <TestComponent page="/page2" />
        </JourniumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Page: /page2')).toBeInTheDocument();
      });
    });
  });

  describe('useAutocapture Hook', () => {
    test('should provide autocapture controls', async () => {
      const TestComponent = () => {
        const { startAutocapture, stopAutocapture } = useAutocapture();
        
        return (
          <div>
            <button onClick={startAutocapture}>Start</button>
            <button onClick={stopAutocapture}>Stop</button>
          </div>
        );
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      const startButton = screen.getByText('Start');
      const stopButton = screen.getByText('Stop');

      // Should not throw when called
      await actCompat(() => {
        startButton.click();
        stopButton.click();
      });

      expect(startButton).toBeInTheDocument();
      expect(stopButton).toBeInTheDocument();
    });
  });

  describe('Multiple Hooks Integration', () => {
    test('should work together correctly', async () => {
      const TestComponent = () => {
        const { analytics } = useJournium();
        const trackEvent = useTrackEvent();
        const identify = useIdentify();
        const trackPageview = useTrackPageview();

        React.useEffect(() => {
          if (analytics) {
            identify('user-456');
            trackPageview({ page: '/test' });
            trackEvent('page_loaded');
          }
        }, [analytics, identify, trackPageview, trackEvent]);

        return <div>Integration Test</div>;
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Integration Test')).toBeInTheDocument();
      });
    });
  });

  describe('React Version Specific Features', () => {
    test('should handle concurrent features (React 18+)', async () => {
      // Skip this test on React 16 since it's specifically for React 18+ concurrent features
      if (REACT_MAJOR_VERSION < 17) {
        console.log('Skipping concurrent features test on React 16');
        return;
      }

      // This test will work in React 18+ with concurrent rendering
      // and gracefully degrade in older versions
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        const trackEvent = useTrackEvent();

        const handleClick = () => {
          setCount(c => c + 1);
          trackEvent('button_clicked', { count: count + 1 });
        };

        return (
          <div>
            <button onClick={handleClick}>Click: {count}</button>
          </div>
        );
      };

      render(
        <JourniumProvider config={mockConfig}>
          <TestComponent />
        </JourniumProvider>
      );

      const button = screen.getByText(/Click: 0/);
      
      await actCompat(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByText(/Click: 1/)).toBeInTheDocument();
      });
    });

    test('should work with strict mode', async () => {
      const TestComponent = () => {
        const { analytics } = useJournium();
        return <div>{analytics ? 'Ready' : 'Loading'}</div>;
      };

      render(
        <React.StrictMode>
          <JourniumProvider config={mockConfig}>
            <TestComponent />
          </JourniumProvider>
        </React.StrictMode>
      );

      await waitFor(() => {
        expect(screen.getByText('Ready')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid re-renders', async () => {
      const TestComponent = ({ value }: { value: number }) => {
        const trackEvent = useTrackEvent();
        
        React.useEffect(() => {
          trackEvent('value_changed', { value });
        }, [value, trackEvent]);

        return <div>Value: {value}</div>;
      };

      const { rerender } = render(
        <JourniumProvider config={mockConfig}>
          <TestComponent value={1} />
        </JourniumProvider>
      );

      // Rapid re-renders
      for (let i = 2; i <= 5; i++) {
        rerender(
          <JourniumProvider config={mockConfig}>
            <TestComponent value={i} />
          </JourniumProvider>
        );
      }

      await waitFor(() => {
        expect(screen.getByText('Value: 5')).toBeInTheDocument();
      });
    });

    test('should handle nested providers (not recommended but should not crash)', async () => {
      const TestComponent = () => {
        const { config } = useJournium();
        return <div>{config?.publishableKey}</div>;
      };

      render(
        <JourniumProvider config={mockConfig}>
          <JourniumProvider config={{ ...mockConfig, publishableKey: 'nested-key' }}>
            <TestComponent />
          </JourniumProvider>
        </JourniumProvider>
      );

      // Should use innermost provider
      await waitFor(() => {
        expect(screen.getByText('nested-key')).toBeInTheDocument();
      });
    });
  });
});

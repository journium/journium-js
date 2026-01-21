/**
 * CDN Entry Point for Journium Analytics
 * This file provides global browser integration for script snippet usage
 * Features: auto method stubbing, error handling, improved queue processing
 */

import { init } from './index';

// Type for analytics instance
type JourniumAnalyticsInstance = ReturnType<typeof init>;

// Available public methods for auto-stubbing
const STUBBED_METHODS = [
  'track', 'identify', 'reset', 'capturePageview', 'startAutocapture', 
  'stopAutocapture', 'flush', 'getEffectiveOptions', 'onOptionsChange', 'destroy'
] as const;

// Global interface for snippet integration
interface JourniumSnippetQueue {
  _q?: any[][];
  _i?: [any, string?]; // [config, instanceName?] - config object format
  __JV?: boolean;
  _error?: Error | null; // Track initialization errors
  _retry?: boolean; // Track if we should retry initialization
  [key: string]: any;
}

// Global Journium interface
interface GlobalJournium {
  init: (config: any, instanceName?: string) => JourniumAnalyticsInstance;
  track?: (event: string, properties?: any) => void;
  identify?: (distinctId: string, attributes?: any) => void;
  reset?: () => void;
  capturePageview?: (properties?: any) => void;
  startAutocapture?: () => void;
  stopAutocapture?: () => void;
  flush?: () => Promise<void>;
  getEffectiveOptions?: () => any;
  onOptionsChange?: (callback: (options: any) => void) => () => void;
  destroy?: () => void;
  [key: string]: any; // For multi-instance support (e.g., journium.project1)
}

// Extend window type for TypeScript
declare global {
  interface Window {
    journium?: JourniumSnippetQueue | GlobalJournium;
  }
}

/**
 * Enhanced queue processing with better error handling and edge cases
 */
function processQueuedCalls(instance: JourniumAnalyticsInstance, queue: any[][]): void {
  if (!Array.isArray(queue) || queue.length === 0) {
    return;
  }

  const processedCount = { success: 0, error: 0, skipped: 0 };

  queue.forEach(([method, ...args], index) => {
    try {
      // Validate method call structure
      if (typeof method !== 'string') {
        console.warn(`Journium: Invalid method call at index ${index}:`, method);
        processedCount.skipped++;
        return;
      }

      // Check if method exists and is callable
      if (method in instance && typeof (instance as any)[method] === 'function') {
        // Handle async methods properly
        const result = (instance as any)[method](...args);
        
        // If it's a promise, handle potential rejections
        if (result && typeof result.catch === 'function') {
          result.catch((error: Error) => {
            console.warn(`Journium: Async method '${method}' failed:`, error);
          });
        }
        
        processedCount.success++;
      } else {
        console.warn(`Journium: Unknown method '${method}' called from queue`);
        processedCount.skipped++;
      }
    } catch (error) {
      console.warn(`Journium: Error executing queued method '${method}':`, error);
      processedCount.error++;
    }
  });

  // Log summary for debugging
  if (processedCount.success > 0 || processedCount.error > 0) {
    console.log(`Journium: Processed ${processedCount.success} calls, ${processedCount.error} errors, ${processedCount.skipped} skipped`);
  }
}

/**
 * Dynamically stub all available methods
 */
function createMethodStubs(target: any, queueTarget: any[] = []): void {
  STUBBED_METHODS.forEach(method => {
    target[method] = function(...args: any[]) {
      queueTarget.push([method, ...args]);
      return target; // Enable method chaining
    };
  });
}

/**
 * Dynamically bind all available methods from instance to target
 */
function bindInstanceMethods(instance: JourniumAnalyticsInstance, target: any): void {
  STUBBED_METHODS.forEach(method => {
    if (method in instance && typeof (instance as any)[method] === 'function') {
      target[method] = (instance as any)[method].bind(instance);
    }
  });
}

/**
 * Create fallback object when initialization fails
 */
function createFallbackObject(error?: Error): GlobalJournium {
  const fallbackQueue: any[][] = [];
  
  const fallback: GlobalJournium = {
    init: (config: any, instanceName?: string) => {
      console.warn('Journium: Fallback mode - init calls will be queued');
      fallbackQueue.push(['init', config, instanceName]);
      return {} as JourniumAnalyticsInstance;
    },
    _error: error || null,
    _fallback: true
  };
  
  // Create method stubs that queue calls
  createMethodStubs(fallback, fallbackQueue);
  
  return fallback;
}

/**
 * Create the global journium object with enhanced error handling
 */
function createGlobalJournium(): GlobalJournium {
  let defaultInstance: JourniumAnalyticsInstance | null = null;
  
  const globalJournium: GlobalJournium = {
    init: (config: any, instanceName?: string) => {
      try {
        // Validate config object
        if (!config || typeof config !== 'object') {
          throw new Error('Config object is required');
        }
        
        if (!config.publishableKey) {
          throw new Error('publishableKey is required in config');
        }
        
        // Build the config for the init function with proper structure
        const initConfig: any = {
          publishableKey: config.publishableKey
        };
        
        // Add apiHost if provided
        if (config.apiHost) {
          initConfig.apiHost = config.apiHost;
        }
        
        // Add options as nested object if provided
        if (config.options && typeof config.options === 'object') {
          initConfig.options = config.options;
        }
        
        // Create the instance using the merged config
        const instance = init(initConfig);
        
        if (instanceName) {
          // Multi-instance: store as journium[instanceName]
          globalJournium[instanceName] = instance;
          return instance;
        } else {
          // Single instance: dynamically bind all methods
          defaultInstance = instance;
          bindInstanceMethods(instance, globalJournium);
          return instance;
        }
      } catch (error) {
        console.error('Journium: Failed to initialize:', error);
        // Return fallback object that queues method calls
        const fallback = createFallbackObject(error as Error);
        Object.assign(globalJournium, fallback);
        return {} as JourniumAnalyticsInstance;
      }
    }
  };
  
  return globalJournium;
}

/**
 * Initialize from snippet with comprehensive error handling and retry logic
 */
function initializeFromSnippet(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const snippet = window.journium as JourniumSnippetQueue;
  let globalJournium: GlobalJournium = createGlobalJournium();
  
  try {
    
    if (snippet && snippet._i) {
      // Extract snippet initialization parameters
      const [config, instanceName] = snippet._i;
      const queuedCalls = snippet._q || [];
      
      // Validate config object structure
      if (!config || typeof config !== 'object') {
        throw new Error('Invalid or missing config object');
      }
      
      if (!config.publishableKey) {
        throw new Error('publishableKey is required in config');
      }
      
      // Initialize the instance with timeout protection
      const instance = globalJournium.init(config, instanceName);
      
      // Process queued method calls
      if (queuedCalls.length > 0) {
        // Always use the instance for processing queued calls
        setTimeout(() => processQueuedCalls(instance, queuedCalls), 0);
      }
      
      // Preserve snippet metadata
      globalJournium.__JV = snippet.__JV;
      globalJournium._q = [];
      globalJournium._i = snippet._i;
      globalJournium._error = null;
      
    } else if (snippet && snippet._q) {
      // Handle case where queue exists but no initialization
      console.warn('Journium: Found queued calls but no initialization data');
      globalJournium._q = snippet._q;
    }
    
  } catch (error) {
    console.error('Journium: Critical initialization failure:', error);
    
    // Create fallback with error tracking
    globalJournium = createFallbackObject(error as Error);
    
    // Preserve original queue for potential retry
    if (snippet && snippet._q) {
      globalJournium._q = snippet._q;
    }
    
    // Enable retry mechanism
    globalJournium._retry = true;
  } finally {
    // Always replace window.journium, even in failure cases
    window.journium = globalJournium;
    
    // Set up retry mechanism if needed
    if (globalJournium._retry && !globalJournium._error) {
      setTimeout(() => {
        if (window.journium && (window.journium as any)._retry) {
          console.log('Journium: Attempting retry...');
          initializeFromSnippet();
        }
      }, 2000);
    }
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  initializeFromSnippet();
}

// Export for module usage
export { init };
export default { init };
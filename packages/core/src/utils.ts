import { uuidv7 } from 'uuidv7';
import { ServerOptionsResponse } from './types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const generateUuidv7 = (): string => {
  return uuidv7();
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const getCurrentUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
};

export const getPageTitle = (): string => {
  if (typeof document !== 'undefined') {
    return document.title;
  }
  return '';
};

export const getReferrer = (): string => {
  if (typeof document !== 'undefined') {
    return document.referrer;
  }
  return '';
};

export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

export const isNode = (): boolean => {
  return typeof process !== 'undefined' && !!process.versions?.node;
};

export const fetchRemoteOptions = async (
  apiHost: string,
  publishableKey: string,
  fetchFn?: typeof fetch
): Promise<ServerOptionsResponse | null> => {
  const endpoint = '/v1/configs';
  const url = `${apiHost}${endpoint}?ingestion_key=${encodeURIComponent(publishableKey)}`;
  
  try {
    let fetch = fetchFn;
    
    if (!fetch) {
      if (isNode()) {
        // For Node.js environments, expect fetch to be passed in
        throw new Error('Fetch function must be provided in Node.js environment');
      } else {
        // Use native fetch in browser
        fetch = window.fetch;
      }
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // if (!response.ok) {
    //   throw new Error(`Options fetch failed: ${response.status} ${response.statusText}`);
    // }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Failed to fetch remote options:', error);
    return null;
  }
};

export const mergeOptions = <T extends Record<string, unknown>>(
  localOptions: T | null | undefined,
  remoteOptions: T | null | undefined
): T => {
  if (!remoteOptions && !localOptions) {
    return {} as T;
  }
  
  if (!remoteOptions) {
    return localOptions as T;
  }
  
  if (!localOptions) {
    return remoteOptions as T;
  }
  
  // Deep merge local options into remote options
  // Local options takes precedence over remote options
  const merged = { ...remoteOptions } as T;
  
  // Handle primitive values
  Object.keys(localOptions).forEach(key => {
    const localValue = (localOptions as Record<string, unknown>)[key];
    if (localValue !== undefined && localValue !== null) {
      if (typeof localValue === 'object' && !Array.isArray(localValue)) {
        // Deep merge objects - local options overrides remote
        (merged as Record<string, unknown>)[key] = {
          ...((merged as Record<string, unknown>)[key] || {}),
          ...(localValue as Record<string, unknown>)
        };
      } else {
        // Override primitive values and arrays with local options
        (merged as Record<string, unknown>)[key] = localValue;
      }
    }
  });
  
  return merged;
};
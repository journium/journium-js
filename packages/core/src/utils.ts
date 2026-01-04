import { uuidv7 } from 'uuidv7';

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
  fetchFn?: any
): Promise<any> => {
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
    
    if (!response.ok) {
      throw new Error(`Options fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Failed to fetch remote options:', error);
    return null;
  }
};

export const mergeOptions = (localOptions: any, remoteOptions: any): any => {
  if (!remoteOptions && !localOptions) {
    return {};
  }
  
  if (!remoteOptions) {
    return localOptions;
  }
  
  if (!localOptions) {
    return remoteOptions;
  }
  
  // Deep merge local options into remote options
  // Local options takes precedence over remote options
  const merged = { ...remoteOptions };
  
  // Handle primitive values
  Object.keys(localOptions).forEach(key => {
    if (localOptions[key] !== undefined && localOptions[key] !== null) {
      if (typeof localOptions[key] === 'object' && !Array.isArray(localOptions[key])) {
        // Deep merge objects - local options overrides remote
        merged[key] = {
          ...(merged[key] || {}),
          ...localOptions[key]
        };
      } else {
        // Override primitive values and arrays with local options
        merged[key] = localOptions[key];
      }
    }
  });
  
  return merged;
};
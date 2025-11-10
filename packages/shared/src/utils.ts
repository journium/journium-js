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

export const fetchRemoteConfig = async (
  apiHost: string,
  applicationKey: string,
  configEndpoint?: string,
  fetchFn?: any
): Promise<any> => {
  const endpoint = configEndpoint || '/configs';
  const url = `${apiHost}${endpoint}?ingestion_key=${encodeURIComponent(applicationKey)}`;
  
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
      throw new Error(`Config fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Failed to fetch remote config:', error);
    return null;
  }
};

export const mergeConfigs = (localConfig: any, remoteConfig: any): any => {
  if (!remoteConfig) {
    return localConfig;
  }
  
  // Deep merge remote config into local config
  // Remote config takes precedence over local config
  const merged = { ...localConfig };
  
  // Handle primitive values
  Object.keys(remoteConfig).forEach(key => {
    if (remoteConfig[key] !== undefined && remoteConfig[key] !== null) {
      if (typeof remoteConfig[key] === 'object' && !Array.isArray(remoteConfig[key])) {
        // Deep merge objects
        merged[key] = {
          ...(merged[key] || {}),
          ...remoteConfig[key]
        };
      } else {
        // Override primitive values and arrays
        merged[key] = remoteConfig[key];
      }
    }
  });
  
  return merged;
};
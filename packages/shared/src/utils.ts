export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
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
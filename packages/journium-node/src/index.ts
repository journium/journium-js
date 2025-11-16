import { JourniumNodeClient } from './client';

export { JourniumNodeClient } from './client';
export * from '@journium/core';

export const init = (config: any) => {
  return new JourniumNodeClient(config);
};

export default { init, JourniumNodeClient };
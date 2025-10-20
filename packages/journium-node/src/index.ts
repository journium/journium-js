import { JourniumNodeClient } from './client';

export { JourniumNodeClient } from './client';
export * from '@journium/shared';

export const init = (config: any) => {
  return new JourniumNodeClient(config);
};

export default { init, JourniumNodeClient };
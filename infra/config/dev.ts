import type { EnvironmentConfig } from './types.js';

export const devConfig: EnvironmentConfig = {
  env: 'dev',
  region: 'us-east-1',
  domain: {
    zoneName: 'mypapervault.com',
    subdomain: 'dev',
  },
};

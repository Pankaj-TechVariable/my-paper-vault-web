import type { EnvironmentConfig } from './types.js';
import { devConfig } from './dev.js';
import { prodConfig } from './prod.js';

const configs: Record<string, EnvironmentConfig> = {
  dev: devConfig,
  prod: prodConfig,
};

export function getConfig(envName: string): EnvironmentConfig {
  const config = configs[envName];
  if (!config) {
    throw new Error(
      `Unknown environment: "${envName}". Available: ${Object.keys(configs).join(', ')}`
    );
  }
  return config;
}

export interface EnvironmentConfig {
  env: 'dev' | 'prod';
  region: string;
  account?: string; // AWS account ID — uses CDK_DEFAULT_ACCOUNT if omitted
}

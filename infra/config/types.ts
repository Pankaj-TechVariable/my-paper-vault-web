export interface EnvironmentConfig {
  env: 'dev' | 'prod';
  region: string;
  account?: string; // AWS account ID — uses CDK_DEFAULT_ACCOUNT if omitted
  domain?: {
    // Zone name as registered in Route 53 (must already exist — looked up,
    // never created by this stack). Certificate + DNS record are provisioned
    // for `subdomain` under this zone.
    zoneName: string;
    subdomain: string; // e.g. 'www' or 'dev' — full domain is `${subdomain}.${zoneName}`
  };
}

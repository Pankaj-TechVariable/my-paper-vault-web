# MyPaperVault — Frontend Infrastructure (AWS CDK)

AWS CDK TypeScript project that deploys the MyPaperVault web application to S3 + CloudFront.

## Architecture

```
Browser → CloudFront → S3 (private bucket)
```

- **S3 bucket** — private, serves static files exclusively via CloudFront
- **CloudFront distribution** — HTTPS, OAC authentication to S3, SPA routing, asset caching
- **Origin Access Control (OAC)** — modern, secure way to grant CloudFront access to S3

### Caching Strategy

| Path | Cache | Reason |
|---|---|---|
| `/` and `*.html` | No cache | Always fetch the latest entry point |
| `/assets/*` | Permanent | Vite outputs content-hashed filenames |

### SPA Routing

403 and 404 errors from S3 are rewritten to return `index.html` (HTTP 200) so React Router can handle client-side navigation.

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured with a profile that has CloudFormation + S3 + CloudFront permissions
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) — `npm install -g aws-cdk`
- CDK bootstrapped in the target account/region (one-time per account):
  ```bash
  cdk bootstrap aws://<account-id>/us-east-1
  ```

## Getting Started

```bash
cd infra
npm install
```

## Commands

| Command | Description |
|---|---|
| `npm run deploy:dev` | Build + deploy to dev environment |
| `npm run deploy:prod` | Build + deploy to prod environment |
| `npm run diff:dev` | Preview changes before deploying (dev) |
| `npm run diff:prod` | Preview changes before deploying (prod) |
| `npm run synth:dev` | Synthesize CloudFormation template (dev) |
| `npm run build` | Compile TypeScript only |

## Deployment

1. Build the web app from the project root:
   ```bash
   cd ..
   npm run build
   ```

2. Deploy to dev:
   ```bash
   cd infra
   npm run deploy:dev
   ```

3. The stack outputs the CloudFront URL:
   ```
   DistributionUrl = https://xxxxxxxxxxxxx.cloudfront.net
   ```

## Environments

| Setting | Dev | Prod |
|---|---|---|
| S3 removal policy | DESTROY | RETAIN |
| CloudFront price class | PRICE_CLASS_100 | PRICE_CLASS_100 |

To add a custom domain, add an `ACM certificate ARN` to `EnvironmentConfig` and wire it into the `domainNames` + `certificate` props on the CloudFront distribution.

## File Structure

```
infra/
├── bin/
│   └── infra.ts              # CDK app entrypoint
├── lib/
│   └── frontend-stack.ts     # S3 + CloudFront stack
├── config/
│   ├── types.ts              # EnvironmentConfig interface
│   ├── index.ts              # Config resolver
│   ├── dev.ts                # Dev environment config
│   └── prod.ts               # Prod environment config
├── cdk.json                  # CDK CLI config
└── tsconfig.json             # TypeScript config
```

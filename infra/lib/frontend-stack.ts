import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Construct } from 'constructs';
import type { EnvironmentConfig } from '../config/types.js';

// __dirname doesn't exist under "type": "module" (true ESM) — this is the
// standard replacement.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface FrontendStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class FrontendStack extends cdk.Stack {
  public readonly distributionUrl: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { config } = props;
    const isProd = config.env === 'prod';

    // ── S3 Bucket ──────────────────────────────────────────────────────────
    // Private bucket — served exclusively through CloudFront via OAC.
    const bucket = new s3.Bucket(this, 'WebBucket', {
      bucketName: `mypapervault-${config.env}-web`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
    });

    // ── CloudFront Origin (OAC) ────────────────────────────────────────────
    // Origin Access Control is the modern replacement for OAI.
    const origin = origins.S3BucketOrigin.withOriginAccessControl(bucket);

    // ── Custom Domain + TLS Certificate ─────────────────────────────────────
    // Only wired up when config.domain is set — an environment without it
    // (e.g. an ad-hoc test env) keeps using the raw *.cloudfront.net URL.
    //
    // Certificate is provisioned via ACM with DNS validation, not created
    // manually in the console: DNS validation auto-renews indefinitely with
    // zero manual action (unlike email validation, which requires someone to
    // click a renewal link every cycle), and — because the hosted zone below
    // is looked up from Route 53 — CDK creates the validation CNAME record
    // itself. No manual DNS step, no ARN to track down later, the certificate
    // is defined as code the same way every other resource here is.
    //
    // Must be created in us-east-1 regardless of which region the rest of
    // the stack deploys to — CloudFront only accepts ACM certificates from
    // that region. This stack already deploys to us-east-1 (see config/*.ts),
    // so no cross-region trickery is needed, but it's worth flagging: a
    // certificate created in the wrong region silently fails to attach.
    let certificate: acm.ICertificate | undefined;
    let domainNames: string[] | undefined;
    let hostedZone: route53.IHostedZone | undefined;
    let fullDomainName: string | undefined;

    if (config.domain) {
      fullDomainName = `${config.domain.subdomain}.${config.domain.zoneName}`;
      domainNames = [fullDomainName];

      // Looked up, never created here — the zone must already exist in
      // Route 53 under this account. Confirmed present before this change:
      // mypapervault.com (hosted zone Z0804412LSTPBVYXUPKG).
      hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
        domainName: config.domain.zoneName,
      });

      certificate = new acm.Certificate(this, 'Certificate', {
        domainName: fullDomainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });
    }

    // ── Cache Policies ─────────────────────────────────────────────────────
    // index.html — must never be cached; browsers must always fetch the latest.
    const noCachePolicy = new cloudfront.CachePolicy(this, 'NoCachePolicy', {
      cachePolicyName: `mypapervault-${config.env}-no-cache`,
      defaultTtl: cdk.Duration.seconds(0),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.seconds(0),
    });

    // ── CloudFront Distribution ────────────────────────────────────────────
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `MyPaperVault ${config.env} web`,
      defaultRootObject: 'index.html',
      domainNames,
      certificate,

      // SPA routing — return index.html for any 403/404 so React Router handles it.
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],

      defaultBehavior: {
        origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        // index.html, manifest.json, etc. — no cache
        cachePolicy: noCachePolicy,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        compress: true,
      },

      additionalBehaviors: {
        // Vite outputs hashed filenames under /assets — cache forever.
        '/assets/*': {
          origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          compress: true,
        },
      },

      // PRICE_CLASS_100 covers US/EU/Asia — cheapest tier.
      // Switch to PRICE_CLASS_ALL for global coverage in prod if needed.
      priceClass: isProd
        ? cloudfront.PriceClass.PRICE_CLASS_100
        : cloudfront.PriceClass.PRICE_CLASS_100,

      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    });

    this.distributionUrl = fullDomainName
      ? `https://${fullDomainName}`
      : `https://${distribution.distributionDomainName}`;

    // ── DNS — alias the custom domain at CloudFront ─────────────────────────
    // A + AAAA alias records (not CNAME — CNAME can't be used at a zone apex
    // and ARecord/AaaaRecord with an alias target is the standard, free way
    // to point a Route 53 name at a CloudFront distribution). Created only
    // when config.domain is set, alongside the certificate above.
    if (config.domain && hostedZone && fullDomainName) {
      const target = route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      );

      new route53.ARecord(this, 'AliasRecordIPv4', {
        zone: hostedZone,
        recordName: config.domain.subdomain,
        target,
      });

      new route53.AaaaRecord(this, 'AliasRecordIPv6', {
        zone: hostedZone,
        recordName: config.domain.subdomain,
        target,
      });
    }

    // ── Deploy & Invalidate ────────────────────────────────────────────────
    // Uploads the Vite build output to S3, then invalidates the CloudFront cache.
    // Run `npm run build` in the project root before deploying.
    new s3deploy.BucketDeployment(this, 'Deploy', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../dist'))],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
      memoryLimit: 512,
    });

    // ── Outputs ────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'S3 bucket that serves the web app',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID (needed for manual cache invalidation)',
    });

    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: this.distributionUrl,
      description: config.domain
        ? 'Custom domain URL (alias of the CloudFront distribution below) — set this as VITE_APP_URL in CI/CD'
        : 'CloudFront URL — set this as VITE_APP_URL in CI/CD',
    });

    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Raw *.cloudfront.net URL — always works, useful for testing before/without DNS propagation',
    });
  }
}

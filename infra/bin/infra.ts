#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { getConfig } from '../config/index.js';
import { FrontendStack } from '../lib/frontend-stack.js';

const app = new cdk.App();

// Pass environment via CDK context: cdk deploy -c env=dev
const envName = app.node.tryGetContext('env') ?? 'dev';
const config = getConfig(envName);

const stackEnv = {
  account: config.account ?? process.env.CDK_DEFAULT_ACCOUNT,
  region: config.region,
};

new FrontendStack(app, `mypapervault-${config.env}-web`, {
  env: stackEnv,
  config,
  description: `MyPaperVault web (S3 + CloudFront) — ${config.env}`,
});

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';

import { CodeServerEc2Stack } from '../lib/code-server-ec2-stack';

const app = new cdk.App();
new CodeServerEc2Stack(app, 'CodeServerEc2Stack', { 
    env: {
        region: process.env.AWS_DEFAULT_REGION,
    },
});

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SimpleFrontendBackendEcsStack } from '../lib/simple-frontend-backend-ecs-stack';

const app = new cdk.App();
new SimpleFrontendBackendEcsStack(app, 'SimpleFrontendBackendEcsStack');

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CodeServerEcsStack } from '../lib/code-server-ecs-stack';

const app = new cdk.App();
new CodeServerEcsStack(app, 'CodeServerEcsStack');

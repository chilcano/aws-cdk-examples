#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SimplePhpTsEcsStack } from '../lib/simple-php-ts-ecs-stack';

const app = new cdk.App();
new SimplePhpTsEcsStack(app, 'SimplePhpTsEcsStack');

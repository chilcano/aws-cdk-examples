#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { QuicksightSimpleStack } from '../lib/quicksight-simple-stack';

const app = new cdk.App();
new QuicksightSimpleStack(app, 'QuicksightSimpleStack');

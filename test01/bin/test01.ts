#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Test01Stack } from '../lib/test01-stack';

const app = new cdk.App();
new Test01Stack(app, 'Test01Stack');

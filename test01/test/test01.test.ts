import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Test01 from '../lib/test01-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Test01.Test01Stack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});

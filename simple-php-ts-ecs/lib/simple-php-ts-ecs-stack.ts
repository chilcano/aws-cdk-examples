import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as logs from '@aws-cdk/aws-logs';
import * as path from 'path';

export class SimplePhpTsEcsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new ec2.Vpc(this, "SimplePhpVpc", {
      maxAzs: 3
    });

    const cluster = new ecs.Cluster(this, "EcsCluster", {
      vpc: vpc
    });

    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "AlbFargate", {
      cluster: cluster,         // required
      cpu: 512,                 // default is 256
      desiredCount: 3,          // default is 1
      taskImageOptions: {image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample")},
      memoryLimitMiB: 2048,     // default is 512
      publicLoadBalancer: true  // default is false
    });

  }
}
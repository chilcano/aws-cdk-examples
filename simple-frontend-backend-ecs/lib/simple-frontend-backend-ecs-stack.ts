import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as logs from '@aws-cdk/aws-logs';
import * as ecr_assets from '@aws-cdk/aws-ecr-assets';

export class SimpleFrontendBackendEcsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "FeBeVpc", { maxAzs: 2 });
    const cluster = new ecs.Cluster(this, "EcsCluster", { vpc: vpc });
    cluster.addDefaultCloudMapNamespace({ name: "service.local" });

    // Frontend - Python Flask built from Dockerfile and Docker Hub (registry)
    const feAssetDckr = new ecr_assets.DockerImageAsset(this, "FeAssetDckr", { directory: "./frontend", file: "Dockerfile" });
    const feTaskDef = new ecs.FargateTaskDefinition(this, "FeTaskDef", { cpu: 512, memoryLimitMiB: 2048 });
    const feContainer = feTaskDef.addContainer("FeContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(feAssetDckr),
      essential: true,
      environment: { "LOCALDOMAIN": "service.local" },
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "FeContainer", logRetention: logs.RetentionDays.FIVE_DAYS })
    });
    feContainer.addPortMappings({ containerPort: 5000, hostPort: 5000 })
    const feSvc = new ecs_patterns.NetworkLoadBalancedFargateService(this, "FeSvc", {
      serviceName: "frontend",               // serviceName must match with cloudMap name value
      cluster: cluster,
      cloudMapOptions: { name: "frontend" }, // this value must match with serviceName
      cpu: 512,
      desiredCount: 2,
      taskDefinition: feTaskDef,
      memoryLimitMiB: 2048,
      listenerPort: 80,
      publicLoadBalancer: true,
    });
    feSvc.service.connections.allowFromAnyIpv4(ec2.Port.tcp(5000), "flask inbound");

    // Backend - Redis from AWS ECR (registry)
    const beTaskDef = new ecs.FargateTaskDefinition(this, "BeTaskDef", { cpu: 512, memoryLimitMiB: 2048 });
    const beContainer = beTaskDef.addContainer("BeContainer", {
      image: ecs.ContainerImage.fromRegistry("redis:alpine"),
      essential: true,
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "BeContainer", logRetention: logs.RetentionDays.FIVE_DAYS })
    });
    beContainer.addPortMappings({ containerPort: 6379, hostPort: 6379 });
    const beSvc = new ecs_patterns.NetworkLoadBalancedFargateService(this, "BeSvc", {
      serviceName: "backend",               // serviceName must match with cloudMap name value
      cluster: cluster,
      cloudMapOptions: { name: "backend" }, // this value must match with serviceName
      cpu: 512,
      desiredCount: 2,
      taskDefinition: beTaskDef,
      memoryLimitMiB: 2048,
      listenerPort: 6379,
      publicLoadBalancer: false,     
    });
    beSvc.service.connections.allowFrom(feSvc.service, ec2.Port.tcp(6379), "allow traffic from frontend only");
  }
}

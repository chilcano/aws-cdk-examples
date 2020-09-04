import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as logs from '@aws-cdk/aws-logs';
import * as ecr_assets from '@aws-cdk/aws-ecr-assets';

export class CodeServerEcsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", { maxAzs: 2 });
    const cluster = new ecs.Cluster(this, "Cluster", { vpc: vpc });
    const csTaskDef = new ecs.FargateTaskDefinition(this, "TaskDef", { cpu: 512, memoryLimitMiB: 2048 });
    const csAssetDckr = new ecr_assets.DockerImageAsset(this, "CsAssetDckr", { directory: "./cs", file: "Dockerfile" });
    const csContainer = csTaskDef.addContainer("Container", {
      // https://hub.docker.com/r/codercom/code-server
      // https://github.com/cdr/code-server/blob/master/doc/install.md#docker
      //image: ecs.ContainerImage.fromRegistry("codercom/code-server"),

      //https://github.com/linuxserver/docker-code-server
      //https://hub.docker.com/r/linuxserver/code-server
      //image: ecs.ContainerImage.fromRegistry("linuxserver/code-server"),
      //environment: ???
      image: ecs.ContainerImage.fromDockerImageAsset(csAssetDckr),
      essential: true,
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "CsContainer", logRetention: logs.RetentionDays.FIVE_DAYS })
    });
    

    // code-server listen on 8080 port
    csContainer.addPortMappings({ containerPort: 8080, hostPort: 8080 })
    const csSvc = new ecs_patterns.NetworkLoadBalancedFargateService(this, "Svc", {
      serviceName: "code-server",  
      cluster: cluster,
      cpu: 512,
      desiredCount: 2,
      taskDefinition: csTaskDef,
      memoryLimitMiB: 2048,
      listenerPort: 80,           // listener port of NLB rhat will serve traffic to svc
      publicLoadBalancer: true,
    });
    csSvc.service.connections.allowFromAnyIpv4(ec2.Port.tcp(8080), "code-server inbound");

  }
}

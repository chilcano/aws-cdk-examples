import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

import { readFileSync } from 'fs';

export class CodeServerEc2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", { 
      maxAzs: 1,
      cidr: '10.0.0.0/21', 
      subnetConfiguration: [{
          subnetType: ec2.SubnetType.PUBLIC,
          name: 'subnetPub',
          cidrMask: 24
        }]
    });

    const secGrp = new ec2.SecurityGroup(this, 'CsSg', {
      vpc: vpc,
      securityGroupName: 'csSg',
      description: 'Allow HTTP traffic to EC2 instance from anywhere',
      allowAllOutbound: true 
    });

    secGrp.addIngressRule(
      ec2.Peer.anyIpv4(), 
      ec2.Port.tcp(8080), // Code-Server listen on 8080 port 
      'Allow ingress HTTP traffic'                                                                                                                                                     
    )
    secGrp.addIngressRule(
      ec2.Peer.anyIpv4(), 
      ec2.Port.tcp(22), 
      'Allow ingress SSH traffic'                                                                                                                                                     
    );
  
    // https://cloud-images.ubuntu.com/locator/ec2/
    // owner: 099720109477 (ubuntu) 
    const imgLinuxUbu = new ec2.GenericLinuxImage({  
      'us-east-1': 'ami-05cf2c352da0bfb2e',
      'us-east-2': 'ami-0e45766c39d6d6e73',
      'us-west-1': 'ami-0b10e1018d4058364',
      'us-west-2': 'ami-0ba8629bff503c084'
    });

    const instance =  new ec2.Instance(this, 'CsEc2Instance', {
      vpc: vpc,
      machineImage: imgLinuxUbu,
      instanceName: 'code-server-ec2',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      securityGroup: secGrp
    });

    const userData = readFileSync('_assets/scripts/cloud_devops_tools.sh', 'utf-8');
    instance.addUserData( userData );
    instance.instance.addPropertyOverride('KeyName', 'chilcan0');
  }
}

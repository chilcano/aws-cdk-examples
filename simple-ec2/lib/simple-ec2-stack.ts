import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as iam from '@aws-cdk/aws-iam'
import * as fs from 'fs'

require('dotenv').config()

const instanceName = 'node-sast';

const config = {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: process.env.AWS_REGION
  }
}

export class SimpleEc2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    // Its important to add our env config here otherwise CDK won't know our AWS account.
    super(scope, id, props);

    // Get the default VPC. This is the network where your instance will be provisioned.
    // All activated regions in AWS have a default vpc. 
    const defaultVpc = ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true })

    // Create a role for the instance.
    // You can attach permissions to a role and determine what your instance can or can not do.
      const role = new iam.Role(
        this,
        instanceName + '-role', // This is a unique id that will represent this resource in a Cfn template.
        { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') }
      )

    // Create a security group for our instance.
    // A security group acts as a virtual firewall for your instance to control inbound and outbound traffic.
    const securityGroup = new ec2.SecurityGroup(
      this,
      instanceName + '-sg',
      {
        vpc: defaultVpc,
        allowAllOutbound: true, // Will let your instance send outboud traffic.
        securityGroupName: instanceName + '-sg',
      }
    )

    // Use the security group to allow inbound traffic on specific ports.
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allows SSH access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8080),
      'Allows Jenkins HTTP access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8443),
      'Allows Jenkins HTTPS access from Internet'
    )

    // https://cloud-images.ubuntu.com/locator/ec2/
    // owner: 099720109477 (ubuntu)
    // focal, 20.04 LTS, amd64, hvm:ebs-ssd, 20210720
    const imgLinuxUbu = new ec2.GenericLinuxImage({  
      'eu-central-1': 'ami-05e1e66d082e56118',
      'eu-north-1': 'ami-00888f2a5f9be4390',
      'eu-south-1': 'ami-06a3346e9e869f9b1',
      'eu-west-1': 'ami-0298c9e0d2c86b0ed',
      'eu-west-2': 'ami-0230a6736b38ae83e',
      'eu-west-3': 'ami-06d3fffafe8d48b35'
    });

    // EC2 instance
    const instance = new ec2.Instance(this, instanceName, {
      vpc: defaultVpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: instanceName,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        //ec2.InstanceSize.MICRO
        ec2.InstanceSize.MEDIUM        
      ),
      machineImage: imgLinuxUbu,
      keyName: 'tmpkey',
    })

    // Add user_data script to instance.
    instance.addUserData(
      fs.readFileSync('_scripts/user_data_ubuntu_reqs.sh', 'utf8')
    )

    // CDK lets us output properties of the resources we create after they are created.
    // We want the ip address of this new instance so we can ssh into it later.
    new cdk.CfnOutput(this, 'NODEIP', { value: instance.instancePublicIp })
    new cdk.CfnOutput(this, 'NODEDNS', { value: instance.instancePublicDnsName })
  }
}

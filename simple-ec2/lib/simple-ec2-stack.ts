import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2' // import ec2 library 
import * as iam from '@aws-cdk/aws-iam' // import iam library for permissions

// lets include fs module
import * as fs from 'fs'

require('dotenv').config()

const config = {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: process.env.AWS_REGION
  }
}

export class SimpleEc2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    // its important to add our env config here otherwise CDK won't know our AWS account number
    ////super(scope, id, { ...props, env: config.env })
    super(scope, id, props);

    // Get the default VPC. This is the network where your instance will be provisioned
    // All activated regions in AWS have a default vpc. 
    // You can create your own of course as well. https://aws.amazon.com/vpc/
    const defaultVpc = ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true })

    // Lets create a role for the instance
    // You can attach permissions to a role and determine what your
    // instance can or can not do
      const role = new iam.Role(
        this,
        'simple-instance-1-role', // this is a unique id that will represent this resource in a Cloudformation template
        { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') }
      )

    // lets create a security group for our instance
    // A security group acts as a virtual firewall for your instance to control inbound and outbound traffic.
    const securityGroup = new ec2.SecurityGroup(
      this,
      'simple-instance-1-sg',
      {
        vpc: defaultVpc,
        allowAllOutbound: true, // will let your instance send outboud traffic
        securityGroupName: 'simple-instance-1-sg',
      }
    )

    // lets use the security group to allow inbound traffic on specific ports
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allows SSH access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allows HTTP access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allows HTTPS access from Internet'
    )

    // https://cloud-images.ubuntu.com/locator/ec2/
    // owner: 099720109477 (ubuntu) 
    const imgLinuxUbu = new ec2.GenericLinuxImage({  
      'us-east-1': 'ami-05cf2c352da0bfb2e',
      'us-east-2': 'ami-0e45766c39d6d6e73',
      'us-west-1': 'ami-0b10e1018d4058364',
      'us-west-2': 'ami-0ba8629bff503c084'
    });

    const imgLinuxAmzn = ec2.MachineImage.latestAmazonLinux({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    })

    // Finally lets provision our ec2 instance
    const instance = new ec2.Instance(this, 'simple-instance-1', {
      vpc: defaultVpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: 'simple-instance-1',
      instanceType: ec2.InstanceType.of( // t2.micro has free tier usage in aws
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
        // ec2.InstanceClass.T2,
        // ec2.InstanceSize.MEDIUM        
      ),
      // machineImage: ec2.MachineImage.latestAmazonLinux({
      //   generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      // }),
      machineImage: imgLinuxAmzn,
      //keyName: 'simple-instance-1-key', // we will create this in the console before we deploy
      keyName: 'tmpkey',
    })

    // add user script to instance
    // this script runs when the instance is started 
    instance.addUserData(
      fs.readFileSync('lib/install_wp_amzn.sh', 'utf8')
    )

    // cdk lets us output properties of the resources we create after they are created
    // we want the ip address of this new instance so we can ssh into it later
    new cdk.CfnOutput(this, 'simple-instance-1-output', {
      value: instance.instancePublicIp
    })
  }
}

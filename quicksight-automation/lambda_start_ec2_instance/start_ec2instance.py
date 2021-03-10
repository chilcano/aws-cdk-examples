import boto3

_ec2_instance_id='i-07285b4b01414531c'

ec2 = boto3.client('ec2')
def start_ec2instance(event, context):
    ec2.start_instances(InstanceIds= [_ec2_instance_id])
    
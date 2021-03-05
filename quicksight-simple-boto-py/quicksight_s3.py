import time
import sys
import boto3

qs_cli = boto3.client('quicksight')

response = qs_cli.list_templates(AwsAccountId='11111', MaxResults=1)
return str(response)

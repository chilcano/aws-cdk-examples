import time
import sys
import boto3
from botocore.config import Config
import json


### create s3 bucket
s3_bucket_name="temp_bucket_01"



### attach lambda exec role to lambda to write into s3 and get access to quicksight
iam=boto3.client('iam')
lambda_exec_role = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "logs:CreateLogGroup",
            "Resource": "RESOURCE_ARN"
        },
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:DeleteItem",
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:Scan",
                "dynamodb:UpdateItem"
            ],
            "Resource": "RESOURCE_ARN"
        }
    ]
}
response_policy = iam.create_policy(
    PolicyName='lambdaExecRolePolicyQuickSight',
    PolicyDocument=json.dumps(lambda_exec_role)
)
print('---> IAM Policy created: ' + response_policy)
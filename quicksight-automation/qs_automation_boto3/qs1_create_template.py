import time
import sys
import boto
import boto3
from botocore.config import Config

acc_id='601163517885'
# ireland: eu-west-1, london: eu-west-2
cfg = Config(
    region_name = 'eu-west-2',
    signature_version = 'v4',
    retries = {
        'max_attempts': 10,
        'mode': 'standard'
    }
)

qs_analysis_arn=""
client_qs = boto3.client('quicksight')

response_qs = client_qs.list_data_sets(
    AwsAccountId = acc_id,
    MaxResults = 100
)


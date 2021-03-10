import time
import sys
import boto3
from botocore.config import Config

acc_id='601163517885'
# ireland: eu-west-2, london: eu-west-1
cfg = Config(
    region_name = 'eu-west-2', # ireland
    signature_version = 'v4',
    retries = {
        'max_attempts': 10,
        'mode': 'standard'
    }
)

client_qs = boto3.client('quicksight', config = cfg)

response_qs = client_qs.

response_qs = client_qs.list_data_sets(
    AwsAccountId = acc_id,
    MaxResults = 100
)
i = 0
for r in response_qs['DataSetSummaries']:
    dataset_info = {}
    dataset_info['id'] = r['DataSetId']
    dataset_info['name'] = r['Name']
    i = i+1
    print ('\t', i, '\t-> DataSet name: ' + dataset_info['name'] + ' -> Id: ' + dataset_info['id'])

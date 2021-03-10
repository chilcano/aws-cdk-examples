import time
import sys
import boto3
from botocore.config import Config
import json

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

quicksight_client=boto3.client('quicksight', config=cfg)
quicksight_response=quicksight_client.list_data_sets(
    AwsAccountId=acc_id,
    MaxResults=100
)
i=0
for r in quicksight_response['DataSetSummaries']:
    dataset_info={}
    dataset_info['id']=r['DataSetId']
    dataset_info['name']=r['Name']
    i=i+1
    print('\t', i, '\t-> DataSet name: ' + dataset_info['name'] + ' -> Id: ' + dataset_info['id'])


#dataset_ids=['0e994f54-8d08-4b64-98ca-195cf7b46077','16d5bf20-4415-42d1-b54c-9aba95b13d67','5c5fd93a-0bb6-468f-a0c4-ff1c15597d20']
#dataset_ids=dataset_info
k=0
for dsid in dataset_info['id']:
    response = quicksight_client.tag_resource(
        #ResourceArn='arn:aws:quicksight:us-east-1:123456678788:dataset/{}'.format(i),
        ResourceArn='arn:aws:quicksight:' + cfg.region_name + ':' + acc_id + ':dataset/{}'.format(dsid),
        Tags=[
            {
                'Key' : 'DashboardName',
                'Value' : 'QuickSight_refresh_status_demo'
            }
            ]
    )
    print(k, '\t -> ' + dsid)

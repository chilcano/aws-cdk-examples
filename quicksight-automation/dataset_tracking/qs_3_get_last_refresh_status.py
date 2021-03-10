import json
import boto3
import csv
from botocore.exceptions import ClientError
from datetime import datetime
from datetime import timedelta
from datetime import timezone
import jmespath

glue = boto3.client('glue')
s3= boto3.client('s3')
client = boto3.client('resourcegroupstaggingapi')
client1 = boto3.client('quicksight')
dataset_ids=[]
AwsAccountId='123456678788'
def lambda_handler(event, context):
    items=[]
    tagfilters=[
        {
            'Key': 'DashboardName',
            'Values': [
                'QuickSight_refresh_status_demo'
                            #add dashboard name
            ]
        },
    ]


    response = client.get_resources(
    TagFilters=tagfilters
    )
    
    # Get the response back for each of the above listed Key Values
    resources = response['ResourceTagMappingList']
    for resource in resources:
        perm=""
        data={}
        permission=[]
        data['resource_ARN']=resource['ResourceARN']
        dataset_id_arn=data['resource_ARN'].split('/')
        data['dataset_id']=dataset_id_arn[1]
        # For each of the above dataset , describe the dataset to get the data source
        response = client1.describe_data_set(
                 AwsAccountId=AwsAccountId,
                 DataSetId=data['dataset_id']
        )

        datasourcearn = jmespath.search('DataSet.PhysicalTableMap.*.*.DataSourceArn',response)
        datasourcearnid= str(datasourcearn[0]).split('/')
        datasourcearnid=datasourcearnid[1]
        datasourcearnid=datasourcearnid.replace("']",'')
        data['DatasetName']=response.get('DataSet').get('Name')
        response = client1.describe_data_source(
            AwsAccountId=AwsAccountId,
            DataSourceId=datasourcearnid
        )
        datasourcename=response.get('DataSource').get('Name')
        data['DataSourceName']=datasourcename
        resource_tags = resource['Tags']
        for tag in resource_tags:

                if tag['Key'] == 'DashboardName':
                    data['dashboard_name'] = tag['Value']

        response1= client1.list_ingestions(
            DataSetId=data['dataset_id'],
            AwsAccountId=AwsAccountId,
            MaxResults=1  # To get the latest ingestion, if you want history you can change this number
        )

        if response1.get('Ingestions'):
            for i in response1['Ingestions']:
                data['IngestionId']=i['IngestionId']
                data['CreatedTime']=i['CreatedTime']
                try:
                    response = client1.describe_ingestion(DataSetId=data['dataset_id'],IngestionId=data['IngestionId'],AwsAccountId=AwsAccountId)

                    if  response:
                        data['Time']=str(response['Ingestion']['CreatedTime'])
                        if ((datetime.utcnow() - response['Ingestion']['CreatedTime'].replace(tzinfo=None)).total_seconds()) >= (24*60*60):  #Check the refresh status within last 24 hours, you can change this per your requirement
                            data['Status']='Did not run within last 24 hrs'
                        else:
                            data['Status']=response['Ingestion']['IngestionStatus']
                except ClientError as e:
                    data['Time']='Failed, Check if dataset is being used'
                    data['Status']=e.response['Error']['Message']

            items.append(data)


    row=['DashboardName,DatsetName,Status,Time,DataSourceName']
    csv_key='quicksight-dashboard-metada/report.csv'

    for data in items:

        row.append(data['dashboard_name'] +','+data['DatasetName']+','+data['Status']+','+data['Time']+','+data['DataSourceName'])
    values = '\n'.join(str(v) for v in row)

    response = s3.put_object(
        Body=values,
        Bucket='bucketname',
        Key=csv_key
    )
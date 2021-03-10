import boto3, logging, sys

_s3_bucket_name='aaa_temp_1'
_zip_file_name='start_ec2instance.zip'

def lambda_build(lambda_function_name, iam_role):
  client = boto3.client('lambda')

  create_lambda_function = client.create_function(
      FunctionName=LambdafunctionName,
      Runtime='python3.7',
      Role=iam_role,
      Handler='{}.lambda_handler'.format('lambda_build'),
      Description='Start an EC2 instance',
      Code = {
          'S3Bucket':_s3_bucket_name, 
          'S3Key':_zip_file_name
          }
  )

lambda_function_name = sys.argv[1]
iam_role = sys.argv[2]
lambda_build(lambda_function_name, iam_role)

## execute in this way:
## python lambda_build.py '<your-lambda-name>' '<your-lambda-iam-role-arn>'

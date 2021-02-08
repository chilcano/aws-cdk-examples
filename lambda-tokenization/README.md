# Tokenization and Encryption of sensitive data

* https://github.com/aws-samples/aws-serverless-tokenization
* Raspberry Pi and AWS SAM CLI Serverless Application Model:
https://bokunimo.net/blog/raspberry-pi/596/

## Step 1: Environment setup

- Ubuntu
- Cloud-Server
- AWS SAM CLI
- Docker
- AWS Toolkit for VSCode

```sh
$ python3 --version
Python 3.8.2
$ sudo apt install -y python3-pip
$ sudo pip3 install --user aws-sam-cli
$ pip3 --version
pip 20.0.2 from /usr/lib/python3/dist-packages/pip (python 3.8)
$ sudo pip3 install --user aws-sam-cli

$ echo "## AWS SAM CLI" >> ~/.bashrc
$ printf "SAM_CLI_TELEMETRY=0\n" >> ~/.bashrc
$ printf 'export PATH="$HOME/.local/bin:$PATH"\n\n' >> ~/.bashrc
$ . ~/.bashrc
$ sam --version
SAM CLI, version 1.2.0
```

## Step 2: Clone the Git repo

```sh
$ git clone https://github.com/chilcano/aws-tokenization-cdk
```

## Step 3: Create S3 Bucket

```sh
$ export AWS_ACCESS_KEY_ID="1234567890"; export AWS_SECRET_ACCESS_KEY="abcdefghijklnmopqrstuvwxyz";export AWS_DEFAULT_REGION="us-east-1"

$ _UNIQUE_S3_BUCKET_NAME="tokenization-bucket"
$ aws s3 mb s3://${_UNIQUE_S3_BUCKET_NAME}
```

## Step 4: Create Customer Managed KMS Key

```sh
$ cd aws-tokenization-cdk/src/01_encryption_keys/
$ sam build --use-container -t template.yaml
$ sam package --s3-bucket ${_UNIQUE_S3_BUCKET_NAME} --output-template-file packaged.yaml
$ _STACK_NAME_01="tokenization-stack-01"
$ sam deploy --template-file packaged.yaml --stack-name ${_STACK_NAME_01} --capabilities CAPABILITY_IAM

$ aws cloudformation describe-stacks --stack-name ${_STACK_NAME_01} | jq -r '.Stacks[].Outputs["KMSKeyID"].OutputValue'
{
  "OutputKey": "KMSKeyID",
  "OutputValue": "arn:aws:kms:us-east-1:1234567890:key/abcdefghijklnmopqrstuvwxyz",
  "Description": "ARN for CMS Key created"
}

$ _KMS_KEY_ID="$(aws cloudformation describe-stacks --stack-name ${_STACK_NAME_01} | jq -r '.Stacks[].Outputs[] | .OutputValue')"
```

## Step 5: Create Lambda Layer for String Tokenization and Encrypted Data Store

## Step 5.3 Run the script to compile and install the dependent libraries in dynamodb-client/python/ directory. 

```sh
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
hello-world         latest              bf756fb1ae65        8 months ago        13.3kB

$ cd ../02_tokenizer_lambda/
$ ./get_AMI_packages_cryptography.sh

Enable to find image 'lambci/lambda:build-python3.7' locally
build-python3.7: Pulling from lambci/lambda
f9fc003cec10: Pull complete 
9f0ae58b25e8: Pull complete 
49a6a114df86: Pull complete 
ac2a75c12ea0: Pull complete 
.....
Successfully installed attrs-20.2.0 boto3-1.15.2 botocore-1.18.2 cffi-1.14.3 cryptography-3.1 dynamodb-encryption-sdk-1.2.0 jmespath-0.10.0 pycparser-2.20 python-dateutil-2.8.1 s3transfer-0.3.3 six-1.15.0 urllib3-1.25.10

$ docker images 
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
lambci/lambda       build-python3.7     87e10754d67b        3 days ago          2.4GB
hello-world         latest              bf756fb1ae65        8 months ago        13.3kB
```

## Step 5.4 Build the SAM template (template.yaml)

```sh
$ sam build --use-container -t template.yaml
``` 

## Step 5.5 Copy the python files ddb_encrypt_item.py and hash_gen.py to dynamodb-client/python/. 

```sh
$ cp ddb_encrypt_item.py dynamodb-client/python/; cp hash_gen.py dynamodb-client/python/
```

## Step 5.6 Package the code and push to S3 Bucket. 

```sh
$ sam package --s3-bucket ${_UNIQUE_S3_BUCKET_NAME} --output-template-file packaged.yaml
```

## Step 5.7 Similar to Step 4.4, create CloudFormation stack using the below code to create resources and deploy your code. 

```sh
$ _STACK_NAME_02="tokenization-stack-02-02"
$ sam deploy --template-file packaged.yaml --stack-name ${_STACK_NAME_02} --capabilities CAPABILITY_IAM

$ aws cloudformation describe-stacks --stack-name ${_STACK_NAME_02} | jq -r '.Stacks[].Outputs[]'

{
  "OutputKey": "LayerVersionArn",
  "OutputValue": "arn:aws:lambda:us-east-1:1234567890:layer:TokenizeData:1",
  "Description": "ARN for the published Layer version",
  "ExportName": "TokenizeData"
}
{
  "OutputKey": "DynamoDBArn",
  "OutputValue": "arn:aws:dynamodb:us-east-1:1234567890:table/CreditCardTokenizerTable",
  "Description": "ARN for DynamoDB Table"
}

$ _LAYER_VERSION_ARN="$(aws cloudformation describe-stacks --stack-name ${_STACK_NAME_02} | jq -r '.Stacks[].Outputs[0] | .OutputValue')"
$ _DYNAMODB_ARN="$(aws cloudformation describe-stacks --stack-name ${_STACK_NAME_02} | jq -r '.Stacks[].Outputs[1] | .OutputValue')"
``` 

## Step 6: Create Serverless Application


## Step 6.2 Build SAM template. 

```sh
$ cd ../03_serverless_app/
$ sam build --use-container --parameter-overrides layerarn=${_LAYER_VERSION_ARN}
``` 

## Step 6.3 Package the code and push to S3 Bucket. 

```sh
$ sam package --s3-bucket ${_UNIQUE_S3_BUCKET_NAME} --output-template-file packaged.yaml
```

## Step 6.4 Similar to Step 4.4, deploy code and resources to AWS using the packaged.yaml. 

```sh
$ _STACK_NAME_03="tokenization-stack-03"
$ sam deploy --template-file packaged.yaml --stack-name ${_STACK_NAME_03} --capabilities CAPABILITY_IAM --parameter-overrides layerarn=${_LAYER_VERSION_ARN} kmsid=${_KMS_KEY_ID} dynamodbarn=${_DYNAMODB_ARN}

$ aws cloudformation describe-stacks --stack-name ${_STACK_NAME_03} | jq -r '.Stacks[].Outputs'
[
  {
    "OutputKey": "CustomerOrderFunction",
    "OutputValue": "arn:aws:lambda:us-east-1:263455585760:function:tokenization-stack-03-CustomerOrderFunction-STYPAO45271Y",
    "Description": "Customer Order Lambda Function ARN"
  },
  {
    "OutputKey": "PaymentMethodApiURL",
    "OutputValue": "https://jwc0q1snhg.execute-api.us-east-1.amazonaws.com/dev",
    "Description": "API Gateway endpoint URL for CustomerOrderFunction"
  },
  {
    "OutputKey": "AccountId",
    "OutputValue": "263455585760",
    "Description": "AWS Account Id"
  },
  {
    "OutputKey": "UserPoolAppClientId",
    "OutputValue": "3usbhm797b7gfo6m0eo7t9scr8",
    "Description": "User Pool App Client for your application"
  },
  {
    "OutputKey": "Region",
    "OutputValue": "us-east-1",
    "Description": "Region"
  },
  {
    "OutputKey": "UserPoolArn",
    "OutputValue": "arn:aws:cognito-idp:us-east-1:263455585760:userpool/us-east-1_NxkZImN3v",
    "Description": "User Pool Arn for the cognito pool"
  },
  {
    "OutputKey": "LambdaExecutionRole",
    "OutputValue": "arn:aws:iam::263455585760:role/tokenization-stack-03-LambdaExecutionRole-13BC8ZVTZFYYT",
    "Description": "Implicit IAM Role created for Hello World function"
  }
]
```

## Step 6.6 Update KMS permissions to allow Lambda Function to generate data keys for encryption. 


```sh
$ _ACCOUNT_ID="$(aws cloudformation describe-stacks --stack-name ${_STACK_NAME_03} | jq -r '.Stacks[].Outputs[2] | .OutputValue')"
$ _ROOT_PRINCIPAL="arn:aws:iam::${_ACCOUNT_ID}:root"
$ _LAMBDA_EXECUTION_ROLE="$(aws cloudformation describe-stacks --stack-name ${_STACK_NAME_03} | jq -r '.Stacks[].Outputs[6] | .OutputValue')"

$ _POLICY=$(cat << EOF
{ 
    "Version": "2012-10-17", 
    "Id": "key-default-1", 
    "Statement": [ 
        { 
            "Sid": "Enable IAM User Permissions", 
            "Effect": "Allow", 
            "Principal": {"AWS": ["$_ROOT_PRINCIPAL"]}, 
            "Action": "kms:*", 
            "Resource": "$_KMS_KEY_ID" 
        }, 
        { 
            "Sid": "Enable IAM User Permissions", 
            "Effect": "Allow", 
            "Principal": {"AWS": ["$_LAMBDA_EXECUTION_ROLE"]}, 
            "Action": ["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey", "kms:GenerateDataKeyWithoutPlaintext"], 
            "Resource": "$_KMS_KEY_ID" 
        } 
    ] 
}
EOF
); \
aws kms put-key-policy --key-id "$_KMS_KEY_ID" --policy-name default --policy "$_POLICY"
```

## Step 6.7 Create a Cognito user with the following code. 

```sh
$ _USER_POOL_APP_CLIENT_ID="$(aws cloudformation describe-stacks --stack-name ${_STACK_NAME_03} | jq -r '.Stacks[].Outputs[3] | .OutputValue')"
$ _REGION="$(aws cloudformation describe-stacks --stack-name ${_STACK_NAME_03} | jq -r '.Stacks[].Outputs[4] | .OutputValue')"
$ _USER_NAME="chilcano@intix.info"
$ _PASSWORD="Passw0rd-here"

$ aws cognito-idp sign-up --region ${_REGION} --client-id ${_USER_POOL_APP_CLIENT_ID} --username ${_USER_NAME} --password ${_PASSWORD}

{
    "UserConfirmed": false,
    "CodeDeliveryDetails": {
        "Destination": "r***@i***.info",
        "DeliveryMedium": "EMAIL",
        "AttributeName": "email"
    },
    "UserSub": "2fcd6f1b-dab9-4a9c-9b56-88b6eba25b62"
}
```

## Step 6.8 Lets verify the Cognito user we just created

Note – Replace CONFIRMATION_CODE_IN_EMAIL with the verification code recieved in the email provided in the previous step.

```sh
$ _CONFIRMATION_CODE_IN_EMAIL="807606"

$ aws cognito-idp confirm-sign-up --client-id ${_USER_POOL_APP_CLIENT_ID} --username ${_USER_NAME} --confirmation-code ${_CONFIRMATION_CODE_IN_EMAIL}
```

## Step 6.9 Generate ID token for API authentication. 

```sh
$ _ID_TOKEN=$(aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --client-id ${_USER_POOL_APP_CLIENT_ID} --auth-parameters USERNAME=${_USER_NAME},PASSWORD=${_PASSWORD} | jq -r '.AuthenticationResult.IdToken')
```

## Step 6.10 Let's call /order API to create the order with the following code. 

```sh
$ _PAYMENT_METHOD_API_URL="$(aws cloudformation describe-stacks --stack-name ${_STACK_NAME_03} | jq -r '.Stacks[].Outputs[1] | .OutputValue')"

$ curl -X POST $_PAYMENT_METHOD_API_URL/order -H "Authorization: $_ID_TOKEN" \
-d '{
"CustomerOrder": "1111111110",
"CustomerName": "Chilcano 0",
"CreditCard": "1111-1111-1111-0000",
"Address": "Barcelona, Catalunya, Spain"
}'

{"message": "Order Created Successfully", "CreditCardToken": "5a5ee6b2-9dd2-4e42-bc7f-0325afddd466"}

$ curl -X POST $_PAYMENT_METHOD_API_URL/order -H "Authorization: $_ID_TOKEN" \
-d '{
"CustomerOrder": "2222222220",
"CustomerName": "Pisco Sour 0",
"CreditCard": "2222-2222-2222-0000",
"Address": "Lima, Perú"
}'

{"message": "Order Created Successfully", "CreditCardToken": "b557af27-25e5-4d8f-949d-b654065e44bf"}
```

## Step 6.11 Let's call /paybill API to pay the bill using the previously provided information. 

```sh
$ curl -X POST $_PAYMENT_METHOD_API_URL/paybill -H "Authorization: $_ID_TOKEN" \
-H 'Content-Type: application/json' \
-d '{ "CustomerOrder": "1111111110" }'

{"message": "Payment Submitted Successfully", "CreditCard Charged": "1111-1111-1111-0000"}

$ curl -X POST $_PAYMENT_METHOD_API_URL/paybill -H "Authorization: $_ID_TOKEN" \
-H 'Content-Type: application/json' \
-d '{ "CustomerOrder": "2222222220" }'

{"message": "Payment Submitted Successfully", "CreditCard Charged": "2222-2222-2222-0000"}
```

## Step 6.12 Get the items stored in CustomerOrdeTable

```sh
$ aws dynamodb get-item --table-name CustomerOrderTable --key '{ "CustomerOrder" : { "S": "1111111110" } }' | jq -r '.Item'

{
  "CreditCardToken": {
    "S": "5a5ee6b2-9dd2-4e42-bc7f-0325afddd466"
  },
  "Address": {
    "S": "Barcelona, Catalunya, Spain"
  },
  "CustomerOrder": {
    "S": "1111111110"
  },
  "CustomerName": {
    "S": "Chilcano 0"
  }
}

$ aws dynamodb get-item --table-name CustomerOrderTable --key '{ "CustomerOrder" : { "S": "2222222220" } }' | jq -r '.Item'

{
  "CreditCardToken": {
    "S": "b557af27-25e5-4d8f-949d-b654065e44bf"
  },
  "Address": {
    "S": "Lima, Perú"
  },
  "CustomerOrder": {
    "S": "2222222220"
  },
  "CustomerName": {
    "S": "Pisco Sour 0"
  }
}

$ _CARD_TOKEN_1="$(aws dynamodb get-item --table-name CustomerOrderTable --key '{ "CustomerOrder" : { "S": "1111111110" } }' | jq -r '.Item.CreditCardToken.S')"
$ _CARD_TOKEN_2="$(aws dynamodb get-item --table-name CustomerOrderTable --key '{ "CustomerOrder" : { "S": "2222222220" } }' | jq -r '.Item.CreditCardToken.S')"
```

## Step 6.13 Get the items stored in CreditCardTokenizerTable. 

Replace the value of CreditCardToken (Step 6.11) and AccountId (Step 6.5) with previously identified values.

```sh
$ aws dynamodb get-item --table-name CreditCardTokenizerTable --key "{ \"Hash_Key\" : { \"S\": \"$_CARD_TOKEN_1\" }, \"Account_Id\" : { \"S\" : \"$_ACCOUNT_ID\" } }"
$ aws dynamodb get-item --table-name CreditCardTokenizerTable --key "{ \"Hash_Key\" : { \"S\": \"$_CARD_TOKEN_2\" }, \"Account_Id\" : { \"S\" : \"$_ACCOUNT_ID\" } }"
```

## Step 7: Clean up and delete the resources

```sh
$ aws cloudformation delete-stack --stack-name ${_STACK_NAME_03}
$ aws cloudformation delete-stack --stack-name ${_STACK_NAME_02}
$ aws cloudformation delete-stack --stack-name ${_STACK_NAME_01}

$ aws s3 rb s3://${_UNIQUE_S3_BUCKET_NAME} --force
```


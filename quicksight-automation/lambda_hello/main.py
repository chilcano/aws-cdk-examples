import json, boto3, yaml
from botocore.exceptions import ClientError

config = yaml.load("""
                   role: BasicLambdaRole
                   name: HelloWorld
                   zip: HelloWorld.zip
                   path: ./hello.py
                   handler: hello.handler
                   """,
                   Loader=yaml.BaseLoader)

def setup_roles():
    """ Sets up AWS IAM roles for executing this lambda function. """

    # https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html
    # https://docs.aws.amazon.com/lambda/latest/dg/policy-templates.html
    # https://docs.aws.amazon.com/lambda/latest/dg/intro-permission-model.html#lambda-intro-execution-role
    
    basic_role = """
    Version: '2012-10-17'
    Statement:
        - Effect: Allow
          Principal: 
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
    """

    try:
        client_iam = boto3.client('iam')
        # lambda.awazonaws.com can assume this role. 
        client_iam.create_role(RoleName=config['role'], AssumeRolePolicyDocument=json.dumps(yaml.load(basic_role, Loader=yaml.BaseLoader)))

        # This role has the AWSLambdaBasicExecutionRole managed policy.
        iam.attach_role_policy(RoleName=config['role'], PolicyArn='arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole')
    except EntityAlreadyExistsException as e:
        print('Role with name BasicLambdaRole already exists.')
        pass
    except ClientError as e:
        print('ClientError: \n' + str(e))
        pass

def get_logs():
    """ Returns all logs related to the invocations of this lambda function. """

    log = boto3.client('logs')
    return log.filter_log_events(logGroupName=f'/aws/lambda/{config["name"]}')

def create_function():
    """ Creates and uploads the lambda function. """

    client_lambda = boto3.client('lambda')
    client_iam = boto3.client('iam')

    # Creates a zip file containing our handler code.
    import zipfile
    with zipfile.ZipFile(config['zip'], 'w') as z:
        z.write(config['path'])

    # Loads the zip file as binary code. 
    with open(config['zip'], 'rb') as f: 
        code = f.read()

    role = client_iam.get_role(RoleName=config['role'])
    return client_lambda.create_function(
        FunctionName=config['name'],
        Runtime='python3.6',
        Role=role['Role']['Arn'],
        Handler=config['handler'],
        Code={'ZipFile':code})

def update_function():
    """ Updates the function. """

    client_lambda = boto3.client('lambda')

    # Creates a zip file containing our handler code.
    import zipfile
    with zipfile.ZipFile(config['zip'], 'w') as z:
        z.write(config['path'])

    # Loads the zip file as binary code. 
    with open(config['zip'], 'rb') as f: 
        code = f.read()

    return client_lambda.update_function_code(
        FunctionName=config['name'],
        ZipFile=code)

def invoke_function(first, last):
    """ Invokes the function. """

    client_lambda = boto3.client('lambda')
    resp = client_lambda.invoke(
        FunctionName=config['name'],
        InvocationType='RequestResponse',
        LogType='Tail',
        Payload=json.dumps({'first_name': first, 'last_name': last}))

    print(resp['Payload'].read())
    return resp
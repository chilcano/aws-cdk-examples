


```sh
$ sudo apt -yqq install python3 python3-pip build-essential libssl-dev libffi-dev python3-dev python3-venv > "/dev/null" 2>&1
$ printf ">> $(python3 --version) installed.\n\n"

# remove older .venv
$ deactivate

# create .venv only if you don have it
$ python3 -m venv .venv

# activate
$ source .venv/bin/activate

# only if you have populate this file
$ pip install -r requirements.txt

$ pip install boto3 

## install mypy_boto3 (intellisense) and and mypy (static info)
## Microsoft Pylance is needed? instead Jedy?
https://mypy-boto3.readthedocs.io/en/latest/

# freeze py packages
$ pip freeze > requirements.txt

# set aws credentials
$ aws configure --profile ecs-data

# load aws credentials
$ export AWS_PROFILE=ecs-data

# get version installed
$ pip show boto3

Name: boto3
Version: 1.17.21
Summary: The AWS SDK for Python
Home-page: https://github.com/boto/boto3
Author: Amazon Web Services
Author-email: None
License: Apache License 2.0
Location: /home/roger/gitrepos/aws-cdk-examples/quicksight-simple-boto-py/.venv/lib/python3.8/site-packages
Requires: s3transfer, jmespath, botocore
Required-by: 
```


## References:

QuickSight:
1. https://aws.amazon.com/blogs/big-data/automate-dataset-monitoring-in-amazon-quicksight/
2. https://aws.amazon.com/blogs/big-data/evolve-your-analytics-with-amazon-quicksights-new-apis-and-theming-capabilities/

Boto3:
1. https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html

Lambdas examples:
1. https://gist.github.com/steinwaywhw/9d64db15518099c1f26f254ee35c4217
2. https://adamtheautomator.com/aws-lambda-python/

CI/CD:
1. https://www.youtube.com/watch?v=RexUKmA46Vk
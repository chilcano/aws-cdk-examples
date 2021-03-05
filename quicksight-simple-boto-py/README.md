


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

# freeze py packages
$ pip freeze > requirements.txt



# set aws credentials
$ export AWS_PROFILE=ecs-data




```


## References:

1. https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html
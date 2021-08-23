# Simple EC2

## Reference

https://dev.to/emmanuelnk/part-3-simple-ec2-instance-awesome-aws-cdk-37ia
https://www.digitalocean.com/community/tutorials/how-to-automate-jenkins-setup-with-docker-and-jenkins-configuration-as-code


## Steps

### 1. Setup AWS

This script will install all tools needed such as AWS CLI v2, CDK, Python, NodeJS, etc.
```sh
wget -qN https://raw.githubusercontent.com/chilcano/how-tos/master/src/devops_tools_install_v3.sh 

chmod +x devops_tools_*.sh  
. devops_tools_install_v3.sh --arch=[amd|arm] [--tf-ver=0.11.15-oci] [--packer-ver=1.5.5]
```

Now, configure AWS, you can set the AWS credential as System Environment Variables or as [AWS Named Profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html). I recommend the last one, before listing the created profiles.
```sh
aws configure list-profiles
```
Create it if it has not been created.
```sh
aws configure --profile es

AWS Access Key ID [None]: AKI...
AWS Secret Access Key [None]: AvO...
Default region name [None]: eu-west-2
Default output format [None]: json
```

An annoying thing to do everytime you start working with a fresh project is creating a SSH key-pair, for that I've created a bash script that creates a new SSH key-pair in local and upload it to specific or to all AWS' regions. By default this script will create the SSH key-pair in all regions unless configured. 
```sh
export AWS_PROFILE=es

source <(curl -s https://raw.githubusercontent.com/chilcano/how-tos/master/src/import_ssh_pub_key_to_aws_regions.sh)
```


### 2. Install and setup CDK

Update CDK, if needed, and create an empty Project.
```sh
// update cdk
sudo npm install -g aws-cdk

mkdir simple-ec2 && cd simple-ec2
cdk init --language=typescript

// install packages that cdk will use
npm install @aws-cdk/aws-ec2 @aws-cdk/aws-iam dotenv
```


### 3. Deploy


Now, we are going to execute our CDK project using the `--profile es`.
```sh
cdk list --profile es
SimpleEc2Stack

cdk synth --profile es

cdk deploy --profile es --require-approval never --outputs-file output.json
```

### 4. Accessing the Instance

```sh
ssh ubuntu@$(jq -r .SimpleEc2Stack.NODEIP output.json) -i ~/.ssh/tmpkey
```

And check if user_data bash script was executed successfully.
```sh
tail -fn 9000 /var/log/cloud-init-output.log

```


### 5. Installing Jenkins through an user_data script

We are going to install and configure:

1. Jenkins as CI/CD server
2. Caddy as Reverse Proxy over TLS
3. Checkmarx KICS

Check Docker and Docker-Compose
```sh
docker --version
Docker version 20.10.7, build 20.10.7-0ubuntu1~20.04.1

docker-compose --version
docker-compose version 1.25.0, build unknown
```

#### 5.1. Jenkins configuration as code (JCASC) and Docker

These scripts will install Jenkins, plugins and HTTPS configuration in Docker.
```sh
git clone https://github.com/chilcano/aws-cdk-examples
cd aws-cdk-examples/simple-ec2/lib/scripts/jcasc
source ./build_jenkins_docker_image.sh
```

Once completed the installation, let's get access to Jenkins over HTTPS. 
```sh
JENKINS_LOCAL_URL_HTTPS=https://$(jq -r .SimpleEc2Stack.NODEIP output.json):8443; echo $JENKINS_LOCAL_URL_HTTPS
```


#### 5.2. Jenkins and other tools with Docker Compose

```sh
// https://github.com/fischer1983/docker-compose-jenkins-sonarqube
mkdir sast; cd sast
wget https://raw.githubusercontent.com/chilcano/aws-cdk-examples/main/simple-ec2/lib/scripts/sast-docker-compose.yaml

sudo docker-compose -f sast-docker-compose.yaml up -d

$ sudo docker-compose ps
      Name                    Command               State                                           Ports
--------------------------------------------------------------------------------------------------------------------------------------------------
sast_db_1          docker-entrypoint.sh postgres    Up      5432/tcp
sast_jenkins_1     /sbin/tini -- /usr/local/b ...   Up      0.0.0.0:50000->50000/tcp,:::50000->50000/tcp, 0.0.0.0:8080->8080/tcp,:::8080->8080/tcp
sast_sonarqube_1   ./bin/run.sh                     Up      0.0.0.0:9000->9000/tcp,:::9000->9000/tcp
```

Once completed the installation, let's get access to Jenkins.  
From EC2 instance, let's get Jenkins initial generated password from Docker instance:
```sh
JENKINS_INI_PWD=$(sudo docker exec -it sast_jenkins_1 cat /var/jenkins_home/secrets/initialAdminPassword); echo $JENKINS_INI_PWD
```

From other terminal in your local computer and using the previous `JENKINS_INI_PWD`, open Jenkins Server URL: 
```sh
JENKINS_LOCAL_URL=http://$(jq -r .SimpleEc2Stack.NODEIP output.json):8080; echo $JENKINS_LOCAL_URL
```




### 6. Test your stack

### 7. Destroy the Instance

```sh
cdk destroy --profile es 

```


## Troubleshooting

### 1. Tailing the cloud-init log
```sh
$ tail -fn 9000 /var/log/cloud-init-output.log

```

### 2. Get versions


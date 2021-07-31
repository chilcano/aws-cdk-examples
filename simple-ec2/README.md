# Simple EC2

## Reference

https://dev.to/emmanuelnk/part-3-simple-ec2-instance-awesome-aws-cdk-37ia


## Steps

### 1. Setup AWS

```sh
aws configure --profile profile-ds
AWS Access Key ID [None]: AKI...
AWS Secret Access Key [None]: AvO...
Default region name [None]: eu-west-2
Default output format [None]: json
```


### 2. Install and setup CDK

Install Node, NPM, CDK
```sh
wget -qN https://raw.githubusercontent.com/chilcano/how-tos/master/src/devops_tools_install_v3.sh \
        https://raw.githubusercontent.com/chilcano/how-tos/master/src/devops_tools_remove_v3.sh

chmod +x devops_tools_*.sh  
. devops_tools_install_v3.sh --arch=[amd|arm] [--tf-ver=0.11.15-oci] [--packer-ver=1.5.5]
```

Update CDK and create a empty Project
```sh
// update cdk
sudo npm install -g aws-cdk

mkdir simple-ec2 && cd simple-ec2
cdk init --language=typescript

npm install @aws-cdk/aws-ec2 @aws-cdk/aws-iam dotenv
```


```sh
/ ./bin/simple-ec2.ts


```


```sh
// ./lib/simple-ec2-stack.ts


```


### 3. Deploy


```sh
cdk list --profile ds
SimpleEc2Stack

cdk synth --profile ds

cdk deploy --profile ds
```

### 4. Accessing the Instance

```sh
ssh ec2-user@18.132.195.59 -i ~/.ssh/tmpkey
```

### 5. Add a user_data script


http://35.176.152.234/blog/
Your server is running PHP version 5.4.16 but WordPress 5.8 requires at least 5.6.20.




### 6. Test your stack

### 7. Destroy the Instance

```sh
cdk destroy --profile ds

```
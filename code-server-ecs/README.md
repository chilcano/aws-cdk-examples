# VS Code / Code-Server in AWS ECS

* ECS Cluster, 2 docker instances, using `codercom/code-server` image from Docker Hub.
* Unable to overwrite parameters in Dockerfile (e.g. overwrite the password).
* Persisting on local file system.

```sh
$ git clone https://github.com/chilcano/aws-cdk-samples
$ cd code-server-ecs
$ export AWS_ACCESS_KEY_ID="xyz"; export AWS_SECRET_ACCESS_KEY="prq";export AWS_DEFAULT_REGION="us-east-1"
$ npm install
$ cdk synth
$ cdk deploy
$ cdk destroy
```

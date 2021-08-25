#!/bin/bash

source jenkins_docker_run_set_envvars.sh

echo -n "Starting Docker Jenkins build. Please enter password for Jenkins KeyStore : "
# read -es psswrd

psswrd=`gpg --quiet --gen-random --armor 0 24 |& tail -1`

echo $psswrd | tee $JENKINS_KEYSTORE_PASS_FILE

cd secrets
./create_secrets.sh $psswrd
cd ..

# Build the image
docker build -t jenkins:jcasc .

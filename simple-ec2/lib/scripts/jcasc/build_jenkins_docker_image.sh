#!/bin/bash

source set_jenkins_env_vars.sh

echo -n "Starting special Docker Jenkins build. Please enter password for Jenkins key store : "
# read -es psswrd

psswrd=`gpg --quiet --gen-random --armor 0 24 |& tail -1`

echo $psswrd | tee $JENKINS_KEYSTORE_PASS_FILE

cd secrets
./create_secrets.sh $psswrd
cd ..

docker build -t jenkins:jcasc .
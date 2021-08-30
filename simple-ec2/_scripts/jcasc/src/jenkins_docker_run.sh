#!/bin/bash

source jenkins_docker_set_envvars.sh

psswrd=`gpg --quiet --gen-random --armor 0 24 |& tail -1`

echo "Starting Docker Jenkins container."
echo "Get access to Jenkins UI with '$JENKINS_INITIAL_ADMIN_NAME/$psswrd'."

keytore_pass=`cat ${JENKINS_KEYSTORE_PASS_FILE}`

# Keep this directory for persistency
volume_base=`dirname $(pwd)`/run/jenkins_home

# Avoiding error "cannot touch '/var/jenkins_home/copy_reference_file.log'"
mkdir -p $volume_base
chown -R 1000:1000 $volume_base

# Running the container
docker run --name jenkins --detach --rm  -p 8443:8443 -v $volume_base:/var/jenkins_home --env JENKINS_ADMIN_ID=$JENKINS_INITIAL_ADMIN_NAME --env JENKINS_ADMIN_PASSWORD="$psswrd" jenkins:jcasc --httpPort=-1 --httpsPort=8443 --httpsKeyStore=/usr/share/jenkins/ref/jenkins_keystore.jks --httpsKeyStorePassword="$keytore_pass"

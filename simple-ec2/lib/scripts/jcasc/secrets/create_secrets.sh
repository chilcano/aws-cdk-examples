#!/bin/bash

source ../set_jenkins_env_vars.sh

psswrd=`cat ../${JENKINS_KEYSTORE_PASS_FILE}`

# Create Certificate and Key
openssl req -x509 -days 365 -passout pass:"$psswrd" -newkey rsa:4096 -subj "/CN=Jenkins Self Signed" -keyout jenkins_selfsigned.key -out jenkins_selfsigned.crt

# Convert Pkcs12 which can be imported as KeyStore file
openssl pkcs12 -export -in jenkins_selfsigned.crt -inkey jenkins_selfsigned.key -passin pass:"$psswrd" -out jenkins_selfsigned.p12 -passout pass:"$psswrd"

rm -f $JENKINS_KEYSTORE_FILE

# Java KeyTools must be installed to import to Jenkins KeyStore
keytool -importkeystore -srckeystore jenkins_selfsigned.p12 -srcstoretype PKCS12 -srcstorepass "$psswrd" -deststoretype PKCS12 -destkeystore $JENKINS_KEYSTORE_FILE -deststorepass "$psswrd"

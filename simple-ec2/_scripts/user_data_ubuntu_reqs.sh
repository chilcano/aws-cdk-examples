#!/usr/bin/env bash

echo "--> Installing Docker and Docker Compose"
sudo apt-get update
sudo apt-get -y install docker-compose

echo "--> Installing Fontconfig, Jq and Git "
sudo apt-get -y install fontconfig jq git 

echo "--> Installing Default JRE"
sudo apt-get -y install default-jre

VER_DOCKER=$(docker --version)
VER_DOCKER_COMPOSE=$(docker-compose --version)
VER_JAVA=$(java --version 2>&1 | sed 1q)

echo ${VER_DOCKER}
echo ${VER_DOCKER_COMPOSE}
echo ${VER_JAVA}

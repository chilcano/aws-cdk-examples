#!/usr/bin/env bash

echo "--> Installing Docker and Docker Compose"
sudo apt-get update
sudo apt-get -y install docker-compose

# echo "--> Installing Fancy Git from a subshell and as '${username}' user"
sudo apt-get -y install fontconfig jq git 
# sudo -u ${username} bash -c 'curl -sS https://raw.githubusercontent.com/diogocavilha/fancy-git/master/install.sh | bash'
# sudo -u ${username} bash -c 'source /home/$USER/.bashrc'
# sudo -u ${username} bash -c 'fancygit human'
# # fancygit double-line
# #  fancygit dark-double-line
# # fancygit light-double-line
# sudo -u ${username} bash -c 'source /home/$USER/.bashrc'

echo "--> Installing Default JRE"
sudo apt-get -y install default-jre

VER_DOCKER=$(docker --version)
VER_DOCKER_COMPOSE=$(docker-compose --version)
VER_JAVA=$(java --version 2>&1 | sed 1q)

echo ${VER_DOCKER}
echo ${VER_DOCKER_COMPOSE}
echo ${VER_JAVA}

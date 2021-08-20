#!/usr/bin/env bash

echo "--> Installing Docker Compose"
sudo apt update
sudo apt install -y docker-compose

# echo "--> Installing Fancy Git from a subshell and as '${username}' user"
sudo apt install -y fontconfig jq 
# sudo -u ${username} bash -c 'curl -sS https://raw.githubusercontent.com/diogocavilha/fancy-git/master/install.sh | bash'
# sudo -u ${username} bash -c 'source /home/$USER/.bashrc'
# sudo -u ${username} bash -c 'fancygit human'
# # fancygit double-line
# #  fancygit dark-double-line
# # fancygit light-double-line
# sudo -u ${username} bash -c 'source /home/$USER/.bashrc'

#! /bin/bash

# become root user
sudo su

# update dependencies
yum -y update

# we'll install 'expect' to input keystrokes/y/n/passwords
yum -y install expect 

# Install Apache
yum -y install httpd

# Start Apache
service httpd start

# Install PHP
yum -y install php php-mysql
# php 7 needed for latest wordpress
amazon-linux-extras -y install php7.2 

# Restart Apache
service httpd restart

# Install MySQL
wget http://repo.mysql.com/mysql-community-release-el7-5.noarch.rpm
rpm -ivh mysql-community-release-el7-5.noarch.rpm

yum -y update 
yum -y install mysql-server

# Start MySQL
service mysqld start

# Create a database named blog
mysqladmin -uroot create blog

# Secure database
# non interactive mysql_secure_installation with a little help from expect.

SECURE_MYSQL=$(expect -c "

set timeout 10
spawn mysql_secure_installation

expect \"Enter current password for root (enter for none):\"
send \"\r\"

expect \"Change the root password?\"
send \"y\r\"
expect \"New password:\"
send \"pl55w0rd\r\"
expect \"Re-enter new password:\"
send \"pl55w0rd\r\"
expect \"Remove anonymous users?\"
send \"y\r\"

expect \"Disallow root login remotely?\"
send \"y\r\"

expect \"Remove test database and access to it?\"
send \"y\r\"

expect \"Reload privilege tables now?\"
send \"y\r\"

expect eof
")

echo "$SECURE_MYSQL"

# Change directory to web root
cd /var/www/html

# Download Wordpress
wget http://wordpress.org/latest.tar.gz

# Extract Wordpress
tar -xzvf latest.tar.gz

# Rename wordpress directory to blog
mv wordpress blog

# Change directory to blog
cd /var/www/html/blog/

# Create a WordPress config file 
mv wp-config-sample.php wp-config.php

#set database details with perl find and replace
sed -i "s/database_name_here/blog/g" /var/www/html/blog/wp-config.php
sed -i "s/username_here/root/g" /var/www/html/blog/wp-config.php
sed -i "s/password_here/pl55w0rd/g" /var/www/html/blog/wp-config.php

# create uploads folder and set permissions
mkdir wp-content/uploads
chmod 777 wp-content/uploads

#remove wp file
rm -rf /var/www/html/latest.tar.gz
FROM jenkins/jenkins:lts-jdk11

# Install Python3 tools
USER root
RUN apt-get update && apt-get -yqq install python3 python3-pip build-essential libssl-dev libffi-dev python3-dev python3-venv > "/dev/null" 2>&1
USER jenkins

# VOLUME /var/jenkins_home
ENV JAVA_OPTS -Djenkins.install.runSetupWizard=false
ENV CASC_JENKINS_CONFIG /usr/share/jenkins/ref/casc.yaml

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN /usr/local/bin/install-plugins.sh < /usr/share/jenkins/ref/plugins.txt
COPY casc.yaml /usr/share/jenkins/ref/casc.yaml
#COPY casc.yaml /var/jenkins_home/casc.yaml
COPY secrets/jenkins_keystore.jks /usr/share/jenkins/ref/jenkins_keystore.jks
final DIR_SOURCE = "_src"
final DIR_RESULTS = "_report"

pipeline {
    agent any

    parameters {
        string(name: 'GIT_URL', defaultValue: 'https://github.com/bridgecrewio/terragoat.git', description: 'GIT URL')
        string(name: 'GIT_JENKINS_CREDS', defaultValue: 'Bonobo.Git.Server', description: 'GIT credentials in Jenkins Credentials')
    }

    stages {
        stage('Prepare') {
            steps {
                deleteDir() /* Clean up our workspace */

                echo "Build ${BUILD_NUMBER} - in the Workspace of '${WORKSPACE}'"
                script {
                    sh "ls -lahR ${WORKSPACE} "
                }
            }
        }

        stage('Clone GIT repo') {
            steps {
                echo "Clone code into ${DIR_SOURCE}"
                sh("git clone ${params.GIT_URL} ${DIR_SOURCE}")
                sh "ls -la ${WORKSPACE}/${DIR_SOURCE}"
            }
        }

//        stage('Run Checkmarx Kics - Standalone') {
//            steps{
//                echo "Executing Checkmarx Kics"
//                installKICS()
//                sh "mkdir -p ${DIR_RESULTS}"
//                sh('/usr/bin/kics scan --ci --no-color -p ${WORKSPACE}/${DIR_SOURCE} --output-path ${DIR_RESULTS} --report-formats "json,sarif,html"')
//                archiveArtifacts(artifacts: '${DIR_RESULTS}/*.html,${DIR_RESULTS}/*.sarif,${DIR_RESULTS}/*.json', fingerprint: true)
//            }
//        }


        stage('Run Checkmarx Kics') {
            steps {
                echo "Executing Checkmarx Kics in Docker"
                script {
                    docker.image('checkmarx/kics:latest-alpine').inside("--entrypoint=''") {
                        unstash 'source'
                        sh('/app/bin/kics scan -p \${WORKSPACE}/\${DIR_SOURCE} -q /app/bin/assets/queries --ci --report-formats html -o \${DIR_RESULTS}')
                        archiveArtifacts(artifacts: '${DIR_RESULTS}/results.html', fingerprint: true)
                        publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true, reportDir: '${DIR_RESULTS}/.', reportFiles: '${DIR_RESULTS}/results.html', reportName: 'KICS Results', reportTitles: ''])
                    }
                }
            }
        }

    }
}

def installKICS(){
    LATEST_VERSION="1.2.4"
    //WGET_PATH=sh(script: 'which wget', returnStdout: true).trim()

    if ( fileExists('${WORKSPACE}/_bin/kics') ) {
        echo 'Kics is already installed.'
    } else {
        echo 'Installing Kics.'
        //sh("${WGET_PATH}/wget -q -c https://github.com/Checkmarx/kics/releases/download/v${LATEST_VERSION}/kics_${LATEST_VERSION}_Linux_x64.tar.gz -O /tmp/kics.tar.gz")

        //sh("curl https://github.com/Checkmarx/kics/releases/download/v${LATEST_VERSION}/kics_${LATEST_VERSION}_Linux_x64.tar.gz -o kics.tar.gz -s")
        sh("curl https://github.com/Checkmarx/kics/releases/download/v${LATEST_VERSION}/kics_${LATEST_VERSION}_Linux_x64.tar.gz -O")
        //sh("tar xfzv kics.tar.gz -C _bin/")
        //sh("rm -f kics.tar.gz")
        sh("tar xfzv kics_${LATEST_VERSION}_Linux_x64.tar.gz -C _bin/")
        sh("rm -f kics_${LATEST_VERSION}_Linux_x64.tar.gz")
    }
    sh(script: '_bin/kics version', returnStdout: true).trim()
}
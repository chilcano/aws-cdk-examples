final DIR_SOURCE = "_src"
final DIR_RESULTS = "_report"

pipeline {
    agent any

    parameters {
        string(name: 'GIT_REPO_URL', defaultValue: 'https://github.com/bridgecrewio/terragoat.git', description: 'GIT repository URL')
    }

    stages {
        stage('Prepare') {
            steps {
                deleteDir()
                sh("printenv | sort")
                echo "Build ${BUILD_NUMBER} - in the Workspace of '${WORKSPACE}'"
                echo "Clone code into ${DIR_SOURCE}"
                sh("git clone ${params.GIT_REPO_URL} ${DIR_SOURCE}")
                sh "ls -la ${WORKSPACE}/${DIR_SOURCE}"
            }
        }

        stage('Install Checkmarx Kics') {
            steps {
                echo "Installing Kics."

                // Kics is installed under ./bin/ 
                sh("curl -sfL 'https://raw.githubusercontent.com/Checkmarx/kics/master/install.sh' | bash") 
                sh "ls -la ${WORKSPACE}"
                sh("./bin/kics version")
            }
        }

        stage('Run Checkmarx Kics') {
            steps{
                echo "Executing Kics."

                sh "mkdir -p ${DIR_RESULTS}"
                script {
                    def statusKicsScan = sh(
                        script: "./bin/kics scan --ci --no-color -p ${DIR_SOURCE} --output-path ${DIR_RESULTS} --report-formats 'json,html'", 
                        returnStatus: true, 
                        returnStdout: false)
                    echo "Kics exit status: ${statusKicsScan}"
                    if (statusKicsScan > 0) {
                        echo "Kics has found vulnerabilities in the code."
                    } else {
                        echo "Kics hasn't found vulnerabilities in the code."
                    }
                }
                archiveArtifacts(
                    artifacts: "${DIR_RESULTS}/*.html,${DIR_RESULTS}/*.json", 
                    fingerprint: true
                )
                publishHTML(
                    [allowMissing: true, 
                    alwaysLinkToLastBuild: true, 
                    keepAll: true, 
                    reportDir: "${DIR_RESULTS}", 
                    reportFiles: "*.html", 
                    reportName: "KICS Results", 
                    reportTitles: '']
                )
           }
        }
    }
}

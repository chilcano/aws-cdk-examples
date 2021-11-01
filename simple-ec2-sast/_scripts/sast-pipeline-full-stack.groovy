final DIR_SOURCE = "_src"
final DIR_RESULTS = "_report"
final GOLANGCILINT_VER = "v1.42.0"
def now = new Date()
def totalYaml = 0
def totalDockerfile = 0
def totalPython = 0
def totalGolang = 0
String gitRepoName = ""

pipeline {
    agent any

    parameters {
        string(
            name: "GIT_REPO_URL", 
            defaultValue: "https://github.com/chilcano/aws-cdk-examples.git", 
            description: "Examples: https://github.com/bridgecrewio/terragoat.git"
        )
    }

    stages {
        stage('Prepare') {
            steps {
                deleteDir()
                sh("printenv | sort")
                echo "Build ${BUILD_NUMBER} - in the Workspace of '${WORKSPACE}'"
                echo "Clonning ${params.GIT_REPO_URL} repo into ${DIR_SOURCE}"
                sh("git clone ${params.GIT_REPO_URL} ${DIR_SOURCE}")
                sh "ls -la ${WORKSPACE}/${DIR_SOURCE}"
                sh "mkdir -p ${DIR_RESULTS}"
                script {
                    totalYaml = sh(script: "find ${DIR_SOURCE} -iname '*.yaml' -o -iname '*.yml' | wc -l", returnStdout: true).trim().toInteger()
                    totalDockerfile = sh(script: "find ${DIR_SOURCE} -iname 'Dockerfile' | wc -l", returnStdout: true).trim().toInteger()
                    totalPython = sh(script: "find ${DIR_SOURCE} -iname '*.py' | wc -l", returnStdout: true).trim().toInteger()
                    totalGolang = sh(script: "find ${DIR_SOURCE} -iname '*.go' | wc -l", returnStdout: true).trim().toInteger()
                    echo """
                     -> Total YAML files: ${totalYaml}
                     -> Total Dockerfiles: ${totalDockerfile}
                     -> Total Python files: ${totalPython}
                     -> Total Golang files: ${totalGolang}
                    """
                    gitRepoName = getGitRepoName(params.GIT_REPO_URL)
                }
            }
        }

        stage('Install SAST Tools') {
            steps {
                echo "Installing Kics."
                // Kics is installed under ./bin/ 
                sh("curl -sfL 'https://raw.githubusercontent.com/Checkmarx/kics/master/install.sh' | bash") 

                script {
                    echo "Installing Yaml Linter"
                    // Install under $HOME/.local/bin/
                    sh("pip install --user yamllint")

                    echo "Installing Python Linter"
                    // Install under $HOME/.local/bin/
                    sh("pip install --user pylint")

                    echo "Installing Golang Linter"
                    // Install under ./bin/
                    sh("curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s ${GOLANGCILINT_VER}")

                    echo "Recording versions"
                    sh """
                        go version
                        python3 --version
                    """
                }

                echo "Preparing Environment"
                script {
                    def PYTHON_DEPS_WORKSPACE = sh(script: 'find $WORKSPACE -type d -name "site-packages"', returnStdout: true).trim()
                    def PYTHON_DEPS_HOME = sh(script: 'find $HOME -type d -name "site-packages"', returnStdout: true).trim()
                    SAST_ENV = [
                        "PATH=${WORKSPACE}/bin:${HOME}/.local/bin:$PATH",
                        "PYTHONPATH=${PYTHON_DEPS_WORKSPACE}:${PYTHON_DEPS_HOME}",
                        "PYTHONUSERBASE=${WORKSPACE}",
                        "GOBIN=${WORKSPACE}/bin"
                    ]
                }

                withEnv(SAST_ENV) {
                    sh """
                        kics version
                        yamllint --version
                        pylint --version
                        golangci-lint --version
                    """
                }

                sh("ls -la ${WORKSPACE}")
            }
        }

        stage('Run Kics') {
            when {
                expression { totalYaml > 0 || totalDockerfile > 0 }
            }
            steps {
                script {
                    withEnv(SAST_ENV) {
                        echo "Scanning with Kics."
                        def exitCodeKics = sh(
                            script: "kics scan --ci --no-color -p ${DIR_SOURCE} --output-path ${DIR_RESULTS} --report-formats 'json,html' > ${DIR_RESULTS}/kics-stdout.log", 
                            returnStatus: true, 
                            returnStdout: false)
                        echo "-> Kics exit status: ${exitCodeKics}"
                        if (exitCodeKics > 0) {
                            echo "-> Kics has found vulnerabilities in the code."
                        } else {
                            echo "-> Kics hasn't found vulnerabilities in the code."
                        }
                    }
                }
                echo "-> Publishing Kics reports."
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
                    reportTitles: "Kics (${gitRepoName})"]
                )
           }
        }

        stage('Run Yaml Linter') {
            when {
                expression { totalYaml > 0 }
            }
            steps {
                script {
                    withEnv(SAST_ENV) {
                        echo "Scanning with Yaml Linter."
                        def exitCodeYamlLint = sh(
                            script: "yamllint ${DIR_SOURCE} -f parsable > ${DIR_RESULTS}/yamllint-stdout.log", 
                            returnStatus: true,
                            returnStdout: false)
                        echo "-> Yaml Linter exit code: ${exitCodeYamlLint}"
                        if ( exitCodeYamlLint > 0 ) {
                            echo "-> Publishing Yaml Linter reports."
                            recordIssues(
                                enabledForFailure: false,
                                aggregatingResults: true,
                                blameDisabled: false,
                                tool: yamlLint(
                                    pattern: "**/yamllint-stdout.log", 
                                    reportEncoding: "UTF-8")
                                    //id: "yamllint-${gitRepoName}",
                                    //name: "YAML Lint")
                            )
                        } else {
                            echo "-> Yaml Linter didn't find any issue in the code."
                        }
                    }
                }
            }
        }

        stage('Run Python Linter') {
            when {
                expression { totalPython > 0 }
            }
            steps {
                script {
                    withEnv(SAST_ENV) {
                        echo "Scanning with Python Linter."
                        // -d I,R,C: It disables [I]nformational, [R]efactor and [C]onvention. Only It'll report [W]arning, [E]rror and [F]atal.
                        def exitCodePythonLint = sh(
                            script: "pylint ${DIR_SOURCE} -f parseable -d I,R,C > ${DIR_RESULTS}/pylint-stdout.log", 
                            returnStatus: true,
                            returnStdout: false)
                        echo "-> Python Linter exit code: ${exitCodePythonLint}"
                        if ( exitCodePythonLint > 0 ) {
                            echo "-> Publishing Python Linter reports."
                            recordIssues(
                                enabledForFailure: false,
                                aggregatingResults: true,
                                blameDisabled: false,
                                tool: pyLint(
                                    pattern: "**/pylint-stdout.log", 
                                    reportEncoding: "UTF-8")
                                    //id: "pylint-${gitRepoName}",
                                    //name: "Python Lint")
                            )
                        } else {
                            echo "-> Python Linter didn't find any issue in the code."
                        }
                    }
                }
            }
        }

        stage('Run Golang Linter') {
            when {
                expression { totalGolang > 0 }
            }
            steps {
                script {
                    withEnv(SAST_ENV) {
                        echo "Scanning with GolangCI Linter."
                        def exitCodeGolangLint = -1
                        dir(DIR_SOURCE) {
                            exitCodeGolangLint = sh(
                                script: "golangci-lint run > ${WORKSPACE}/${DIR_RESULTS}/golangci-lint-stdout.log", 
                                returnStatus: true,
                                returnStdout: false)
                        }
                        echo "-> GolangCI Linter exit code: ${exitCodeGolangLint}"
                        if ( exitCodeGolangLint > 0 ) {
                            echo "-> Publishing GolangCI Linter reports."
                            recordIssues(
                                enabledForFailure: false,
                                aggregatingResults: true,
                                blameDisabled: false,
                                tool: goLint(
                                    pattern: "**/golangci-lint-stdout.log", 
                                    reportEncoding: "UTF-8")
                                    //id: "golint-${gitRepoName}",
                                    //name: "Golang Lint")
                            )
                        } else {
                            echo "-> GolangCI Linter didn't find any issue in the code."
                        }
                    }
                }
            }
        }
    }
}

static String getGitRepoName (String repoUrl) {
    def repoUrlParts = repoUrl.split("/")
    String repoNameWithExt = repoUrlParts[repoUrlParts.length - 1]
    return repoNameWithExt.substring(0, repoNameWithExt.length() - 4)
}
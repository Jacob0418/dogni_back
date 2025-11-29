pipeline {
    agent any

    tools {
        nodejs "NodeJS_18"
    }

    environment {
        REGISTRY = "ghcr.io"
        REPO_OWNER = "jacob0418"
        REPO_NAME = "dogni_back"
        IMAGE = "ghcr.io/${REPO_OWNER}/${REPO_NAME}:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint (conditional)') {
            steps {
                sh '''
                    if node -e "const p=require('./package.json'); process.exit(!(p.scripts && p.scripts.lint));"; then
                        echo "Lint found, running..."
                        npm run lint
                    else
                        echo "No lint script, skipping."
                    fi
                '''
            }
        }

        stage('Tests (conditional)') {
            steps {
                sh '''
                    if node -e "const p=require('./package.json'); process.exit(!(p.scripts && p.scripts.test));"; then
                        echo "Tests found, running..."
                        npm test --silent
                    else
                        echo "No test script, skipping."
                    fi
                '''
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Login to GHCR') {
            steps {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_PAT')]) {
                    sh """
                        echo "${GITHUB_PAT}" | docker login ${REGISTRY} -u ${REPO_OWNER} --password-stdin
                    """
                }
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                sh """
                    docker build -t ${IMAGE} .
                    docker push ${IMAGE}
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'KUBE_CONFIG', variable: 'KUBECONFIG_FILE')]) {
                    sh """
                        mkdir -p \$HOME/.kube
                        cp \$KUBECONFIG_FILE \$HOME/.kube/config
                        chmod 600 \$HOME/.kube/config
                    """

                    sh """
                        kubectl set image deployment/dogni-back dogni-back=${IMAGE} --namespace default || true
                        kubectl apply -f k8s/ --namespace default
                    """

                    sh """
                        kubectl rollout status deployment/dogni-back --namespace default --timeout=2m
                    """
                }
            }
        }
    }
}

pipeline {
    agent any
      
    tools {
        nodejs "nodejs" // Ensure Node.js is configured in Jenkins
    }

    environment {
        FRONTEND_IMAGE = "skkumar97260/sk-frontend"
        BACKEND_IMAGE = "skkumar97260/sk-backend"
        DOCKER_TAG = "latest"
        AWS_CLUSTER_NAME = "my-eks-cluster-2"
        AWS_REGION = "us-east-1"
        KUBERNETES_NAMESPACE = "mern-namespace"
    }

    stages {
        stage('GitHub Pull') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        credentialsId: 'GITHUB_CREDENTIALS',
                        url: 'https://github.com/skkumar97260/MetaData.web.git'
                    ]]
                )
            }
        }

        stage('Build Frontend Image') {
            steps {
                script {
                    echo "Building Frontend Docker Image..."
                    sh "docker build -t ${FRONTEND_IMAGE}:${DOCKER_TAG} -f website/Dockerfile website"
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    echo "Building Backend Docker Image..."
                    sh "docker build -t ${BACKEND_IMAGE}:${DOCKER_TAG} -f backend/Dockerfile backend"
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    script {
                        echo "Pushing Docker Images to DockerHub..."
                        sh '''
                            echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                            docker push ${FRONTEND_IMAGE}:${DOCKER_TAG}
                            docker push ${BACKEND_IMAGE}:${DOCKER_TAG}
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([ 
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    script {
                        echo "Deploying to Kubernetes..."
                        sh '''
                            export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                            export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

                            # Update the kubeconfig for EKS
                            aws eks update-kubeconfig --region ${AWS_REGION} --name ${AWS_CLUSTER_NAME}

                            # Create Kubernetes namespace if it doesn't exist
                            kubectl create namespace ${KUBERNETES_NAMESPACE} || true

                            # Apply the Kubernetes manifests with the correct namespace
                            kubectl apply -n ${KUBERNETES_NAMESPACE} -f k8s/frontend-deployment.yaml
                            kubectl apply -n ${KUBERNETES_NAMESPACE} -f k8s/backend-deployment.yaml
                            kubectl apply -n ${KUBERNETES_NAMESPACE} -f k8s/frontend-service.yaml
                            kubectl apply -n ${KUBERNETES_NAMESPACE} -f k8s/backend-service.yaml
                            kubectl apply -n ${KUBERNETES_NAMESPACE} -f k8s/ingress.yaml
                            kubectl apply -n ${KUBERNETES_NAMESPACE} -f k8s/hpa.yaml

                            # Restart deployments to ensure the new images are being used
                            kubectl rollout restart deployment/frontend -n ${KUBERNETES_NAMESPACE}
                            kubectl rollout restart deployment/backend -n ${KUBERNETES_NAMESPACE}
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution finished.'
        }
        success {
            echo 'Pipeline executed successfully.'
        }
        failure {
            echo 'Pipeline execution failed.'
        }
    }
}

pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/your-repo/mern-project.git'
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    script {
                        sh 'docker build -t frontend-app .'
                    }
                }
            }
        }
        stage('Build Backend') {
            steps {
                dir('backend') {
                    script {
                        sh 'docker build -t backend-app .'
                    }
                }
            }
        }
        stage('Push to Docker Hub') {
            environment {
                DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
            }
            steps {
                script {
                    sh 'docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW'
                    sh 'docker tag frontend-app your-dockerhub-username/frontend-app'
                    sh 'docker push your-dockerhub-username/frontend-app'
                    sh 'docker tag backend-app your-dockerhub-username/backend-app'
                    sh 'docker push your-dockerhub-username/backend-app'
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    kubernetesDeploy(configs: 'k8s/*.yaml')
                }
            }
        }
    }
}

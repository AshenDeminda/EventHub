pipeline {
    agent any
    
    environment {
        // Docker Hub username
        DOCKERHUB_USER = 'ashendeminda'
        // Docker Hub credentials ID (must match the ID you create in Jenkins)
        // Go to: Manage Jenkins → Credentials → Add credentials with ID: dockerhub-credentials
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Test Frontend') {
            steps {
                echo '🧪 Running frontend tests...'
                dir('frontend') {
                    sh '''
                        npm install
                        npm test -- --watchAll=false --ci
                    '''
                }
            }
        }
        
        stage('Build Backend Image') {
            steps {
                echo '🔨 Building backend Docker image...'
                sh '''
                    docker build -t ${DOCKERHUB_USER}/eventhub-backend:latest ./backend
                    docker tag ${DOCKERHUB_USER}/eventhub-backend:latest ${DOCKERHUB_USER}/eventhub-backend:${BUILD_NUMBER}
                '''
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                echo '🔨 Building frontend Docker image...'
                sh '''
                    docker build -t ${DOCKERHUB_USER}/eventhub-frontend:latest ./frontend
                    docker tag ${DOCKERHUB_USER}/eventhub-frontend:latest ${DOCKERHUB_USER}/eventhub-frontend:${BUILD_NUMBER}
                '''
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo '📤 Pushing images to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push ${DOCKERHUB_USER}/eventhub-backend:latest
                        docker push ${DOCKERHUB_USER}/eventhub-backend:${BUILD_NUMBER}
                        docker push ${DOCKERHUB_USER}/eventhub-frontend:latest
                        docker push ${DOCKERHUB_USER}/eventhub-frontend:${BUILD_NUMBER}
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
        always {
            echo '✅ Pipeline finished!'
        }
    }
}


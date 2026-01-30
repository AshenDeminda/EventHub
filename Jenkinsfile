pipeline {
    agent any
    
    environment {
        DOCKERHUB_USER = 'ashendeminda'
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        // Jenkins credential IDs expected:
        // - 'aws-creds' : AWS access key id / secret access key (username/password)
        // - 'jenkins-ssh' : SSH Username with private key
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
                echo '🧪 Running frontend tests (optional)...'
                dir('frontend') {
                    sh '''
                        npm install
                        npm test -- --watchAll=false --ci || true
                    '''
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '🔨 Building backend and frontend images and saving tars...'
                sh '''
                    set -e
                    mkdir -p build
                    # Build backend
                    docker build -t ${DOCKERHUB_USER}/eventhub-backend:latest ./backend
                    docker tag ${DOCKERHUB_USER}/eventhub-backend:latest ${DOCKERHUB_USER}/eventhub-backend:${BUILD_NUMBER}
                    docker save ${DOCKERHUB_USER}/eventhub-backend:${BUILD_NUMBER} -o build/backend.tar || true

                    # Build frontend
                    docker build -t ${DOCKERHUB_USER}/eventhub-frontend:latest ./frontend
                    docker tag ${DOCKERHUB_USER}/eventhub-frontend:latest ${DOCKERHUB_USER}/eventhub-frontend:${BUILD_NUMBER}
                    docker save ${DOCKERHUB_USER}/eventhub-frontend:${BUILD_NUMBER} -o build/frontend.tar || true
                '''
            }
        }

        stage('Terraform: Init & Apply') {
            steps {
                echo '🌱 Running Terraform init and apply...'
                withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                        export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                        terraform init -input=false
                        terraform apply -auto-approve
                    '''
                }
            }
        }

        stage('Get server IP from Terraform') {
            steps {
                echo '🔍 Capturing server IP from Terraform output...'
                script {
                    server_ip = sh(script: "terraform output -raw server_ip", returnStdout: true).trim()
                    if (!server_ip) {
                        error 'Could not read server_ip from terraform output'
                    }
                    env.SERVER_IP = server_ip
                    echo "Server IP: ${server_ip}"
                }
            }
        }

        stage('Ansible Deploy to EC2') {
            steps {
                echo '🚀 Deploying to EC2 with Ansible (uses ssh credentials stored in Jenkins)...'
                // Expected Jenkins credentials: 'jenkins-ssh' (SSH Username with private key)
                withCredentials([sshUserPrivateKey(credentialsId: 'jenkins-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh '''
                        # Run ansible-playbook against the single host returned from Terraform
                        ansible-playbook ansible/jenkins-deploy.yml -i "${SERVER_IP}," --private-key ${SSH_KEY} -u ${SSH_USER} -e dest_dir=/home/${SSH_USER}/app
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


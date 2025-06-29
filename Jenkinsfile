pipeline {
    agent { label 'docker-ec2-agent' }
    
    environment {
        DOCKER_IMAGE = 'ecommerce-api'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        MONGODB_URL = credentials('MONGODB_URL')
        DOCKER_HUB_USERNAME = 'sudhanshubsr'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh '''
                    # Build the Docker image
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                '''
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing Docker image to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'docker-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        # Login to Docker Hub
                        echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
                        
                        # Tag images with Docker Hub username
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker tag ${DOCKER_IMAGE}:latest ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:latest
                        
                        # Push images to Docker Hub
                        docker push ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:latest

                        echo "Successfully pushed ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG} to Docker Hub"
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to production environment...'
                sh '''
                    # Stop existing production container if running
                    docker stop ecommerce-api-prod || true
                    docker rm ecommerce-api-prod || true
                    
                    # Run new production container
                    docker run -d \
                        --name ecommerce-api-prod \
                        -p 3000:3001 \
                        -e NODE_ENV=production \
                        -e MONGODB_URL=${MONGODB_URL} \
                        --restart unless-stopped \
                        ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}

                    # Wait for container to start
                    sleep 20
                    
                    # Verify the container started successfully
                    if ! docker ps | grep ecommerce-api-prod; then
                        echo "Failed to start production container"
                        exit 1
                    fi
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                sh '''
                    # Basic health check - verify container is responding
                    timeout 30 bash -c 'until docker exec ecommerce-api-prod curl -f http://localhost:3001/health > /dev/null 2>&1; do sleep 2; done' || echo "Health check timeout - container may not be fully ready"
                '''
            }
        }
        
        // stage('Cleanup') {
        //     steps {
        //         echo 'Cleaning up old Docker images...'
        //         sh '''
        //             # Remove old local Docker images (keep last 5)
        //             docker images ${DOCKER_IMAGE} --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | tail -n +6 | awk '{print $1}' | xargs -r docker rmi || true
                    
        //             # Remove old Docker Hub images (keep last 5)
        //             docker images ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE} --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | tail -n +6 | awk '{print $1}' | xargs -r docker rmi || true
                    
        //             # Remove dangling images
        //             docker image prune -f
                    
        //             # Logout from Docker Hub
        //             docker logout
        //         '''
        //     }
        // }
    }
    
    post {
        always {
            echo 'Pipeline completed. Cleaning up workspace...'
            node('docker-ec2-agent') {
                sh 'docker logout || true'
                cleanWs()
            }
        }
        success {
            echo 'Pipeline succeeded!'
            echo "Build ${BUILD_NUMBER} completed successfully"
            echo "Docker image: ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}"
            echo "Docker Hub URL: https://hub.docker.com/r/${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}"
        }
        failure {
            echo 'Pipeline failed!'
            echo "Build ${BUILD_NUMBER} failed"
            echo "Check the logs above for specific error details"
        }
        unstable {
            echo 'Pipeline is unstable!'
        }
    }
}

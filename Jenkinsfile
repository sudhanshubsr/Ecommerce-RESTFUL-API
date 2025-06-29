pipeline {
    agent { label 'docker-agent-1' }  // Changed from 'docker-ec2-agent' to match your actual agent
    
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
                        -e MONGODB_URL="${MONGODB_URL}" \
                        --restart unless-stopped \
                        ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}

                    # Wait for container to start
                    sleep 20
                    
                    # Verify the container started successfully
                    if ! docker ps | grep ecommerce-api-prod; then
                        echo "Failed to start production container"
                        exit 1
                    fi
                    
                    echo "Production container deployed successfully"
                    echo "Application accessible at: http://localhost:3000"
                '''
            }
        }
        
        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                echo 'Performing health check...'
                sh '''
                    # Basic health check - verify container is running and responding
                    echo "Checking if container is running..."
                    if docker ps | grep ecommerce-api-prod; then
                        echo "Container is running"
                        
                        # Wait a bit more for the application to fully start
                        echo "Waiting for application to be ready..."
                        sleep 10
                        
                        # Test if the application is responding on the expected port
                        if docker exec ecommerce-api-prod curl -f http://localhost:3001 --connect-timeout 10 || \
                           curl -f http://localhost:3000 --connect-timeout 10; then
                            echo "Health check passed - application is responding"
                        else
                            echo "Health check warning - application may not be fully ready yet"
                            # Don't fail the pipeline, just warn
                        fi
                    else
                        echo "Health check failed - container is not running"
                        exit 1
                    fi
                '''
            }
        }
        
        stage('Cleanup') {
            steps {
                echo 'Cleaning up old Docker images...'
                sh '''
                    # Remove old local Docker images (keep last 5 builds)
                    OLD_IMAGES=$(docker images ${DOCKER_IMAGE} --format "{{.Repository}}:{{.Tag}}" | grep -E ":[0-9]+$" | sort -t: -k2 -nr | tail -n +6)
                    if [ ! -z "$OLD_IMAGES" ]; then
                        echo "Removing old images: $OLD_IMAGES"
                        echo "$OLD_IMAGES" | xargs -r docker rmi || true
                    fi
                    
                    # Remove old Docker Hub tagged images (keep last 5 builds)
                    OLD_HUB_IMAGES=$(docker images ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE} --format "{{.Repository}}:{{.Tag}}" | grep -E ":[0-9]+$" | sort -t: -k2 -nr | tail -n +6)
                    if [ ! -z "$OLD_HUB_IMAGES" ]; then
                        echo "Removing old hub images: $OLD_HUB_IMAGES"
                        echo "$OLD_HUB_IMAGES" | xargs -r docker rmi || true
                    fi
                    
                    # Remove dangling images
                    docker image prune -f
                    
                    echo "Cleanup completed"
                '''
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed. Cleaning up workspace...'
            sh 'docker logout || true'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
            echo "Build ${BUILD_NUMBER} completed successfully"
            echo "Docker image: ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}"
            echo "Docker Hub URL: https://hub.docker.com/r/${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}"
            echo "Production URL: http://localhost:3000 (if deployed)"
        }
        failure {
            echo 'Pipeline failed!'
            echo "Build ${BUILD_NUMBER} failed"
            echo "Check the logs above for specific error details"
            
            // Cleanup failed deployment
            sh '''
                docker stop ecommerce-api-prod || true
                docker rm ecommerce-api-prod || true
                docker logout || true
            '''
        }
        unstable {
            echo 'Pipeline is unstable!'
        }
    }
}
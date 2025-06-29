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
                    docker build -t ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker tag ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:latest

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
                        
                
                        
                        # Push images to Docker Hub
                        docker push ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:latest

                        echo "Successfully pushed ${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG} to Docker Hub"
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            steps {
                echo 'Deploying to production environment...'
                sh '''
                    # Stop existing production container if running
                    docker stop ecommerce-api-prod || true
                    docker rm ecommerce-api-prod || true
                    
                    # Run new production container (bind to all interfaces)
                    docker run -d \
                        --name ecommerce-api-prod \
                        -p 0.0.0.0:3000:3001 \
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
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                // 1. Obtain EC2 private IP; fallback to localhost if metadata fails
                def ip = sh(
                    script: "curl -s http://169.254.169.254/latest/meta-data/local-ipv4 || echo '127.0.0.1'",
                    returnStdout: true
                ).trim()
                echo "Using health-check IP → ${ip}:3000"

                // 2. Wait until the /api/docs endpoint responds with HTTP 2xx
                timeout(time: 1, unit: 'MINUTES') {
                    waitUntil {
                    def code = sh(
                        script: "curl -f --connect-timeout 5 -s http://${ip}:3000/api/docs > /dev/null",
                        returnStatus: true
                    )
                    if (code == 0) {
                        echo "✅ Health check passed"
                        return true
                    } else {
                        echo "⏳ Endpoint not ready yet; retrying in 5s..."
                        sleep 5
                        return false
                    }
                    }
                }
                }
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
            echo "Production URL: http://13.201.2.181:3000/api/docs (if deployed)"
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
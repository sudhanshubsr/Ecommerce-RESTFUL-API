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
            // We can reliably hit the app at localhost:3000 inside the EC2/Jenkins agent
            def ip = '127.0.0.1'
            echo "Using health-check IP → ${ip}:3000"

            // Wait up to 1 minute for /api/docs to return HTTP 200
            timeout(time: 1, unit: 'MINUTES') {
                waitUntil {
                // -f will cause curl to return non‑zero on HTTP errors
                def status = sh(
                    script: "curl -f --connect-timeout 5 -s http://${ip}:3000/api/docs > /dev/null",
                    returnStatus: true
                )
                if (status == 0) {
                    echo "✅ Health check passed"
                    return true
                } else {
                    echo "⏳ /api/docs not ready yet; retrying in 5s..."
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
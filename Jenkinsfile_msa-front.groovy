pipeline {
    agent any

    // Jenkins Job 실행 시 수동으로 전체 재배포를 강제할 수 있는 파라미터
    parameters {
        booleanParam(defaultValue: true, description: 'Force full deployment of msa-front (ignores changes).', name: 'FORCE_FULL_DEPLOY')
    }

    environment {
        // NAS 환경에 맞는 Docker Registry와 Kubeconfig 경로 설정
        DOCKER_REGISTRY = 'localhost:5000' 
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        KUBECONFIG_PATH = '/var/lib/jenkins/.kube/config' // NAS 환경의 kubeconfig 경로
        NAMESPACE = 'bit-2503' // Kubernetes deployment.yaml의 네임스페이스와 일치

        // ==================== 프론트엔드 SECRET 환경 변수 (Jenkins Credentials에서 로드) ====================
        // 이 변수들은 Dockerfile의 ARG로 전달됩니다. Jenkins Credentials ID와 일치해야 합니다.
        VITE_KAKAO_JAVASCRIPT_KEY = credentials('VITE_KAKAO_JAVASCRIPT_KEY')
        VITE_NAVER_CLIENT_ID      = credentials('VITE_NAVER_CLIENT_ID')
        VITE_GOOGLE_CLIENT_ID     = credentials('VITE_GOOGLE_CLIENT_ID')
        
        // 배포 필요 여부를 저장할 플래그
        SHOULD_DEPLOY_MSA_FRONT = 'false'
    }

    // GitHub 웹훅 트리거 (main 브랜치에 푸시 시)
    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                // msa-front 레포지토리, main 브랜치, github-msa-front-pat 크리덴셜 사용
                git branch: 'deployNAS', credentialsId: 'github-token-333', url: 'https://github.com/jigubangbang/msa-front.git'
            }
        }

        stage('Cleanup Failed Resources') {
            steps {
                script {
                    echo "=== 실패한 리소스 정리 ==="
                    sh """
                        export KUBECONFIG=${env.KUBECONFIG_PATH}
                        
                        echo "Cleaning up failed ReplicaSets..."
                        kubectl get rs -n ${env.NAMESPACE} --no-headers | awk '\$2 == 0 && \$3 == 0 && \$4 == 0 {print \$1}' | xargs -r kubectl delete rs -n ${env.NAMESPACE}
                        
                        echo "Cleaning up failed Pods..."
                        kubectl get pods -n ${env.NAMESPACE} --field-selector=status.phase=Failed -o name | xargs -r kubectl delete -n ${env.NAMESPACE}
                        kubectl get pods -n ${env.NAMESPACE} --field-selector=status.phase=Error -o name | xargs -r kubectl delete -n ${env.NAMESPACE}
                        
                        echo "Cleaning up old Docker images for msa-front..."
                        docker rmi \$(docker images ${env.DOCKER_REGISTRY}/msa-front --format "{{.Repository}}:{{.Tag}}" | grep -v ":${env.IMAGE_TAG}\\|:latest" | head -5) 2>/dev/null || true
                        
                        echo "Current resource usage:"
                        kubectl get resourcequota -n ${env.NAMESPACE} || echo "No resource quota found"
                        kubectl get pods -n ${env.NAMESPACE}
                    """
                }
            }
        }

        stage('Determine Changes') {
            steps {
                script {
                    echo "Build Number: ${env.BUILD_NUMBER}"
                    echo "Git Commit: ${env.GIT_COMMIT}"
                    echo "Generated IMAGE_TAG: ${env.IMAGE_TAG}"

                    // FORCE_FULL_DEPLOY 파라미터 또는 첫 빌드 시 항상 배포
                    if (params.FORCE_FULL_DEPLOY || env.BUILD_NUMBER == '1') {
                        env.SHOULD_DEPLOY_MSA_FRONT = 'true'
                        echo "Force full deployment or first build - deploying msa-front."
                    } else {
                        // 변경 사항 감지 (단일 레포이므로 단순히 변경이 있으면 배포)
                        def rawChanges = sh(returnStdout: true, script: 'git diff --name-only HEAD HEAD^1 || true').trim()
                        if (!rawChanges.isEmpty()) {
                            env.SHOULD_DEPLOY_MSA_FRONT = 'true'
                            echo "Detected changes in msa-front repository. Deploying."
                        } else {
                            env.SHOULD_DEPLOY_MSA_FRONT = 'false'
                            echo "No changes detected in msa-front. Skipping deployment."
                            currentBuild.result = 'SUCCESS'
                            return // 변경 사항이 없으면 파이프라인 종료
                        }
                    }
                }
            }
        }

        stage('Deploy MSA-Front') {
            when {
                expression { return env.SHOULD_DEPLOY_MSA_FRONT == 'true' }
            }
            steps {
                script {
                    def serviceName = 'msa-front'
                    def imageUrl = "${env.DOCKER_REGISTRY}/${serviceName}:${env.IMAGE_TAG}"

                    // MSA-Front는 API Gateway가 준비될 때까지 기다림 (Config/Eureka는 API Gateway Init Container에서 대기)
                    echo "Waiting for API Gateway to be ready before deploying MSA-Front..."
                    retry(5) { // API Gateway가 불안정할 경우를 대비하여 재시도 횟수 증가
                        sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl wait --for=condition=available deployment/api-gateway-deployment -n ${env.NAMESPACE} --timeout=600s || exit 1"
                    }
                    echo "API Gateway is ready. Proceeding with MSA-Front."

                    echo "--- Building Docker image: ${imageUrl} ---"
                    // Dockerfile의 ARG로 환경 변수 전달
                    sh """
                        docker build -t ${imageUrl} \\
                        --build-arg VITE_KAKAO_JAVASCRIPT_KEY="${env.VITE_KAKAO_JAVASCRIPT_KEY}" \\
                        --build-arg VITE_NAVER_CLIENT_ID="${env.VITE_NAVER_CLIENT_ID}" \\
                        --build-arg VITE_GOOGLE_CLIENT_ID="${env.VITE_GOOGLE_CLIENT_ID}" \\
                        ${params.FORCE_FULL_DEPLOY ? '--no-cache' : ''} .
                        docker push ${imageUrl}
                    """
                    echo "--- Docker image pushed: ${imageUrl} ---"

                    // --- 기존 배포 강제 삭제 (새로운 이미지의 클린한 롤아웃을 보장하기 위해) ---
                    echo "--- Existing deployment cleanup (to ensure clean rollout) ---"
                    sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl delete deployment ${serviceName}-deployment -n ${env.NAMESPACE} --ignore-not-found || true"
                    sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl wait --for=delete deployment/${serviceName}-deployment -n ${env.NAMESPACE} --timeout=300s --for=delete || true"
                    echo "--- Existing deployment deleted (if it existed) ---"

                    // Kubernetes 배포 (NAS 환경)
                    echo "--- Applying Kubernetes deployments for ${serviceName} ---"
                    sh """
                        export KUBECONFIG=${env.KUBECONFIG_PATH}
                        
                        sed -i "s|__ECR_IMAGE_FULL_PATH__|${imageUrl}|g" k8s/deployment.yaml
                        
                        kubectl apply -f k8s/deployment.yaml -n ${env.NAMESPACE}
                        kubectl apply -f k8s/service.yaml -n ${env.NAMESPACE}
                        

                        sed -i '/alb.ingress.kubernetes.io/d' k8s/ingress.yaml
                        kubectl apply -f k8s/ingress.yaml -n ${env.NAMESPACE}
                    """
                    echo "--- Kubernetes deployments applied for ${serviceName} ---"

                    // --- Kubernetes Deployment Debugging (msa-front 파드 관련) ---
                    echo "--- Kubernetes Deployment Debugging (msa-front Pods) ---"
                    echo "Pods in namespace ${env.NAMESPACE} after apply:"
                    sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl get pods -n ${env.NAMESPACE} -l app=${serviceName} || true"
                    echo "Deployment events:"
                    sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl describe deployment/${serviceName}-deployment -n ${env.NAMESPACE} || true"

                    echo "Main container logs:"
                    sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl get pods -n ${env.NAMESPACE} -l app=${serviceName} -o custom-columns=NAME:.metadata.name --no-headers | xargs -r -I {} sh -c 'echo \"--- {} logs: ---\"; KUBECONFIG=${env.KUBECONFIG_PATH} kubectl logs {} -n ${env.NAMESPACE} -c ${serviceName}-container || true; echo \"\";' || true"

                    echo "--- End Kubernetes Deployment Debugging (msa-front Pods) ---"

                    // 롤아웃 상태 대기
                    sh """
                        KUBECONFIG=${env.KUBECONFIG_PATH} kubectl rollout status deployment/${serviceName}-deployment -n ${env.NAMESPACE} --timeout=600s || exit 1
                    """
                    echo "${serviceName} 배포 완료."
                }
            }
        }
        
        stage('Verify Deployment') { // 최종 배포 확인 함수
            steps {
                script {
                    echo "=== 배포 확인 ==="
                    sh """
                        export KUBECONFIG=${env.KUBECONFIG_PATH}
                        echo "Pods in namespace ${env.NAMESPACE}:"
                        kubectl get pods -n ${env.NAMESPACE} -l app=${serviceName}
                        echo "Services in namespace ${env.NAMESPACE}:"
                        kubectl get services -n ${env.NAMESPACE} -l app=${serviceName}
                        echo "Ingress in namespace ${env.NAMESPACE}:"
                        kubectl get ingress -n ${env.NAMESPACE} -l app=${serviceName}
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs() // 워크스페이스 정리
        }
        failure {
            echo "❌ CI/CD Pipeline failed for msa-front."
        }
        success {
            echo "✅ CI/CD Pipeline finished successfully for msa-front."
        }
    }
}
pipeline {
    agent any // Jenkins Agent가 실행될 환경. 특정 label을 지정할 수도 있습니다 (예: agent { label 'kubernetes' })

    // Jenkins Job 실행 시 수동으로 전체 재배포를 강제할 수 있는 파라미터
    parameters {
        booleanParam(defaultValue: true, description: 'Force full deployment of msa-front (ignores changes).', name: 'FORCE_FULL_DEPLOY')
    }

    // 전역 환경 변수 정의
    environment {
        // NAS Docker Registry 주소 (강사님 예시와 동일하게 localhost:5000 사용)
        DOCKER_REGISTRY = 'localhost:5000'
        // Docker 이미지 태그 (Jenkins 빌드 번호를 사용)
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        // Kubernetes 설정 파일 경로 (Jenkins Agent에 kubeconfig가 위치한 경로)
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
        // Kubernetes 네임스페이스
        NAMESPACE = 'bit-2503' // msa-front K8s 파일에 명시된 네임스페이스

        // ==================== 프론트엔드 SECRET 환경 변수 (Jenkins Credentials에서 로드) ====================
        // 이 Credentials ID들은 Jenkins에 Secret Text 타입으로 미리 등록되어 있어야 합니다.
        VITE_KAKAO_JAVASCRIPT_KEY = credentials('VITE_KAKAO_JAVASCRIPT_KEY')
        VITE_NAVER_CLIENT_ID      = credentials('VITE_NAVER_CLIENT_ID')
        VITE_GOOGLE_CLIENT_ID     = credentials('VITE_GOOGLE_CLIENT_ID')
    }

    // GitHub 웹훅 트리거 (main 브랜치에 푸시 시)
    triggers {
        githubPush()
    }

    stages {
        stage('Checkout Source') {
            steps {
                script {
                    echo "=== 소스 코드 체크아웃 (msa-front) ==="
                    // 실제 사용하는 Git 레포지토리 URL과 브랜치, Credentials ID를 입력하세요.
                    // 'github-msa-front-pat'는 Jenkins에 등록된 GitHub Personal Access Token Credentials ID입니다.
                    git branch: 'deployNAS2', credentialsId: 'github-token-333', url: 'https://github.com/jigubangbang/msa-front.git'
                    echo "Source code checked out."
                }
            }
        }

        stage('Deploy MSA-Front') {
            steps {
                script {
                    // API Gateway가 준비될 때까지 대기 (msa-front가 API Gateway를 통해 백엔드와 통신할 것이므로)
                    echo "Waiting for API Gateway to be ready before deploying MSA-Front..."
                    retry(3) { // 3회 재시도
                        sh "KUBECONFIG=${env.KUBECONFIG} kubectl wait --for=condition=available deployment/api-gateway-deployment -n ${env.NAMESPACE} --timeout=600s || exit 1"
                    }
                    echo "API Gateway is ready. Proceeding with MSA-Front deployment."

                    // Docker 이미지 이름 정의 (NAS Docker Registry 규칙에 따름)
                    // 강사님 예시와 동일하게 NAMESPACE를 이미지 경로에 포함
                    def dockerImageName = "${env.DOCKER_REGISTRY}/${env.NAMESPACE}/msa-front"

                    echo "--- Building Docker Image for MSA-Front ---"
                    // Dockerfile의 ARG 변수에 Jenkins Credentials에서 로드한 값을 전달
                    // FORCE_FULL_DEPLOY 파라미터에 따라 --no-cache 옵션 추가
                    sh "docker build -t ${dockerImageName}:${env.IMAGE_TAG} " +
                       "--build-arg VITE_KAKAO_JAVASCRIPT_KEY=${env.VITE_KAKAO_JAVASCRIPT_KEY} " +
                       "--build-arg VITE_NAVER_CLIENT_ID=${env.VITE_NAVER_CLIENT_ID} " +
                       "--build-arg VITE_GOOGLE_CLIENT_ID=${env.VITE_GOOGLE_CLIENT_ID} " +
                       "${params.FORCE_FULL_DEPLOY ? '--no-cache' : ''} ."

                    // latest 태그도 함께 생성
                    sh "docker tag ${dockerImageName}:${env.IMAGE_TAG} ${dockerImageName}:latest"

                    echo "--- Pushing Docker Image to NAS Registry ---"
                    // NAS Docker Registry에 로그인 (Jenkins Agent에 미리 로그인되어 있거나 insecure registry로 설정되어 있어야 함)
                    // AWS Jenkinsfile에서는 withCredentials(aws)를 사용했지만, NAS에서는 직접 docker push
                    sh "docker push ${dockerImageName}:${env.IMAGE_TAG}"
                    sh "docker push ${dockerImageName}:latest"
                    echo "Docker image pushed: ${dockerImageName}:${env.IMAGE_TAG}"

                    // --- 기존 배포 강제 삭제 (새로운 이미지의 클린한 롤아웃을 보장하기 위해) ---
                    echo "--- Cleaning up existing deployment for clean rollout ---"
                    sh "KUBECONFIG=${env.KUBECONFIG} kubectl delete deployment msa-front-deployment -n ${env.NAMESPACE} --ignore-not-found || true"
                    // 삭제 대기 (선택 사항이지만 클린 롤아웃에 도움)
                    sh "KUBECONFIG=${env.KUBECONFIG} kubectl wait --for=delete deployment/msa-front-deployment -n ${env.NAMESPACE} --timeout=300s --for=delete || true"
                    echo "--- Existing deployment cleaned up (if existed) ---"

                    // --- Kubernetes Manifest 적용 ---
                    echo "--- Applying Kubernetes Manifests for MSA-Front ---"
                    // Deployment 파일의 이미지 경로를 NAS Registry 이미지 경로로 치환
                    sh "KUBECONFIG=${env.KUBECONFIG} sed -i 's|__ECR_IMAGE_FULL_PATH__|${dockerImageName}:${env.IMAGE_TAG}|g' k8s/deployment.yaml"

                    // K8s Deployment, Service, Ingress 적용
                    sh "KUBECONFIG=${env.KUBECONFIG} kubectl apply -f k8s/deployment.yaml -n ${env.NAMESPACE}"
                    sh "KUBECONFIG=${env.KUBECONFIG} kubectl apply -f k8s/service.yaml -n ${env.NAMESPACE}"
                    // ALB 서브넷 관련 어노테이션은 Traefik Ingress에서 필요 없으므로 제거
                    sh "KUBECONFIG=${env.KUBECONFIG} kubectl apply -f k8s/ingress.yaml -n ${env.NAMESPACE}"

                    echo "MSA-Front deployment manifests applied."

                    // --- Kubernetes Deployment Debugging (MSA-Front 파드 관련) ---
                    echo "--- Kubernetes Deployment Debugging (MSA-Front Pods) ---"
                    echo "Pods list before checking deployment status:"
                    sh "KUBECONFIG=${env.KUBECONFIG} kubectl get pods -n ${env.NAMESPACE} -l app=msa-front || true"
                    echo "Deployment events:"
                    sh "KUBECONFIG=${env.KUBECONFIG} kubectl describe deployment/msa-front-deployment -n ${env.NAMESPACE} || true"
                    echo "Pod logs (main container):"
                    sh "KUBECONFIG=${env.KUBECONFIG} kubectl get pods -n ${env.NAMESPACE} -l app=msa-front -o custom-columns=NAME:.metadata.name --no-headers | xargs -r -I {} sh -c 'echo \"--- Main container {} logs: ---\"; KUBECONFIG=${env.KUBECONFIG} kubectl logs {} -n ${env.NAMESPACE} -c msa-front-container || true; echo \"\";' || true"
                    echo "--- End Kubernetes Deployment Debugging ---"

                    // 배포 롤아웃 상태 확인
                    sh "KUBECONFIG=${env.KUBECONFIG} kubectl rollout status deployment/msa-front-deployment -n ${env.NAMESPACE} --timeout=600s || exit 1"
                    echo "MSA-Front deployment completed successfully."
                }
            }
        }
    }

    post {
        always {
            echo "=== 작업 공간 정리 ==="
            cleanWs() // Jenkins 워크스페이스 정리
        }
        failure {
            echo "❌ CI/CD 파이프라인이 msa-front 배포에 실패했습니다."
        }
        success {
            echo "✅ CI/CD 파이프라인이 msa-front 배포를 성공적으로 완료했습니다."
        }
    }
}

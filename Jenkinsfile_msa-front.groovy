pipeline {
    agent any

    // Jenkins Job 실행 시 수동으로 전체 재배포를 강제할 수 있는 파라미터
    parameters {
        booleanParam(defaultValue: true, description: 'Force full deployment of msa-front (ignores changes).', name: 'FORCE_FULL_DEPLOY')
    }

    environment {
        // AWS 계정 및 리전 정보
        AWS_REGION = 'ap-northeast-2'
        AWS_ACCOUNT_ID = '947625948810'

        // EKS 클러스터 정보
        EKS_CLUSTER_NAME = 'msa-eks-cluster'
        EKS_KUBECTL_ROLE_ARN = "arn:aws:iam::${AWS_ACCOUNT_ID}:role/JenkinsEKSDeployerRole"

        // Docker 이미지 태그 (Jenkins 빌드 번호 사용)
        IMAGE_TAG = "${env.BUILD_NUMBER}"

        // kubectl 설정 파일 경로
        KUBECONFIG_PATH = "${WORKSPACE}/kubeconfig"

        // ALB 서브넷 ID (Public + Private 포함 - 강사님 안내)
        ALB_SUBNET_IDS = "subnet-04362a3b7f2f40d81,subnet-0009bbca818e1d3bd,subnet-000fdbd8e407a0a5f,subnet-022c5c15b583995b1"

        // ==================== 프론트엔드 SECRET 환경 변수 (Jenkins Credentials에서 로드) ====================
        VITE_KAKAO_JAVASCRIPT_KEY = credentials('VITE_KAKAO_JAVASCRIPT_KEY')
        VITE_NAVER_CLIENT_ID      = credentials('VITE_NAVER_CLIENT_ID')
        VITE_GOOGLE_CLIENT_ID     = credentials('VITE_GOOGLE_CLIENT_ID')
    }

    // GitHub 웹훅 트리거 (deployAWS 브랜치에 푸시 시)
    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', credentialsId: 'github-msa-front-pat', url: 'https://github.com/jigubangbang/msa-front.git'
            }
        }

        stage('Set AWS Kubeconfig') {
            steps {
                script {
                    withCredentials([aws(credentialsId: 'aws-cicd-credentials')]) {
                        sh "aws eks update-kubeconfig --name ${env.EKS_CLUSTER_NAME} --region ${env.AWS_REGION} --kubeconfig ${env.KUBECONFIG_PATH} --role-arn ${env.EKS_KUBECTL_ROLE_ARN}"
                    }
                }
            }
        }

        stage('Deploy MSA-Front') {
            steps {
                script {
                    retry(3) {
                        sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl wait --for=condition=available deployment/api-gateway-deployment -n default --timeout=600s || exit 1"
                    }
                    echo "API Gateway is ready. Proceeding with MSA-Front."

                    def ecrRepoName = 'msa-msa-front' // ECR 레포지토리 이름
                    def fullEcrRepoUrl = "${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${ecrRepoName}"

                    echo "--- Building and Deploying ${ecrRepoName} ---"
                    def dockerImage = docker.build("${fullEcrRepoUrl}:${env.IMAGE_TAG}", "--build-arg VITE_KAKAO_JAVASCRIPT_KEY=${VITE_KAKAO_JAVASCRIPT_KEY} --build-arg VITE_NAVER_CLIENT_ID=${VITE_NAVER_CLIENT_ID} --build-arg VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID} ${params.FORCE_FULL_DEPLOY ? '--no-cache' : ''} .")

                    // ECR 로그인 및 이미지 푸시
                    withCredentials([aws(credentialsId: 'aws-cicd-credentials')]) {
                        sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${fullEcrRepoUrl.split('/')[0]}"
                        dockerImage.push("${env.IMAGE_TAG}")
                        dockerImage.push("latest") // latest 태그도 함께 푸시
                    }

                    // --- 기존 배포 강제 삭제 (새로운 이미지의 클린한 롤아웃을 보장하기 위해) ---
                    echo "--- 기존 배포 강제 삭제 (새로운 이미지 클린 롤아웃 보장) ---"
                    sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl delete deployment msa-front-deployment -n default --ignore-not-found || true"
                    sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl wait --for=delete deployment/msa-front-deployment -n default --timeout=300s --for=delete || true"
                    echo "--- 기존 배포 삭제 완료 (존재했다면) ---"
                    // --- 기존 배포 강제 삭제 끝 ---
                    sh """
                        KUBECONFIG=${env.KUBECONFIG_PATH} sed -i "s|__ECR_IMAGE_FULL_PATH__|${fullEcrRepoUrl}:${env.IMAGE_TAG}|g" k8s/deployment.yaml
                        KUBECONFIG=${env.KUBECONFIG_PATH} kubectl apply -f k8s/deployment.yaml -n default
                        KUBECONFIG=${env.KUBECONFIG_PATH} kubectl apply -f k8s/service.yaml -n default
                        KUBECONFIG=${env.KUBECONFIG_PATH} sed -i "s|alb.ingress.kubernetes.io/subnets: .*|alb.ingress.kubernetes.io/subnets: \\"${ALB_SUBNET_IDS}\\"|g" k8s/ingress.yaml
                        KUBECONFIG=${env.KUBECONFIG_PATH} kubectl apply -f k8s/ingress.yaml -n default
                    """

                    // --- Kubernetes Deployment Debugging (MSA-Front 파드 관련) ---
                    echo "--- Kubernetes Deployment Debugging (MSA-Front 파드 관련) ---"
                    echo "배포 상태 확인 전 파드 목록:"
                    sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl get pods -n default -l app=msa-front || true"
                    echo "배포 이벤트 확인:"
                    sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl describe deployment/msa-front-deployment -n default || true"
                    echo "파드 로그 확인 (메인 컨테이너):"
                    sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl get pods -n default -l app=msa-front -o custom-columns=NAME:.metadata.name --no-headers | xargs -r -I {} sh -c 'echo \"--- 메인 컨테이너 {} 로그: ---\"; KUBECONFIG=${env.KUBECONFIG_PATH} kubectl logs {} -n default -c msa-front-container || true; echo \"\";' || true"
                    echo "--- End Kubernetes Deployment Debugging (MSA-Front 파드 관련) ---"
                    // --- 디버깅 끝 ---

                    sh """
                        KUBECONFIG=${env.KUBECONFIG_PATH} kubectl rollout status deployment/msa-front-deployment -n default --timeout=600s || exit 1
                    """
                    echo "MSA-Front 배포 완료."
                }
            }
        }
    }

    post {
        always {
            cleanWs() // 워크스페이스 정리
        }
        failure {
            echo "CI/CD Pipeline for msa-front failed."
        }
        success {
            echo "CI/CD Pipeline for msa-front finished successfully."
        }
    }
}
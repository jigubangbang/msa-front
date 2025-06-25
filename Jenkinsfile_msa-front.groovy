pipeline {
    agent any

    // Jenkins Job 실행 시 수동으로 전체 재배포를 강제할 수 있는 파라미터
    parameters {
        booleanParam(defaultValue: true, description: 'Force full deployment of msa-front (ignores changes).', name: 'FORCE_FULL_DEPLOY')
    }

    environment {
        // AWS 계정 및 리전 정보
        AWS_REGION = 'ap-northeast-2'
        AWS_ACCOUNT_ID = '947625948810' // 실제 AWS 계정 ID로 변경 필수

        // EKS 클러스터 정보
        EKS_CLUSTER_NAME = 'msa-eks-cluster' // 실제 EKS 클러스터 이름으로 변경 필수
        EKS_KUBECTL_ROLE_ARN = "arn:aws:iam::${AWS_ACCOUNT_ID}:role/JenkinsEKSDeployerRole" // 실제 IAM Role ARN으로 변경 필수

        // Docker 이미지 태그 (Jenkins 빌드 번호 사용)
        IMAGE_TAG = "${env.BUILD_NUMBER}"

        // kubectl 설정 파일 경로
        KUBECONFIG_PATH = "${WORKSPACE}/kubeconfig"

        // ALB 서브넷 ID (Public + Private 포함 - 강사님 안내)
        ALB_SUBNET_IDS = "subnet-04362a3b7f2f40d81,subnet-0009bbca818e1d3bd,subnet-000fdbd8e407a0a5f,subnet-022c5c15b583995b1"
    }

    // GitHub 웹훅 트리거 (deployAWS 브랜치에 푸시 시)
    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    // deployAWS 브랜치에 대한 푸시가 아니면 파이프라인 중단 (젠킨스 웹훅 필터링)
                    if ("${env.BRANCH_NAME}" != "deployAWS") {
                        echo "Skipping pipeline for branch: ${env.BRANCH_NAME}. Only 'deployAWS' branch triggers full pipeline."
                        currentBuild.result = 'NOT_BUILT' // 빌드를 건너뛰고 'NOT_BUILT' 상태로 표시
                        error "Push not on 'deployAWS' branch. Exiting." // 파이프라인 중단
                    }
                }
                // deployAWS 브랜치 체크아웃
                // credentialsId는 Jenkins에 등록된 GitHub PAT Credential ID여야 합니다.
                // 이 레포지토리의 크리덴셜 ID를 사용하세요 (예: 'github-msa-front-pat')
                git branch: 'deployAWS', credentialsId: 'github-msa-front-pat', url: 'https://github.com/jigubangbang/msa-front.git'
            }
        }

        stage('Set AWS Kubeconfig') {
            steps {
                script {
                    // EKS 클러스터 접근을 위한 kubeconfig 설정
                    // 'aws-cicd-credentials'는 Jenkins에 등록된 AWS IAM 사용자/역할 Credential ID여야 합니다.
                    withCredentials([aws(credentialsId: 'aws-cicd-credentials')]) {
                        sh "aws eks update-kubeconfig --name ${env.EKS_CLUSTER_NAME} --region ${env.AWS_REGION} --kubeconfig ${env.KUBECONFIG_PATH} --role-arn ${env.EKS_KUBECTL_ROLE_ARN}"
                    }
                }
            }
        }

        stage('Deploy MSA-Front') {
            steps {
                script {
                    // 프론트엔드는 백엔드 서비스들이 모두 준비된 후에 배포하는 것이 일반적입니다.
                    // 여기서는 API Gateway가 준비될 때까지 기다리도록 설정합니다.
                    retry(3) { // 불안정한 네트워크 상황 대비 재시도
                        sh "KUBECONFIG=${env.KUBECONFIG_PATH} kubectl wait --for=condition=available deployment/api-gateway-deployment -n default --timeout=600s || exit 1"
                    }
                    echo "API Gateway is ready. Proceeding with MSA-Front."

                    def ecrRepoName = 'msa-msa-front' // ECR 레포지토리 이름
                    def fullEcrRepoUrl = "${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${ecrRepoName}"

                    echo "--- Building and Deploying ${ecrRepoName} ---"
                    // msa-front의 루트 디렉토리에서 Dockerfile이 존재하므로 dir() 필요 없음
                    // Docker 이미지 빌드 (FORCE_FULL_DEPLOY 시 --no-cache)
                    def dockerImage = docker.build("${fullEcrRepoUrl}:${env.IMAGE_TAG}", "${params.FORCE_FULL_DEPLOY ? '--no-cache' : ''} .")

                    // ECR 로그인 및 이미지 푸시
                    withCredentials([aws(credentialsId: 'aws-cicd-credentials')]) {
                        sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${fullEcrRepoUrl.split('/')[0]}"
                        dockerImage.push("${env.IMAGE_TAG}")
                        dockerImage.push("latest") // latest 태그도 함께 푸시
                    }

                    // Kubernetes Deployment/Service/Ingress YAML 업데이트 및 적용
                    // k8s YAML 파일들은 msa-front/k8s/ 디렉토리에 있다고 가정
                    sh """
                        KUBECONFIG=${env.KUBECONFIG_PATH} sed -i "s|__ECR_IMAGE_FULL_PATH__|${fullEcrRepoUrl}:${env.IMAGE_TAG}|g" k8s/deployment.yaml
                        KUBECONFIG=${env.KUBECONFIG_PATH} kubectl apply -f k8s/deployment.yaml -n default
                        KUBECONFIG=${env.KUBECONFIG_PATH} kubectl apply -f k8s/service.yaml -n default
                        KUBECONFIG=${env.KUBECONFIG_PATH} sed -i "s|alb.ingress.kubernetes.io/subnets: .*|alb.ingress.kubernetes.io/subnets: \\"${ALB_SUBNET_IDS}\\"|g" k8s/ingress.yaml
                        KUBECONFIG=${env.KUBECONFIG_PATH} kubectl apply -f k8s/ingress.yaml -n default
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

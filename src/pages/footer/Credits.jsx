import React from 'react';
import FooterTab from '../../components/main/FooterTab';
import styles from './FooterPage.module.css';

const Credits = () => {
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>개발 정보</h1>
      </div>
      <FooterTab />
      <div className={styles.contentArea}>

        <h1 className={styles.title}>TEAM 지구한바퀴</h1>
        <p className={styles.paragraph}>
          지구방방은 여행을 사랑하는 5명의 개발자들이 모여 기획하고 개발한 여행 기록 및 공유 플랫폼입니다.<br/>
          전 세계 어디든 자유롭게 여행하며 그 소중한 순간들을 기록하고, 나누고 싶다는 마음으로 시작한 지구방방 프로젝트는 모든 팀원이 프론트엔드와 백엔드를 아우르며 개발 전반에 적극적으로 참여했습니다.
        </p>
        <ul className={styles.list}>
          <li><strong>• 권민정</strong> {'\u00A0'} quest-service & community-service | <a href="mailto:dried021@gmail.com" className={styles.link}>dried021@gmail.com</a></li>
          <li><strong>• 남승현</strong> {'\u00A0'} feed-service & mypage-service | <a href="mailto:shyunam@gmail.com" className={styles.link}>shyunam@gmail.com</a></li>
          <li><strong>• 박나혜</strong> {'\u00A0'} user-service & admin-service | <a href="mailto:pnhmms@gmail.com" className={styles.link}>pnhmms@gmail.com</a></li>
          <li><strong>• 이설영</strong> {'\u00A0'} chat-service & infra-platform | <a href="mailto:peaceful_sera@naver.com" className={styles.link}>peaceful_sera@naver.com</a></li>
          <li><strong>• 장준환</strong> {'\u00A0'} payment-service & deployment | <a href="mailto:j8428820@naver.com" className={styles.link}>j8428820@naver.com</a></li>
        </ul>

        <h1 className={styles.title}>프로젝트 정보</h1>
        <ul className={styles.list}>
          <li><strong>• 프로젝트명</strong> {'\u00A0'}지구방방 (JiguBangBang)</li>
          <li><strong>• 프로젝트 유형</strong> {'\u00A0'}여행 기록 및 소셜 네트워킹 웹 서비스</li>
          <li><strong>• 개발 기간</strong> {'\u00A0'}2025년 05월 ~ 2025년 07월</li>
          <li><strong>• 개발 환경</strong> {'\u00A0'}협업 기반 풀스택 개발 / MSA 적용</li>
        </ul>

        <h1 className={styles.title}>기술 스택</h1>
        <ul className={styles.list}>
          <li><strong>• Frontend</strong> {'\u00A0'}React 18, Vite, React Router DOM, Zustand, Axios, MUI Material, Emotion, Bootstrap Icons, D3.js</li>
          <li><strong>• Backend</strong> {'\u00A0'}Spring Boot 3.4.6, Spring Web, MyBatis, Spring Security, Spring Mail, JWT, WebSocket(STOMP, SockJS)</li>
          <li><strong>• Database</strong> {'\u00A0'}MySQL, AWS RDS</li>
          <li><strong>• Cloud & Infrastructure</strong> {'\u00A0'}AWS(EKS, ECR, S3), Docker, Kubernetes</li>
          <li><strong>• Microservices</strong> {'\u00A0'}Spring Cloud(Eureka, Config Server, API Gateway, OpenFeign)</li>
          <li><strong>• CI/CD</strong> {'\u00A0'}Jenkins, GitHub</li>
          <li><strong>• Payment</strong> {'\u00A0'}Iamport</li>
          <li><strong>• Environment</strong> {'\u00A0'}Maven, Java 17, VS Code, Git, GitHub, Notion</li>
        </ul>

        <h1 className={styles.title}>버전 정보 및 문의</h1>
        <p className={styles.paragraph}>현재 버전 | v1.0.0 (2025년 7월 출시)</p>
        <p className={styles.paragraph}>
          지속적인 업데이트를 통해 더 나은 서비스를 제공하겠습니다 ☺
        </p>
        <p className={styles.paragraph}>▶ 이메일 | support@jigubangbang.com</p>
      </div>
    </div>
  );
};

export default Credits;
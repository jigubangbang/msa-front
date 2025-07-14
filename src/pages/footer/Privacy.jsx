import React from "react";
import FooterTab from "../../components/main/FooterTab";
import styles from "./FooterPage.module.css";

export default function Privacy() {
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>개인정보처리방침</h1>
      </div>
      <FooterTab />
      <div className={styles.contentArea}>

        <h1 className={styles.title}>제1조 (개인정보의 처리 목적)</h1>
        <p className={styles.paragraph}>
          팀 "지구한바퀴"(이하 "서비스 제공자")는 회원가입, 서비스 제공 및 맞춤형 콘텐츠 제공을 위해 아래와 같이 개인정보를 처리합니다.
        </p>
        <ul className={styles.list}>
          <li><strong>• 회원 식별 및 인증</strong></li>
          <li><strong>• 서비스 제공 및 관리</strong> {'\u00A0'}여행 기록, 커뮤니티, 퀘스트 등</li>
          <li><strong>• 고객 문의 대응</strong></li>
          <li><strong>• 프리미엄 서비스 결제 및 이용 내역 확인</strong></li>
          <li><strong>• 서비스 품질 개선 및 통계</strong></li>
        </ul>

        <h1 className={styles.title}>제2조 (수집하는 개인정보 항목)</h1>
        <p className={styles.paragraph}>서비스 제공자는 회원가입 및 서비스 이용 과정에서 다음 정보를 수집합니다.</p>
        <p className={styles.paragraph}>① 필수항목: 아이디, 비밀번호, 이름, 닉네임, 이메일</p>
        <p className={styles.paragraph}>② 선택항목: 프로필 이미지, 여행 스타일, 국적, 자기소개</p>
        <p className={styles.paragraphSpaced}>③ 자동 수집 항목: IP주소, 쿠키, 서비스 이용 기록, 방문 기록</p>

        <h1 className={styles.title}>제3조 (개인정보의 보유 및 파기)</h1>
        <p className={styles.paragraph}>① 서비스 제공자는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
        <p className={styles.paragraph}>② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</p>
        <ul className={styles.list}>
          <li><strong>• 회원정보</strong> {'\u00A0'}회원탈퇴 시 즉시 파기 (탈퇴한 아이디는 재사용되지 않음)</li>
          <li><strong>• 여행 기록 및 게시글</strong> {'\u00A0'}회원탈퇴 시까지</li>
          <li><strong>• 접속기록</strong> {'\u00A0'}3개월</li>
          <li><strong>• 결제정보</strong> {'\u00A0'}5년 (전자상거래법)</li>
          <li><strong>• 계정 정지 시</strong> {'\u00A0'}서비스 운영 정책에 따라 일부 정보가 일정 기간 보관될 수 있음</li>
        </ul>

        <h1 className={styles.title}>제4조 (개인정보의 제3자 제공 및 위탁)</h1>
        <p className={styles.paragraph}>① 서비스 제공자는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
        <ul className={styles.list}>
          <li><strong>• 이메일 인증</strong> {'\u00A0'}Google SMTP 서비스</li>
          <li><strong>• 결제 서비스</strong> {'\u00A0'}Portone(Iamport)</li>
          <li><strong>• 클라우드 서비스</strong> {'\u00A0'}AWS (데이터 저장 및 서버 운영)</li>
        </ul>
        <p className={styles.paragraphSpaced}>② 위탁 및 제3자 제공은 사전 고지 및 동의를 거쳐 진행되며, 위탁계약 체결시 개인정보 보호를 위한 관리·감독을 실시합니다.</p>

        <h1 className={styles.title}>제5조 (마케팅 정보 수신 동의)</h1>
        <p className={styles.paragraph}>① 회원가입 시 선택 동의 항목으로, 신규 서비스, 이벤트, 할인 정보 등을 이메일, 문자, 앱 알림으로 안내할 수 있습니다.</p>
        <p className={styles.paragraph}>② 동의하지 않아도 서비스 이용에는 제한이 없습니다.</p>
        <p className={styles.paragraph}>③ 현재는 마케팅 정보를 안내하지 않으며, 추후 확장 예정입니다.</p>
        <p className={styles.paragraphSpaced}>④ 언제든지 1:1 문의 또는 고객센터를 통해 수신 동의를 철회할 수 있습니다.</p>

        <h1 className={styles.title}>제6조 (맞춤형 콘텐츠 제공 동의)</h1>
        <p className={styles.paragraph}>① 회원가입 시 선택 동의 항목으로, 사용자의 여행 스타일 검사를 기반으로 맞춤형 추천 서비스를 제공합니다.</p>
        <p className={styles.paragraph}>② 동의하지 않아도 기본 서비스 이용에는 지장이 없습니다.</p>
        <p className={styles.paragraphSpaced}>③ 현재는 해당 서비스 개발 중이며, 추후 확장 예정입니다.</p>

        <h1 className={styles.title}>제7조 (쿠키 및 로그 정보 수집)</h1>
        <p className={styles.paragraph}>① 쿠키는 로그인 상태 유지, 이용자 편의, 서비스 품질 개선을 위해 사용됩니다.</p>
        <p className={styles.paragraph}>② 접속 기록 등 로그 정보는 서비스 안정성 확보 및 통계 목적으로 수집됩니다.</p>
        <p className={styles.paragraphSpaced}>③ 쿠키 설정은 웹브라우저에서 변경할 수 있으며, 거부 시 일부 서비스 이용에 제한이 있을 수 있습니다.</p>

        <h1 className={styles.title}>제8조 (정보주체의 권리·의무 및 행사방법)</h1>
        <p className={styles.paragraph}>① 정보주체는 서비스 제공자에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
        <ul className={styles.list}>
          <li><strong>• 개인정보 처리현황 통지요구</strong></li>
          <li><strong>• 개인정보 열람요구</strong></li>
          <li><strong>• 개인정보 정정·삭제요구</strong></li>
          <li><strong>• 개인정보 처리정지요구</strong></li>
        </ul>
        <p className={styles.paragraphSpaced}>② 제1항에 따른 권리 행사는 서면, 전자우편 등을 통하여 하실 수 있으며 서비스 제공자는 이에 대해 지체 없이 조치하겠습니다.</p>

        <h1 className={styles.title}>제9조 (개인정보 처리방침 변경 고지)</h1>
        <p className={styles.paragraphSpaced}>
          개인정보처리방침 변경 시 회원 이메일을 통해 고지하며, 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
        </p>

        <h1 className={styles.title}>제10조 (아동 개인정보 관련)</h1>
        <p className={styles.paragraphSpaced}>
          18세 미만 회원 가입을 제한하지 않으며, 아동의 개인정보 보호를 위해 최선을 다합니다.
        </p>

        <h1 className={styles.title}>제11조 (해외 서버 저장 및 제공)</h1>
        <p className={styles.paragraphSpaced}>
          서비스 제공자는 AWS 등 클라우드 서비스를 이용하며, 개인정보는 국내외 서버에 저장될 수 있습니다. 관련 법령에 따라 개인정보 보호 조치를 시행합니다.
        </p>

        <h1 className={styles.title}>제12조 (개인정보 보호책임자 및 고객센터)</h1>
        <p className={styles.paragraph}>
          개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제를 위한 연락처는 다음과 같습니다:
        </p>
        <p className={styles.paragraph}>▶ 개인정보 보호책임자 | 팀 지구한바퀴</p>
        <p className={styles.paragraphSpaced}>▶ 이메일 | support@jigubangbang.com</p>

        <p className={`${styles.centeredText}`}>
          본 개인정보처리방침은 2025년 1월 1일부터 시행됩니다
        </p>

      </div>
    </div>
  );
}
import React from "react";
import FooterTab from "../../components/main/FooterTab";
import styles from "./FooterPage.module.css";

export default function Terms() {
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>이용약관</h1>
      </div>
      <FooterTab />
      <div className={styles.contentArea}>

        <h1 className={styles.title}>제1조 (목적)</h1>
        <p className={styles.paragraph}>
          본 서비스의 서비스 제공자는 팀 "지구한바퀴" 이며, 이하 "서비스 제공자"라 칭합니다.
        </p>
        <p className={styles.paragraphSpaced}>
          이 약관은 지구방방(이하 "서비스")을 제공하는 서비스 제공자 팀 "지구한바퀴"(이하 "서비스 제공자")와 이용자 간의 권리, 의무, 책임사항 및 서비스 이용조건을 규정함을 목적으로 합니다.
        </p>

        <h1 className={styles.title}>제2조 (정의)</h1>
        <p className={styles.paragraph}>① "서비스"란 서비스 제공자가 운영하는 여행 기록, 공유, 커뮤니티 등 모든 서비스를 의미합니다.</p>
        <p className={styles.paragraph}>② "이용자"란 이 약관에 따라 서비스 제공자의 서비스를 받는 회원 및 비회원을 말합니다.</p>
        <p className={styles.paragraphSpaced}>③ "회원"이란 서비스 제공자의 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스를 지속적으로 이용할 수 있는 자를 말합니다.</p>

        <h1 className={styles.title}>제3조 (약관의 게시와 개정)</h1>
        <p className={styles.paragraph}>① 서비스 제공자는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</p>
        <p className={styles.paragraphSpaced}>② 서비스 제공자는 필요하다고 인정되는 경우 이 약관을 개정할 수 있으며, 개정된 약관은 제1항과 같은 방법으로 공지 또는 통지함으로써 효력이 발생합니다.</p>

        <h1 className={styles.title}>제4조 (서비스의 제공 및 변경)</h1>
        <p className={styles.paragraph}>① 서비스 제공자는 다음과 같은 서비스를 제공합니다:</p>
        <ul className={styles.list}>
          <li><strong>• 여행 기록 및 공유 서비스</strong></li>
          <li><strong>• 여행 커뮤니티 서비스</strong></li>
          <li><strong>• 여행자 모임 및 정보 공유 서비스</strong></li>
          <li><strong>• 퀘스트 및 뱃지 시스템</strong></li>
          <li><strong>• 기타 서비스 제공자가 정하는 서비스</strong></li>
        </ul>

        <h1 className={styles.title}>제5조 (서비스 이용)</h1>
        <p className={styles.paragraph}>① 서비스 이용은 서비스 제공자의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다.</p>
        <p className={styles.paragraphSpaced}>② 서비스 제공자는 서비스를 일정범위로 분할하여 각 범위별로 이용가능시간을 별도로 지정할 수 있습니다.</p>

        <h1 className={styles.title}>제6조 (회원가입)</h1>
        <p className={styles.paragraph}>① 이용자는 서비스 제공자가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.</p>
        <p className={styles.paragraphSpaced}>② 서비스 제공자는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각호에 해당하지 않는 한 회원으로 등록합니다.</p>

        <h1 className={styles.title}>제7조 (개인정보보호)</h1>
        <p className={styles.paragraphSpaced}>
          서비스 제공자는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을 수립하여 이를 준수합니다. 자세한 내용은 개인정보처리방침을 참고하시기 바랍니다.
        </p>

        <h1 className={styles.title}>제8조 (이용자의 의무)</h1>
        <p className={styles.paragraph}>① 이용자는 다음 행위를 하여서는 안 됩니다:</p>
        <ul className={styles.list}>
          <li><strong>• 타인의 정보 도용</strong></li>
          <li><strong>• 서비스 제공자가 게시한 정보의 변경</strong></li>
          <li><strong>• 음란하거나 폭력적인 메시지, 화상, 음성 등의 공개 또는 게시</strong></li>
          <li><strong>• 기타 불법적이거나 부당한 행위</strong></li>
        </ul>

        <h1 className={styles.title}>제9조 (저작권의 귀속 및 이용제한)</h1>
        <p className={styles.paragraph}>① 서비스 제공자가 작성한 저작물에 대한 저작권 기타 지적재산권은 서비스 제공자에게 귀속합니다.</p>
        <p className={styles.paragraphSpaced}>② 이용자는 서비스를 이용함으로써 얻은 정보 중 서비스 제공자에게 지적재산권이 귀속된 정보를 서비스 제공자의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</p>

        <h1 className={styles.title}>제10조 (여행 스타일 분석 결과에 대한 고지 및 면책)</h1>
        <p className={styles.paragraphSpaced}>
          지구방방의 여행 스타일 분석은 간단한 테스트 형식으로, 단순히 재미와 참고용으로 제공됩니다.
          분석 결과는 이용자의 실제 성향과 다를 수 있으며, 이에 따른 책임은 서비스 제공자에게 없습니다.
        </p>

        <h1 className={styles.title}>제11조 (커뮤니티 운영 정책 및 금지 행위)</h1>
        <p className={styles.paragraph}>이용자는 서비스 내에서 다음과 같은 행위를 하여서는 안 됩니다:</p>
        <ul className={styles.list}>
          <li><strong>• 음란/선정적 내용 (SEX)</strong> {'\u00A0'}성적인 표현, 노출 이미지, 불쾌한 성적 암시 등</li>
          <li><strong>• 욕설/비방 (ABU)</strong> {'\u00A0'}인신공격, 모욕, 혐오 표현 등</li>
          <li><strong>• 스팸/광고 (SPM)</strong> {'\u00A0'}반복 홍보, 상업적 내용, 도배 등</li>
          <li><strong>• 불법/개인정보 노출 (ILG)</strong> {'\u00A0'}범죄 유도, 불법 거래, 개인정보 포함 내용 등</li>
          <li><strong>• 기타 (직접 입력) (ETC)</strong> {'\u00A0'}위 항목 외 사용자가 직접 사유 입력</li>
        </ul>
        <p className={styles.paragraphSpaced}>
          위 행위가 적발될 경우, 서비스 제공자는 해당 게시물을 삭제하거나 이용 제한, 계정 정지 또는 탈퇴 조치를 할 수 있으며 신고 누적 시 자동 제재가 이루어집니다.
          이용자는 이의 제기를 통해 제재 해제를 요청할 수 있습니다.
        </p>

        <h1 className={styles.title}>제12조 (프리미엄 구독 서비스 및 결제)</h1>
        <p className={styles.paragraphSpaced}>
          프리미엄 구독은 월 990원의 정기 결제로 제공되며, 사용자는 언제든지 구독 해지할 수 있습니다.<br/>
          해지 시 다음 결제일부터 자동 결제가 중단됩니다.<br/>
          단순 변심에 의한 환불은 제한될 수 있으며, 시스템 오류 또는 서비스 제공 불가 시 서비스 제공자에게 환불을 요청할 수 있습니다.
        </p>

        <h1 className={styles.title}>제13조 (계정 탈퇴 및 정보 보관)</h1>
        <p className={styles.paragraphSpaced}>
          이용자가 자발적으로 탈퇴하는 경우, 해당 계정은 즉시 복구가 불가능하며 재가입 시 동일 아이디를 사용할 수 없습니다.<br/>
          다만, 일부 개인정보는 내부 정책 및 이의제기 처리를 위해 일정 기간 데이터베이스에 보관될 수 있습니다.<br/>
          서비스 제공자 운영진에 의한 계정 정지 또는 탈퇴 시 이의제기가 승인된 경우에만 복구가 가능합니다.
        </p>

        <p className={`${styles.centeredText}`}>
          본 약관은 2025년 1월 1일부터 시행됩니다
        </p>

      </div>
    </div>
  );
}

import React from "react";
import FooterTab from "../../components/main/FooterTab";
import styles from "./FooterPage.module.css";

export default function About() {
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>사이트 소개</h1>
      </div>
      <FooterTab />
      <div className={styles.contentArea}>

        <h1 className={styles.title}>지구방방이란?</h1>
        <p className={styles.paragraph}>
          지구방방(JiguBangBang)은 여행의 시작부터 끝까지, 모든 순간을 하나의 플랫폼에서 쉽고 편리하게 기록하고 공유할 수 있는 올인원 웹 서비스입니다.
        </p>
        <p className={styles.paragraph}>
          여행 스타일 분석을 통해 나와 닮은 여행 취향을 가진 친구를 추천받고, 그들의 여행 이야기를 함께 즐길 수 있습니다.<br/>
          나만의 여행 스토리를 기록하고 공유하며, 지구방방의 다양한 기능을 통해 여행의 재미를 한층 더해보세요.
        </p>
        <p className={styles.paragraph2}>
          회원가입 없이도 다른 여행자들의 멋진 여행 피드와 커뮤니티를 둘러볼 수 있습니다.<br/>
          하지만 나의 여행을 생생히 기록하고, 퀘스트에 도전하며, 다른 여행자들과 실시간으로 소통하려면 회원가입이 필요합니다.
        </p>
        <p className={styles.paragraphSpaced}>
          지구방방은 사용자를 위한 모든 서비스를 유기적으로 연결해 더욱 풍부하고
          즐거운 경험을 제공합니다!
        </p>

        <h1 className={styles.title}>지구방방과 함께 여행을 시작해보세요!</h1>
        <p className={styles.paragraph}>
          "지구방방"은 지구 방방곡곡을 돌아다니며 전 세계 어디에서든 자유롭게 여행하고, 그 모든 순간을 기록하자는 마음을 담아 만든 플랫폼입니다.
        </p>
        <p className={styles.paragraph}>
          집 근처 작은 카페부터 지구 반대편의 이국적인 도시까지, 거리와 규모에 관계없이 모든 여행은 소중하고 의미 있는 경험입니다.<br/>
          때로는 혼자만의 조용한 여행이, 때로는 친구들과 함께하는 신나는 모험이 우리 인생에 특별한 색깔을 더해줍니다.
        </p>
        <p className={styles.paragraphSpaced}>
          지구방방은 여러분의 모든 여행이 더욱 풍성하고 즐거운 추억이 될 수 있도록, 그리고 그 소중한 기억들이 오랫동안 이어지길 응원합니다.<br/>
          지구 어디서든, 언제나 여러분의 다음 모험을 지구방방이 함께합니다 ☺
        </p>

        <h1 className={styles.title}>지구방방에서 할 수 있는 일들</h1>
        <p className={styles.paragraph2}>
          지구방방에서는 다양한 방식으로 여행을 즐기고 기록할 수 있습니다 :
        </p>
        <ul className={styles.list}>
          <li>
            <strong>• 여행 스타일 분석</strong> {'\u00A0'} 나만의 여행 성향을 분석해 새로운 친구를 추천받고, 나와 닮은 여행 이야기를 발견할 수 있습니다.
          </li>
          <li>
            <strong>• 여행 피드</strong> {'\u00A0'} 여행지의 생생한 순간들을 멋진 사진과 글로 감성 있게 기록해 다른 여행자들과 추억을 공유해보세요.
          </li>
          <li>
            <strong>• 퀘스트&뱃지</strong> {'\u00A0'} 퀘스트를 수행하여 레벨을 올리고 뱃지를 수집할 수 있습니다. 레벨이 높아질수록 다양한 커뮤니티 기능을 이용할 수 있습니다.
          </li>
          <li>
            <strong>• 커뮤니티 </strong> {'\u00A0'} 여행 후기, 꿀팁, 질문 등 다양한 게시판을 통해 자유롭게 소통할 수 있습니다.
          </li>
          <li>
            <strong>• 여행자 모임</strong> {'\u00A0'} 비슷한 여행 취향을 가진 사람들과 함께 여행을 계획하고 새로운 인연을 만들어보세요.
          </li>
          <li>
            <strong>• 실시간 정보 공유</strong> {'\u00A0'} 여행자 간 실시간 채팅을 통해 여행 중 필요한 정보를 빠르게 주고받을 수 있습니다.
          </li>
          <li>
            <strong>• 개인 여행 기록</strong> {'\u00A0'} 내가 다녀온 여행지를 세계지도에 기록하며 나만의 여행 발자취를 시각적으로 관리할 수 있습니다.
          </li>
          <li>
            <strong>• 프리미엄 구독</strong> {'\u00A0'} 월 990원의 정기결제로 특별한 프리미엄 혜택을 누릴 수 있습니다. 여행을 더욱 풍성하게 만드는 다양한 기능을 만나보세요.
          </li>
        </ul>
      </div>
    </div>
  );
}

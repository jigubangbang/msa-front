import React, { useState } from "react";
import { scroller } from 'react-scroll';
import Header from '../../components/main/Header'; // 필요시 헤더 컴포넌트 추가
import styles from './Main.module.css';
import Vote from '../../components/community/Vote'; // 커뮤니티 섹션에 사용
// 필요한 경우 다른 공통 컴포넌트들을 여기에 import 하세요.

export default function Main() {
    const scrollToContent = () => {
        scroller.scrollTo('content-section', {
            duration: 800,
            delay: 0,
            smooth: 'easeInOutQuart',
            offset: -49 // 헤더 높이
        });
    };

    return (
        <div className={styles.outerContainer}>
            {/* 메인 포스터/히어로 섹션 */}
            <div className={styles.mainPoster}>
                <div className={styles.posterTitle}>JIGU PROJECT</div>
                <div className={styles.posterSubtitle}>여행, 그 이상의 여정을 기록하다</div>
                <button className={styles.startButton} onClick={scrollToContent}>
                    START NOW
                </button>
            </div>

            <div id="content-section" className={styles.container}>
                {/* 인기 여행 피드 섹션 (슬라이드) */}
                <div className={styles.section}>
                    <h2>인기 여행 피드</h2>
                    <p className={styles.bodySecondary}>인스타그램처럼 아름다운 여행 사진들을 슬라이드하며 만나보세요.</p>
                    <div className={styles.marqueeContainer}>
                        <div className={styles.horizontalScrollContainer}>
                            {[1, 2, 3, 4, 1, 2, 3, 4].map((num, index) => (
                                <div key={index} className={styles.scrollItem}>
                                    <img src={`/${num}.jpg`} alt={`여행 이미지 ${num}`} />
                                    <div className={styles.imageInfo}>
                                        <p>여행지 이름 {num}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 인기 퀘스트 섹션 (퀘스트 서비스 연동) */}
                <div className={styles.section}>
                    <h2>새로운 퀘스트에 도전해보세요!</h2>
                    <p className={styles.bodySecondary}>여행을 더욱 특별하게 만들어 줄 퀘스트.</p>
                    {/* 퀘스트 서비스에서 제공하는 인기 퀘스트 컴포넌트를 여기에 추가하세요. */}
                    {/* 예: <QuestList type="popular" /> */}
                    <div className={styles.sampleContainer}>
                        <p>여기에 퀘스트 서비스의 인기 퀘스트 컴포넌트가 들어갈 예정입니다.</p>
                        <p>예시: 퀘스트 제목, 설명, 보상, 참여 버튼 등</p>
                    </div>
                </div>

                {/* 커뮤니티 하이라이트 섹션 (커뮤니티 서비스 ���동) */}
                <div className={styles.section}>
                    <h2>여행자들의 이야기</h2>
                    <p className={styles.bodySecondary}>자유롭게 소통하고 정보를 공유하는 공간.</p>
                    {/* 커뮤니티 서비스에서 제공하는 최신/인기 게시글 또는 투표 컴포넌트를 여기에 추가하세요. */}
                    {/* 예: <CommunityPosts type="latest" /> */}
                    <Vote/>
                    <div className={styles.sampleContainer}>
                        <p>여기에 커뮤니티 서비스의 하이라이트 컴포넌트가 들어갈 예정입니다.</p>
                        <p>예시: 최신 게시글 목록, 인기 투표, Q&A 등</p>
                    </div>
                </div>

                {/* 마이페이지 요약/바로가기 섹션 (마이페이지 서비스 연동 - 로그인 시 노출) */}
                {/* {isLoggedIn && (
                    <div className={styles.section}>
                        <h2>나의 여행 요약</h2>
                        <p className={styles.bodySecondary}>나의 여행 기록과 활동을 한눈에 확인하세요.</p>
                        <div className={styles.sampleContainer}>
                            <p>여기에 마이페이지 서비스의 요약 정보 컴포넌트가 들어갈 예정입니다.</p>
                            <p>예시: 최근 기록, 달성 퀘스트, 프로필 바로가기 등</p>
                        </div>
                    </div>
                )} */}

                {/* 푸터 (필요시 별도 컴포넌트로 분리) */}
                <footer className={styles.section} style={{ textAlign: 'center', marginTop: '50px', paddingBottom: '20px', color: 'var(--color-text-secondary)' }}>
                    <p>&copy; 2025 JIGU PROJECT. All rights reserved.</p>
                    {/* 약관, 개인정보처리방침 등 링크 추가 */}
                </footer>
            </div>
        </div>
    );
}
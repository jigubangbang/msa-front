import React, { useState, useEffect } from "react"; // 데이터를 가져오기 위해 useEffect를 import합니다.
import { scroller } from 'react-scroll';
import styles from './Main.module.css';
import Vote from '../../components/community/Vote';
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import defaultProfile from "../../assets/default_profile.png";
import { useNavigate, useLocation } from "react-router-dom";
import LoginConfirmModal from "../../components/common/LoginConfirmModal/LoginConfirmModal";
import Modal from "../../components/common/Modal/Modal";

// ==================================================================================
// 목업 데이터 (Mock Data)
// - 각 서비스의 API가 완성되기 전까지 UI 개발을 위해 사용하는 가짜 데이터입니다.
// - 각 팀원은 자신의 서비스 API가 완성되면, 이 목업 데이터를 실제 API 응답 데이터 구조에 맞게 수정하거나 참고할 수 있습니다.
// ==================================================================================
const mockPopularFeeds = [
    { id: 1, user: '여행가', location: '스위스', avatar: '/1.jpg', image: '/1.jpg' },
    { id: 2, user: '탐험가', location: '이탈리아', avatar: '/2.jpg', image: '/2.jpg' },
    { id: 3, user: '방랑자', location: '프랑스', avatar: '/3.jpg', image: '/3.jpg' },
    { id: 4, user: '모험가', location: '스페인', avatar: '/4.jpg', image: '/4.jpg' },
];

const mockQuests = [
    { id: 1, title: '서울의 숨겨진 보물찾기', description: '남산타워에서 자물쇠 걸고 명동교자 먹기', reward: '150 XP' },
    { id: 2, title: '부산 바다 정복', description: '해운대에서 광안리까지 해변따라 걷기', reward: '200 XP' },
    { id: 3, title: '제주 오름 투어', description: '하루에 오름 3곳 이상 등반하기', reward: '250 XP' },
];

const mockCommunityPosts = [
    { id: 1, title: '다들 여행 비수기/성수기 언제라고 생각하세요?', author: '토론왕', date: '2024.07.10' },
    { id: 2, title: '7월 말에 제주도 가는데 숙소 추천좀요!', author: '제주사랑', date: '2024.07.09' },
    { id: 3, title: '혼자 유럽여행 다녀오신 분 계신가요?', author: '프로혼밥러', date: '2024.07.09' },
];

const mockMyPageSummary = {
    nickname: 'JIGU',
    travelLogCount: 12,
    completedQuestCount: 5,
    level: 3,
};

export default function Main() {
    // ==================================================================================
    // 상태 관리 (State Management)
    // - API로부터 받아온 실제 데이터를 저장하기 위한 state들입니다.
    // - 초기값으로는 위에서 정의한 목업 데이터를 사용하여, API 연동 전에도 화면이 정상적으로 보이도록 합니다.
    // - 각 팀원은 자신의 데이터를 담을 state를 관리하게 됩니다.
    // ==================================================================================
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginConfirmModal, setShowLoginConfirmModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    // 각 서비스 데이터를 위한 state
    const [feeds, setFeeds] = useState(mockPopularFeeds); // 피드 서비스 데이터
    const [quests, setQuests] = useState(mockQuests);     // 퀘스트 서비스 데이터
    const [posts, setPosts] = useState(mockCommunityPosts); // 커뮤니티 서비스 데이터
    const [summary, setSummary] = useState(mockMyPageSummary); // 마이페이지 서비스 데이터

    // 데이터 로딩 및 에러 상태 관리
    const [loading, setLoading] = useState(false); // 초기에는 false, API 호출 시 true로 변경
    const [error, setError] = useState(null);

    
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken != null) {
            setIsLoggedIn(true);
        }
    }, []);

    useEffect(() => {
        if (location.state?.showIncompleteProfileModal) {
            setShowProfileModal(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);


    // ==================================================================================
    // 데이터 연동 (Data Fetching)
    // - 페이지가 처음 렌더링될 때, 각 서비스의 API를 호출하여 실제 데이터를 가져오는 부분입니다.
    // - useEffect 훅은 컴포넌트가 마운트될 때 (처음 나타날 때) 한 번만 실행됩니다.
    // - 각 팀원은 아래의 주석 처리된 예시를 참고하여 자신의 API 호출 코드를 작성하면 됩니다.
    // ==================================================================================
    useEffect(() => {
        // --- 아래 함수는 실제 API를 호출하기 위한 예시입니다. ---
        const fetchAllData = async () => {

            setLoading(true); // 데이터 요청 시작! 로딩 스피너 등을 보여줄 수 있습니다.
            setError(null);   // 이전 에러가 있었다면 초기화합니다.

            try {
                const feedResponse = await api.get(`${API_ENDPOINTS.FEED.PUBLIC}/posts/top`);
                const feedData = await feedResponse.data.posts;
                setFeeds(feedData);

                // Promise.all을 사용하면 여러 API를 동시에 호출하여 더 빠르게 데이터를 가져올 수 있습니다.
                // 각 팀원은 자신의 API 호출 함수를 만들어 아래처럼 추가하면 됩니다.
                
                /*
                // --- 주석 해제 후 실제 API 호출 코드로 변경하세요 ---

                // 2. 퀘스트 서비스 API 호출
                const questResponse = await fetch('/api/quests/popular'); // 예시 URL
                const questData = await questResponse.json();
                setQuests(questData); // 받아온 실제 데이터로 state 업데이트

                // 3. 커뮤니티 서비스 API 호출
                const postResponse = await fetch('/api/community/posts/recent'); // 예시 URL
                const postData = await postResponse.json();
                setPosts(postData); // 받아온 실제 데이터로 state 업데이트
                
                // 4. 마이페이지 서비스 API 호출
                if (isLoggedIn) { // 로그인 상태일 때만 호출
                    const summaryResponse = await fetch('/api/mypage/summary'); // 예시 URL
                    const summaryData = await summaryResponse.json();
                    setSummary(summaryData); // 받아온 실제 데이터로 state 업데이트
                }
                */

            } catch (err) {
                // API 호출 중 에러가 발생하면 이곳에서 처리합니다.
                console.error("데이터 로딩 중 에러 발생:", err);
                setError("페이지를 불러오는 데 실패했습니다.");
            } finally {
                // 성공하든 실패하든, 데이터 요청이 끝나면 로딩 상태를 해제합니다.
                setLoading(false);
            }
        };

        fetchAllData(); // <<-- 실제 API 연동 시 이 줄의 주석을 해제하세요.

    }, [isLoggedIn]); // isLoggedIn 상태가 바뀔 때마다 (로그인/로그아웃 시) 다시 데이터를 가져올 수 있습니다.


    const scrollToContent = () => {
        scroller.scrollTo('content-section', {
            duration: 800,
            delay: 0,
            smooth: 'easeInOutQuart',
            offset: -49
        });
    };

    const handleLoginClick = () => {
        setShowLoginConfirmModal(false);
        navigate("/login");
    }

    const handleProfileModalConfirm = () => {
        setShowProfileModal(false);
        navigate("/user/manage");
    };

    const handleProfileModalClose = () => {
        setShowProfileModal(false);
    };

    // ==================================================================================
    // UI 렌더링 (Rendering)
    // - 위에서 정의한 state(feeds, quests, posts 등)를 사용하여 화면을 그립니다.
    // - 각 팀원은 자신의 데이터가 어떤 UI 컴포넌트와 연결되는지 확인할 수 있습니다.
    // ==================================================================================
    
    // 로딩 중일 때 보여줄 화면
    if (loading) return <div>로딩 중...</div>;
    // 에러 발생 시 보여줄 화면
    if (error) return <div>{error}</div>;

    return (
        <div className={styles.outerContainer}>
            
            <div className={styles.mainPoster}>
                <div className={styles.posterTitle}>JIGU BANGBANG</div>
                <div className={styles.posterSubtitle}>여행, 그 이상의 여정을 기록하다</div>
                <button className={styles.startButton} onClick={scrollToContent}>
                    START NOW
                </button>
            </div>

            <div id="content-section" className={styles.container}>
                {/* ==================== 인기 여행 피드 섹션 ==================== */}
                <div className={`${styles.section} ${styles.transparentBg}`}>
                    <h2>인기 여행 피드</h2>
                    <p className={styles.bodySecondary}>전 세계 여행자들의 아름다운 순간을 만나보세요.</p>
                    <div className={styles.marqueeContainer}>
                        <div className={styles.horizontalScrollContainer}>
                            {[...feeds, ...feeds].map((feed, index) => (
                                <div key={index} className={styles.scrollItem} onClick={() => {
                                    if (isLoggedIn) {
                                        navigate(`/feed/${feed.id}`);
                                    } else {
                                        setShowLoginConfirmModal(true);
                                    }
                                }}>
                                    <img src={feed.photoUrl} alt={`${feed.countryName} 이미지`} />
                                    <div className={styles.imageInfo}>
                                        <img src={feed.profileImage || defaultProfile} alt={`${feed.userId} 프로필`} className={styles.userAvatar} />
                                        <div className={styles.userInfo}>
                                            <p>{feed.cityName}, {feed.countryName}</p>
                                            <span>by {feed.nickname}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ==================== 새로운 퀘스트 섹션 ==================== */}
                <div className={styles.section}>
                    <h2>새로운 퀘스트에 도전해보세요!</h2>
                    <p className={styles.bodySecondary}>여행을 더욱 특별하게 만들어 줄 퀘스트를 완수하고 보상을 받으세요.</p>
                    <div className={styles.questGrid}>
                        {/* quests state의 데이터를 사용하여 UI를 렌더링합니다. */}
                        {quests.map((quest) => (
                            <div key={quest.id} className={styles.questCard}>
                                <h3>{quest.title}</h3>
                                <p>{quest.description}</p>
                                <button className={`${styles.btn} ${styles.btnSecondary}`}>도전하기 ({quest.reward})</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ==================== 커뮤니티 섹션 ==================== */}
                <div className={styles.section}>
                    <h2>여행자들의 이야기</h2>
                    <p className={styles.bodySecondary}>자유롭게 소통하고 정보를 공유하는 공간입니다.</p>
                    <div className={styles.communityContainer}>
                        <div>
                            <h4>최신 게시글</h4>
                            <ul className={styles.postList}>
                                {/* posts state의 데이터를 사용하여 UI를 렌더링합니다. */}
                                {posts.map((post) => (
                                    <li key={post.id} className={styles.postItem}>
                                        <h4>{post.title}</h4>
                                        <div className={styles.postMeta}>
                                            <span>{post.author}</span> | <span>{post.date}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4>인기 투표</h4>
                            <Vote />
                        </div>
                    </div>
                </div>

                {/* ==================== 마이페이지 섹션 ==================== */}
                {isLoggedIn && (
                    <div className={styles.section}>
                        <h2>나의 여행 요약</h2>
                        <p className={styles.bodySecondary}>나의 여행 기록과 활동을 한눈에 확인하세요.</p>
                        <div className={styles.myPageSummary}>
                            {/* summary state의 데이터를 사용하여 UI를 렌더링합니다. */}
                            <h3>{summary.nickname} 님, 환영합니다!</h3>
                            <div className={styles.myPageGrid}>
                                <div className={styles.summaryItem}>
                                    <span className={styles.count}>{summary.travelLogCount}</span>
                                    <span className={styles.label}>여행 기록</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.count}>{summary.completedQuestCount}</span>
                                    <span className={styles.label}>완료 퀘스트</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.count}>Lv.{summary.level}</span>
                                    <span className={styles.label}>나의 레벨</span>
                                </div>
                            </div>
                            <button className={`${styles.btn} ${styles.btnOutline}`} style={{marginTop: '20px'}}>마이페이지 바로가기</button>
                        </div>
                    </div>
                )}
            </div>
            {showLoginConfirmModal && (
                <LoginConfirmModal
                    isOpen={showLoginConfirmModal}
                    onClose={() => setShowLoginConfirmModal(false)}
                    onConfirm={handleLoginClick}
                />
            )}

            {showProfileModal && (
                <Modal
                    show={showProfileModal}
                    onClose={handleProfileModalClose}
                    onSubmit={handleProfileModalConfirm}
                    heading="추가 정보 입력"
                    firstLabel="확인"
                    secondLabel="나중에"
                >
                    원활한 서비스 이용을 위해 추가 정보를 입력해 주세요
                </Modal>
            )}
        </div>
    );
}
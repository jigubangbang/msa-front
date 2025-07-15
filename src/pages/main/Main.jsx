import React, { useState, useEffect } from "react"; // 데이터를 가져오기 위해 useEffect를 import합니다.
import { Link, useNavigate, useLocation } from "react-router-dom";
import { scroller } from 'react-scroll';
import styles from './Main.module.css';
import Vote from '../../components/community/Vote';
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import defaultProfile from "../../assets/default_profile.png";
import LoginConfirmModal from "../../components/common/LoginConfirmModal/LoginConfirmModal";
import Modal from "../../components/common/Modal/Modal";

const mockPopularFeeds = [
    { id: 1, user: '여행가', location: '스위스', avatar: '/1.jpg', image: '/1.jpg' },
    { id: 2, user: '탐험가', location: '이탈리아', avatar: '/2.jpg', image: '/2.jpg' },
    { id: 3, user: '방랑자', location: '프랑스', avatar: '/3.jpg', image: '/3.jpg' },
    { id: 4, user: '모험가', location: '스페인', avatar: '/4.jpg', image: '/4.jpg' },
];

export default function Main() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [showLoginConfirmModal, setShowLoginConfirmModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    const [feeds, setFeeds] = useState(mockPopularFeeds);
    const [quests, setQuests] = useState([]);
    const [posts, setPosts] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    };
    
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        const storedUserId = localStorage.getItem("userId");
        if (accessToken != null) {
            setIsLoggedIn(true);
            setUserId(storedUserId);
        }
    }, []);

    useEffect(() => {
        if (location.state?.showIncompleteProfileModal) {
            setShowProfileModal(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [questResponse, postResponse, rankingResponse, feedResponse] = await Promise.all([
                    api.get('/api/quests/list?sortOption=popular&limit=9'),
                    api.get('/api/com/board/list?sortOption=latest&limit=4'),
                    api.get('/api/quests/rankings?limit=5'),
                    api.get(`${API_ENDPOINTS.FEED.PUBLIC}/posts/top`),
                ]);
                const feedData = await feedResponse.data.posts;
                setFeeds(feedData);
                setQuests(questResponse.data.quests);
                setPosts(postResponse.data.posts);
                setRankings(rankingResponse.data.rankings);

                if (isLoggedIn && userId) {
                    const summaryResponse = await api.get(`/api/profile/${userId}`);
                    setSummary(summaryResponse.data);
                }

            } catch (err) {
                console.error("데이터 로딩 중 에러 발생:", err);
                setError("페이지를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();

    }, [isLoggedIn, userId]);


    const scrollToContent = () => {
        scroller.scrollTo('content-section', {
            duration: 800,
            delay: 0,
            smooth: 'easeInOutQuart',
            offset: -49
        });
    };

    const handlePostClick = (postId) => {
        navigate(`/board/${postId}`);
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
    
    if (loading) return <div>로딩 중...</div>;
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
                    <div className={styles.sectionHeader}>
                        <div>
                            <h2>새로운 퀘스트에 도전해보세요!</h2>
                            <p className={styles.bodySecondary}>여행을 더욱 특별하게 만들어 줄 퀘스트를 완수하고 보상을 받으세요.</p>
                        </div>
                        <Link to="/quest/list" className={`${styles.btn} ${styles.btnOutline}`}>전체 퀘스트 보기</Link>
                    </div>
                    <div className={styles.questGrid}>
                        {quests.map((quest) => (
                            <div key={quest.id} className={styles.questCard}>
                                <h3>
                                    <img src={quest.icon || '/icons/common/unknwon_badge.png'} alt="뱃지" className={styles.questBadgeIcon} />
                                    {quest.title}
                                </h3>
                                <div className={styles.questInfo}>
                                    <span>진행중: {quest.count_in_progress}</span>
                                    <span>완료: {quest.count_completed}</span>
                                </div>
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
                            <div className={styles.sectionHeader}>
                                <h4>최신 게시글</h4>
                                <Link to="/board/popular" className={`${styles.btn} ${styles.btnOutline}`}>전체 게시글 보기</Link>
                            </div>
                            <ul className={styles.postList}>
                                {posts.map((post) => (
                                    <li key={post.id} className={styles.postItem} onClick={() => handlePostClick(post.id)}>
                                        <h4>{post.title}</h4>
                                        <div className={styles.postMeta}>
                                            <span>{post.creatorNickname}</span> | <span>{formatDate(post.createdAt)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className={styles.sectionHeader}>
                                <h4>유저 랭킹</h4>
                                <Link to="/rank/list" className={`${styles.btn} ${styles.btnOutline}`}>랭킹 더보기</Link>
                            </div>
                            <ul className={styles.rankingList}>
                                {rankings.map(user => (
                                    <li key={user.rank} className={styles.rankingItem} onClick={() => navigate(`/profile/${user.userId}`)}>
                                        <span className={styles.rank}>{user.rank}</span>
                                        <img src={user.icon || user.profile_image || '/icons/common/user_profile.svg'} alt={user.nickname} className={styles.userAvatar} />
                                        <div className={styles.userInfo}>
                                            <span className={styles.userNickname}>{user.nickname}</span>
                                            <span className={styles.userLevel}>Lv. {user.level}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ==================== 마이페이지 섹션 ==================== */}
                {isLoggedIn && summary && (
                    <div className={styles.section}>
                        <h2>나의 여행 요약</h2>
                        <p className={styles.bodySecondary}>나의 여행 기록과 활동을 한눈에 확인하세요.</p>
                        <div className={styles.myPageSummary}>
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
                    원활한 서비스 이용을 위해 추가 정보를 입력해 주세요.
                </Modal>
            )}
        </div>
    );
}
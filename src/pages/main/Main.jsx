import SearchBar from '../../components/common/SearchBar';
import Header from '../../components/main/Header';
import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from 'react-dom';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { scroller } from 'react-scroll';
import styles from './Main.module.css';
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import defaultProfile from "../../assets/default_profile.png";
import LoginConfirmModal from "../../components/common/LoginConfirmModal/LoginConfirmModal";
import BadgeModal from "../../components/modal/BadgeModal/BadgeModal";
import QuestModal from "../../components/modal/QuestModal/QuestModal";
import Modal from "../../components/common/Modal/Modal";
import CirclesSpinner from "../../components/common/Spinner/CirclesSpinner";
import DotNav from "../../components/common/DotNav/DotNav";

const SECTIONS = [
    { id: 'feed-section', title: '인기 피드' },
    { id: 'badge-section', title: '뱃지 컬렉션' },
    { id: 'community-section', title: '여행자 이야기' },
];

export default function Main() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [showLoginConfirmModal, setShowLoginConfirmModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const [feeds, setFeeds] = useState([]);
    const [badges, setBadges] = useState([]);
    const [posts, setPosts] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState(null);

    // Modal states
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [showQuestModal, setShowQuestModal] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState(null);
    const scrollPosition = useRef(0);

    const getDifficultyText = (difficulty) => {
        switch(String(difficulty)) {
          case '1': return '초급';
          case '2': return '중급';
          case '3': return '고급';
          case '4': return '시즌';
          default: return '';
        }
    };

    const getDifficultyClass = (difficulty) => {
        switch(String(difficulty)) {
            case '1': return styles.difficultyEasy;
            case '2': return styles.difficultyNormal;
            case '3': return styles.difficultyHard;
            case '4': return styles.difficultySeasonal;
            default: return '';
        }
    };

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
        const body = document.body;
        if (showBadgeModal || showQuestModal || showLoginConfirmModal) {
            if (body.style.position !== 'fixed') {
                scrollPosition.current = window.pageYOffset;
                body.style.overflow = 'hidden';
                body.style.position = 'fixed';
                body.style.top = `-${scrollPosition.current}px`;
                body.style.width = '100%';
            }
        } else {
            if (body.style.position === 'fixed') {
                body.style.overflow = '';
                body.style.position = '';
                body.style.top = '';
                body.style.width = '';
                window.scrollTo(0, scrollPosition.current);
            }
        }
    }, [showBadgeModal, showQuestModal, showLoginConfirmModal]);


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
                const [
                    badgeResponse,
                    postResponse, 
                    rankingResponse, 
                    feedResponse
                ] = await Promise.all([
                    api.get('/api/quests/badges?type=popular&limit=30'),
                    api.get('/api/com/board/list?sortOption=latest&limit=20'),
                    api.get('/api/quests/rankings?limit=5'),
                    api.get(`${API_ENDPOINTS.FEED.PUBLIC}/posts/top`),
                ]);

                const feedData = await feedResponse.data.posts;
                setFeeds(feedData);

                const allBadges = badgeResponse.data.badges || [];
                
                const shuffledBadges = allBadges.sort(() => 0.5 - Math.random());
                const randomBadges = shuffledBadges.slice(0, 8);
                setBadges(randomBadges);

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

    
    const handleDotClick = (sectionId) => {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            // 최종 스크롤 위치를 80px 위로 조정합니다.
            const offset = -(window.innerHeight / 2) + (sectionElement.offsetHeight / 2) - 60;
            scroller.scrollTo(sectionId, {
                duration: 800,
                delay: 0,
                smooth: 'easeInOutQuart',
                offset: offset,
                ignoreCancelEvents: true
            });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 2;
            let currentSection = null;

            for (const section of SECTIONS) {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        currentSection = section.id;
                        break;
                    }
                }
            }
            setActiveSection(currentSection);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handlePostClick = (postId) => {
        navigate(`/board/${postId}`);
    };
    const handleLoginClick = () => {
        setShowLoginConfirmModal(false);
        navigate("/login");
    }

    // Modal Handlers
    const openBadgeModal = useCallback(async (badge_id) => {
        setLoading(true);
        try {
            const endpoint = `/api/quests/badges/${badge_id}`;
            const config = isLoggedIn ? { headers: { 'User-Id': userId } } : {};

            const response = await api.get(endpoint, config);
            setSelectedBadge(response.data);
            setShowBadgeModal(true);
        } catch (error) {
            console.error("Failed to fetch badge data:", error);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, userId]);

    const closeBadgeModal = () => {
        setShowBadgeModal(false);
        setSelectedBadge(null);
    };

    const openQuestModal = useCallback(async (quest_id) => {
        setLoading(true);
        try {
            const endpoint = `/api/quests/detail/${quest_id}`;
            const config = isLoggedIn ? { headers: { 'User-Id': userId } } : {};
            const response = await api.get(endpoint, config);
            setSelectedQuest(response.data);
            setShowQuestModal(true);
        } catch (error) {
            console.error("Failed to fetch quest data:", error);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, userId]);

    const closeQuestModal = () => {
        setShowQuestModal(false);
        setSelectedQuest(null);
    };

    const handleQuestClickFromBadge = (quest_id) => {
        closeBadgeModal();
        openQuestModal(quest_id);
    };

    const handleBadgeClickFromQuest = (badge_id) => {
        closeQuestModal();
        openBadgeModal(badge_id);
    };

    const handleQuestUpdate = async (questId) => {
        openQuestModal(questId);
    };

    const handleProfileModalConfirm = () => {
        setShowProfileModal(false);
        navigate("/user/manage");
    };

    const handleProfileModalClose = () => {
        setShowProfileModal(false);
    };

    if (loading) return <CirclesSpinner/>;
    if (error) return <div>{error}</div>;

    return (
        <div className={styles.outerContainer}>
            <DotNav sections={SECTIONS} activeSection={activeSection} onDotClick={handleDotClick} />

            <div id="main-poster" className={styles.mainPoster}>
                <div className={styles.posterTitle}>JIGU BANGBANG</div>
                <div className={styles.posterSubtitle}>여행, 그 이상의 여정을 기록하다</div>
                <button className={styles.startButton} onClick={() => handleDotClick('feed-section')}>
                    START NOW
                </button>
            </div>

            <div id="content-section" className={styles.container}>
                <div id="feed-section" className={`${styles.section} ${styles.transparentBg}`}>
                    <h2 className={styles.centeredText}>인기 여행 피드</h2>
                    <p className={`${styles.bodySecondary} ${styles.centeredText}`}>전 세계 여행자들의 아름다운 순간을 만나보세요.</p>
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
                    <div className={styles.sectionFooter}>
                        <Link to="/feed" className={`${styles.btn} ${styles.btnOutline}`}>전체 피드 보기</Link>
                    </div>
                </div>

                <div className={styles.sectionDivider}></div>

                <div id="badge-section" className={styles.section}>
                    <h2 className={styles.centeredText}>뱃지 컬렉션</h2>
                    <p className={`${styles.bodySecondary} ${styles.centeredText}`}>다양한 뱃지를 모아 당신의 프로필을 꾸며보세요.</p>
                    <div className={styles.badgeGrid}>
                        {badges.map((badge) => (
                            <div key={badge.id} className={styles.badgeCard} onClick={() => openBadgeModal(badge.id)}>
                                <img src={badge.icon} alt={`${badge.kor_title} 뱃지`} className={styles.badgeIcon} />
                                <p className={`${styles.badgeDifficulty} ${getDifficultyClass(badge.difficulty)}`}>{getDifficultyText(badge.difficulty)}</p>
                                <h4 className={styles.badgeTitle}>{badge.kor_title}</h4>
                                <p className={styles.badgeAcquired}>
                                    {badge.acquired_count}명이 획득
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className={styles.sectionFooter}>
                        <Link to="/quest/badge" className={`${styles.btn} ${styles.btnOutline}`}>전체 뱃지 보기</Link>
                    </div>
                </div>

                <div className={styles.sectionDivider}></div>

                <div id="community-section" className={styles.section}>
                    <h2 className={styles.centeredText}>여행자들의 이야기</h2>
                    <p className={`${styles.bodySecondary} ${styles.centeredText}`}>자유롭게 소통하고 정보를 공유하는 공간입니다.</p>
                    <div className={styles.communityContainer}>
                        <div className={styles.communityColumn}>
                            <h4 className={styles.centeredText}>최신 게시글</h4>
                            <ul className={styles.postList}>
                                {posts.filter(post => post.blindStatus !== 'BLINDED').slice(0, 4).map((post) => (
                                    <li key={post.id} className={styles.postItem} onClick={() => handlePostClick(post.id)}>
                                        <h4>{post.title}</h4>
                                        <div className={styles.postMeta}>
                                            <span>{post.creatorNickname}</span> | <span>{formatDate(post.createdAt)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.sectionFooter}>
                                <Link to="/board/popular" className={`${styles.btn} ${styles.btnOutline}`}>전체 게시글 보기</Link>
                            </div>
                        </div>
                        <div className={styles.communityColumn}>
                            <h4 className={styles.centeredText}>유저 랭킹</h4>
                            <ul className={styles.rankingList}>
                                {rankings.map(user => (
                                    <li key={user.rank} className={styles.rankingItem} onClick={() => {
                                        if (isLoggedIn) {
                                            navigate(`/profile/${user.user_id}`);
                                        } else {
                                            setShowLoginConfirmModal(true);
                                        }
                                    }}>
                                        <span className={styles.rank}>{user.rank}</span>
                                        <img src={user.icon || user.profile_image || defaultProfile} alt={user.nickname} className={styles.userAvatar} />
                                        <div className={styles.userInfo}>
                                            <span className={styles.userNickname}>{user.nickname}</span>
                                            <span className={styles.userLevel}>Lv. {user.level}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.sectionFooter}>
                                <Link to="/rank/list" className={`${styles.btn} ${styles.btnOutline}`}>랭킹 더보기</Link>
                            </div>
                        </div>
                    </div>
                </div>

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
                            <button className={`${styles.btn} ${styles.btnOutline}`} style={{ marginTop: '20px' }} onClick={() => navigate('/user/manage')}>마이페이지 바로가기</button>
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

            {showBadgeModal && ReactDOM.createPortal(
                <BadgeModal
                    badgeData={selectedBadge}
                    onClose={closeBadgeModal}
                    onQuestClick={handleQuestClickFromBadge}
                    isLogin={isLoggedIn}
                />,
                document.body
            )}

            {showQuestModal && ReactDOM.createPortal(
                <QuestModal
                    currentUserId={userId}
                    questData={selectedQuest}
                    onClose={closeQuestModal}
                    onBadgeClick={handleBadgeClickFromQuest}
                    isLogin={isLoggedIn}
                    onQuestUpdate={handleQuestUpdate}
                />,
                document.body
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
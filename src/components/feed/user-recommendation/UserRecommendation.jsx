import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserRecommendation.module.css";
import api from "../../../apis/api";
import API_ENDPOINTS from "../../../utils/constants";
import refreshIcon from "../../../assets/feed/refresh_grey.svg";
import ProfileCard from "./ProfileCard";
import PremiumModal from "../../common/Modal/PremiumModal";

export default function UserRecommendation() {
    const navigate = useNavigate();
    const [membershipStatus, setMembershipStatus] = useState(false);
    const [travelStyleId, setTravelStyleId] = useState();

    const limit = 5;
    const [currentPage, setCurrentPage] = useState(0);
    const [recommendationList, setRecommendationList] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const fetchRecommendationList = async() => {
        if (!hasMore) return;
        setIsLoading(true);
        try {
            const offset = limit * currentPage;
            const response = await api.get(`${API_ENDPOINTS.FEED.PRIVATE}/recommended/users`, {
                params: { limit, offset }
            });
            setRecommendationList(response.data.users);
            setTravelStyleId(response.data.travelStyleId);
            if (response.data.users.length < limit) setHasMore(false);
        } catch(err) {
            console.error("Failed to fetch recommended users", err);
        }
        setIsLoading(false);
    }

    const handleRefreshBtnClick = () => {
        if (!membershipStatus) {
            setShowPremiumModal(true);
            return;
        }
        setCurrentPage(prev => prev + 1);
    }

    const handleTestClick = () => {
        navigate("/feed/travel-style-test");
    }

    useEffect(() => {
        fetchRecommendationList();
    }, [currentPage]);

    useEffect(() => {
        const fetchMembershipStatus = async() => {
            try {
                const response = await api.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/membership-status`);
                setMembershipStatus(response.data.status);
            } catch(err) {
                console.error("Failed to fetch membership status", err);
            }
        };
        fetchMembershipStatus();
    }, []);

    if (!travelStyleId) {
        return (
            <div className={`${styles.boxItem} ${styles.centeredBox}`}>
                <p className={styles.boxText}>친구 추천을 받으려면 먼저 나의 여행 스타일을 진단해보세요!</p>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleTestClick}>
                    나의 여행 스타일 찾기 →
                </button>
            </div>
        );
    }

    return (
        <>
            <div className={styles.recommendationWrapper}>
                <button
                    onClick={handleRefreshBtnClick}
                    disabled={!hasMore}
                    className={styles.refreshButton}
                >
                    <img src={refreshIcon} alt="새로 고침"/>
                </button>
                {isLoading ? (
                    <div className={styles.cardGrid}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <div key={idx} className={styles.skeletonCard}></div>
                        ))}
                    </div>
                ) : recommendationList.length > 0 && (
                    <div className={styles.cardGrid}>
                        {recommendationList.map(user => (
                            <ProfileCard key={user.userId} user={user} />
                        ))}
                    </div>
                )}
            </div>
            {showPremiumModal && (
                <PremiumModal
                    showPremiumModal={showPremiumModal}
                    setShowPremiumModal={setShowPremiumModal}
                />
            )}
        </>
    );
}
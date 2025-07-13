import { useEffect, useState } from "react";
import styles from "./UserRecommendation.module.css";
import api from "../../../apis/api";
import API_ENDPOINTS from "../../../utils/constants";
import refreshIcon from "../../../assets/feed/refresh_grey.svg";
import ProfileCard from "./ProfileCard";

export default function UserRecommendation() {
    const [membershipStatus, setMembershipStatus] = useState(false);

    const limit = 5;
    const [currentPage, setCurrentPage] = useState(0);
    const [recommendationList, setRecommendationList] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRecommendationList = async() => {
        if (!hasMore) return;
        setIsLoading(true);
        try {
            const offset = limit * currentPage;
            const response = await api.get(`${API_ENDPOINTS.FEED.PRIVATE}/recommended/users`, {
                params: { limit, offset }
            });
            setRecommendationList(response.data.users);
            if (response.data.users.length < limit) setHasMore(false);
        } catch(err) {
            console.error("Failed to fetch recommended users", err);
        }
        setIsLoading(false);
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
        }
        fetchMembershipStatus();
    }, [])

    return (
        <div className={styles.recommendationWrapper}>
            <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!hasMore || !membershipStatus}
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
    );
}
import { useEffect, useState } from "react";
import SearchBar from "../../components/common/SearchBar";
import FeedTemplate from "./FeedTemplate";
import styles from "./FeedUserRecommendation.module.css";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import defaultProfile from "../../assets/default_profile.png";
import premiumIcon from "../../assets/common/premium.svg";
import UserRecommendation from "../../components/feed/user-recommendation/UserRecommendation";
import { Link } from "react-router-dom";

export default function FeedUserRecommendation() {
    const [keyword, setKeyword] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const resultLimit = 10;
    const [showResult, setShowResult] = useState(false);

    const fetchSearchResult = async() => {
        try {
            const response = await api.get(`${API_ENDPOINTS.FEED.PRIVATE}/search/users`, {
                params: {
                    "keyword": keyword,
                    "limit": resultLimit
                }
            });
            setSearchResult(response.data.users);
        } catch (err) {
            console.error("Failed to fetch results", err);
        }
    }

    useEffect(() => {
        if (keyword.trim() !== '') {
            fetchSearchResult();
            setShowResult(true);
        } else {
            setShowResult(false);
        }
    }, [keyword]);

    return (
        <FeedTemplate>
            <div className={styles.wrapper}>
                <SearchBar
                    placeholder="회원 아이디/닉네임 입력..."
                    onSearchChange={setKeyword}
                    barWidth="500px"
                />
                {keyword && (
                    <p className={styles.searchMessage}>'{keyword}' 에 대한 검색 결과: {searchResult.length}개</p>
                )}
                {showResult && searchResult.length > 0 && (
                    <div className={styles.searchResult}>
                        {searchResult.map((user) => (
                            <div
                                key={user.userId}
                                className={styles.userCard}
                            >
                                <img
                                    src={user.profileImage || defaultProfile}
                                    alt="profile"
                                    className={styles.profileImage}
                                />
                                <div className={styles.userInfo}>
                                    <div className={styles.nicknameRow}>
                                        <Link to={`/profile/${user.userId}`}>{user.nickname}</Link>
                                        {user.premium && (
                                            <img className={styles.premiumIcon} src={premiumIcon}/>
                                        )}
                                    </div>
                                    <div className={styles.statsRow}>
                                        팔로워 {user.followerCount} · 팔로잉 {user.followingCount} · 방문국 {user.countryVisitCount}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <UserRecommendation/>
            </div>
        </FeedTemplate>
    );
}
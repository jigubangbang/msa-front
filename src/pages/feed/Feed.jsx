import { useEffect, useState } from "react";
import { findFlagUrlByIso3Code } from 'country-flags-svg';
import FeedFilter from "../../components/feed/feed-filter/FeedFilter";
import FeedTemplate from "./FeedTemplate";
import styles from "./Feed.module.css";
import API_ENDPOINTS from "../../utils/constants";
import CommonFeed from "../../components/feed/CommonFeed";
import api from "../../apis/api";
import { useNavigate } from "react-router-dom";
import LoginConfirmModal from "../../components/common/LoginConfirmModal/LoginConfirmModal";
import trendingIcon from "../../assets/feed/trending_grey.svg";

export default function Feed() {
    const [filter, setFilter] = useState();
    const [endpoint, setEndpoint] = useState(`${API_ENDPOINTS.FEED.PUBLIC}/posts`);
    
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginConfirmModal, setShowLoginConfirmModal] = useState(false);

    const [topCountries, setTopCountries] = useState([]);

    const handleFilterSubmit = () => {
        const params = new URLSearchParams();

        if (filter.countryId) params.append("countryId", filter.countryId);
        if (filter.cityId) params.append("cityId", filter.cityId);
        if (filter.startDate) params.append("startDate", filter.startDate.format("YYYY-MM-DD"));
        if (filter.endDate) params.append("endDate", filter.endDate.format("YYYY-MM-DD"));
        if (filter.sort) params.append("sort", filter.sort);
        console.log("filter country", filter.countryId);

        const url = `${API_ENDPOINTS.FEED.PUBLIC}/posts?${params.toString()}`;
        setEndpoint(url);
    }

    const handleResetClick = () => {
        setEndpoint(`${API_ENDPOINTS.FEED.PUBLIC}/posts`);
    }

    const handleLoginClick = () => {
        setShowLoginConfirmModal(false);
        navigate("/login");
    }

    const handleTestClick = () => {
        if (!isLoggedIn) {
            setShowLoginConfirmModal(true);
            return;
        };
        navigate("/feed/travel-style-test");
    }

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            setIsLoggedIn(true);
        }

        const fetchTopCountries = async() => {
            try {
                const response = await api.get(`${API_ENDPOINTS.FEED.PUBLIC}/countries/top`);
                setTopCountries(response.data.countries);
            } catch (err) {
                console.error("Failed to fetch top countries", err);
            }
        }
        fetchTopCountries();
    }, []);
    

    return (
        <>
            <FeedTemplate>
                <div className={styles.feedContainer}>
                    <div className={styles.boxWrapper}>
                        <div className={`${styles.boxItem} ${styles.centeredBox}`}>
                            <p className={styles.boxText}>당신만의 여행 스타일을 찾아보세요.</p>
                            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleTestClick}>
                                나의 여행 스타일 찾기 →
                            </button>
                        </div>
                        <div className={styles.boxItem}>
                            <div className={styles.titleRow}>
                                <p className={styles.boxText}>인기 여행지</p>
                                <img src={trendingIcon} className={styles.icon}/>
                            </div>
                            {topCountries?.length > 0 && (
                                <div className={styles.countryList}>
                                    {topCountries.map((country) => (
                                        <div key={country.id} className={styles.countryItem}>
                                            <img className={styles.flagIcon} src={findFlagUrlByIso3Code(country.id)} alt={country.name}/>
                                            {country.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.filterContainer}>
                        <FeedFilter onSubmit={handleFilterSubmit} setFilter={setFilter} onReset={handleResetClick}/>
                    </div>
                    <CommonFeed key={endpoint} endpoint={endpoint}/>
                </div>
            </FeedTemplate>
            {showLoginConfirmModal && (
                <LoginConfirmModal 
                    isOpen={showLoginConfirmModal}
                    onClose={() => setShowLoginConfirmModal(false)}
                    onConfirm={handleLoginClick}
                />
            )}
        </>
    );
}
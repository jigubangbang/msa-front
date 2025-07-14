import { Link, useSearchParams } from "react-router-dom";
import API_ENDPOINTS from "../../utils/constants";
import FeedTemplate from "./FeedTemplate";
import styles from "./FeedSearch.module.css";
import CommonFeed from "../../components/feed/CommonFeed";
import { useEffect, useRef, useState } from "react";
import SearchBar from "../../components/common/Searchbar";
import api from "../../apis/api";

export default function FeedSearch() {
    const [searchParams] = useSearchParams();
    const [tag, setTag] = useState(searchParams.get("tag"));
    const [trendingTags, setTrendingTags] = useState([]);
    const trendingTagLimit = 6;

    const [keyword, setKeyword] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [matchingTags, setMatchingTags] = useState([]);
    const searchResultLimit = 10;
    const wrapperRef = useRef(null);

    const fetchMatchingTags = async () => {
        try {
            const response = await api.get(`${API_ENDPOINTS.FEED.PUBLIC}/search`, {
                params: {
                    keyword,
                    "limit": searchResultLimit
                }
            });
            setMatchingTags(response.data.tags);
        } catch (err) {
            console.error("Failed to fetch matching tags", err);
        }
    }

    useEffect(() => {
        if (keyword.trim() !== '') {
            fetchMatchingTags();
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    }, [keyword]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchTrendingTags = async() => {
            try {
                const response = await api.get(`${API_ENDPOINTS.FEED.PUBLIC}/trending`, {
                    params: {"limit": trendingTagLimit}
                });
                setTrendingTags(response.data.tags);
            } catch (err) {
                console.error("Failed to fetch trending tags", err);
            }
        }
        fetchTrendingTags();
    }, []);

    useEffect(() => {
        const newTag = searchParams.get("tag");
        if (newTag != tag) {
            setTag(newTag);
        }
    }, [searchParams, tag])

    const endpoint = `${API_ENDPOINTS.FEED.PUBLIC}/trending/${encodeURIComponent(tag)}`
    return (
        <FeedTemplate>
            <div className={styles.searchContainer}>
                <div ref={wrapperRef} className={styles.wrapper}>
                    <SearchBar
                        placeholder="키워드 입력..."
                        onSearchChange={setKeyword}
                    />
                    {showDropdown && matchingTags.length > 0 && (
                        <div className={styles.tagList}>
                            {matchingTags.map((topic) => (
                                <div key={topic.id} className={styles.tagItem}>
                                    <Link
                                        to={`/feed/search?tag=${encodeURIComponent(topic.name)}`}
                                    >
                                        #{topic.name}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {trendingTags.length > 0 && (
                    <div className={styles.searchRecommendation}>
                        <span>추천 :</span>
                        {trendingTags.map((topic, index) => (
                            <span key={index} className={styles.topic}>
                                <Link
                                    to={`/feed/search?tag=${encodeURIComponent(topic.name)}`}
                                >
                                    #{topic.name}
                                </Link>
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.feedContainer}>
                <CommonFeed key={endpoint} endpoint={endpoint}/>
            </div>
        </FeedTemplate>
    );
}
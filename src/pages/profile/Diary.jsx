import { useParams } from "react-router-dom";
import ProfileTemplate from "../../components/profile/ProfileTemplate";
import styles from "./Diary.module.css";
import { useEffect, useRef, useState } from "react";
import MasonryFeed from "../../components/feed/MasonryFeed";
import CreateDiaryModal from "../../components/profile/diary/CreateDiaryModal";
import { jwtDecode } from "jwt-decode";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";

export default function Diary() {
    const [sessionUserId, setSessionUserId] = useState();
    const {userId} = useParams();
    const [showCreateDiaryModal, setShowCreateDiaryModal] = useState(false);
    const [posts, setPosts] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const pageSize = 8;
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loader = useRef(null);
    
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decoded = jwtDecode(token);
            setSessionUserId(decoded.sub);
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoading) {
                setCurrentPage((prev) => prev + 1);
            }
        }, { threshold: 0.1 });

        const currentLoader = loader.current;
        if (currentLoader) observer.observe(currentLoader);

        return () => {
            if (currentLoader) observer.unobserve(currentLoader);
        };
    }, [hasMore, isLoading]);

    useEffect(() => {
        const fetchPosts = async () => {
            if (isLoading || !hasMore) return;

            setIsLoading(true);
            const offset = currentPage * pageSize;

            try {
                const response = await api.get(`${API_ENDPOINTS.FEED.PRIVATE}/users/${userId}`, {
                    params: { pageSize, offset }
                });

                const newPosts = response.data.posts;

                setPosts((prev) => {
                    const existingIds = new Set(prev.map(post => post.id));
                    const filteredNewPosts = newPosts.filter(post => !existingIds.has(post.id));
                    return [...prev, ...filteredNewPosts];
                });

                if (newPosts.length < pageSize) {
                    setHasMore(false);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
            setIsLoading(false);
        };

        fetchPosts();
    }, [currentPage, userId]);


    useEffect(() => {
        setPosts([]);
        setCurrentPage(0);
        setHasMore(true);
    }, [userId]);

    return (
        <ProfileTemplate heading={`@${userId}`}>
            <div className={styles.mainWrapper}>
                <div className={styles.columnLeft}>
                    <MasonryFeed posts={posts}/>
                    {hasMore && <div ref={loader} style={{ height: "50px" }}></div>}
                </div>
                <div className={styles.columnRight}>
                    {sessionUserId === userId && (
                        <button
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={() => setShowCreateDiaryModal(true)}
                        >
                            +
                        </button>
                    )}
                    {showCreateDiaryModal && (
                        <CreateDiaryModal onClose={() => setShowCreateDiaryModal(false)}/>
                    )}
                </div>
            </div>
        </ProfileTemplate>
    );
}
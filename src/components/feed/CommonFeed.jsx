import { useEffect, useRef, useState } from "react";
import MasonryFeed from "./MasonryFeed";
import api from "../../apis/api";

export default function CommonFeed({endpoint}) {
    const [posts, setPosts] = useState([]);

    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const loader = useRef(null);

    useEffect(() => {
        const fetchPosts = async() => {
            if (isLoading || !hasMore) return;
            setIsLoading(true);
            const offset = currentPage * pageSize;

            try {
                const response = await api.get(endpoint, {
                    params: {pageSize, offset}
                });
                const newPosts = response.data.posts;

                setPosts((prev) => {
                    const existingIds = new Set(prev.map(post => post.id));
                    const filteredNewPosts = newPosts.filter(post => !existingIds.has(post.id));
                    return [...prev, ...filteredNewPosts];
                });

                if (newPosts.length < pageSize || currentPage > 10) {
                    setHasMore(false);
                }
            } catch (err) {
                console.error("Failed to fetch data", err); 
            }
            setIsLoading(false);
        }
        fetchPosts(); 
    }, [currentPage]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoading) {
                setCurrentPage((prev) => prev + 1);
            }
        }, {threshold: 0.1});

        const currentLoader = loader.current;
        if (currentLoader) observer.observe(currentLoader);

        return () => {
            if (currentLoader) observer.unobserve(currentLoader);
        }
    }, [hasMore, isLoading]);

    return (
        <div>
            <MasonryFeed posts={posts} numColumn={5}/>
            {hasMore && <div ref={loader} style={{ height: "50px" }}></div>}
        </div>
    );
}
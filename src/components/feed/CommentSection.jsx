import { useEffect, useRef, useState } from 'react';
import styles from './CommentSection.module.css';
import api from '../../apis/api';
import API_ENDPOINTS from '../../utils/constants';
import FeedComment from './FeedComment';
import moreIcon from '../../assets/feed/more_black.svg';

export default function CommentSection({feedId, newComment, setCommentCount}) {
    const limit = 4;
    const [currentPage, setCurrentPage] = useState(0);
    const [comments, setComments] = useState([]);
    const hasMore = useRef(true);

    const onCommentDelete = (id) => {
        setComments((prev) => prev.filter(c => c.id !== id));
    }

    useEffect(() => {
        const fetchComments = async() => {
            if (!hasMore.current) return;

            const offset = limit * currentPage;
            try {
                const response = await api.get(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/comments`, {
                    params: {limit, offset}
                });
                setComments((prev) => {
                    const existingIds = new Set(prev.map(c => c.id));
                    const newComments = response.data.comments.filter(c => !existingIds.has(c.id));
                    return [...prev, ...newComments];
                });

                if (response.data.comments.length < limit) {
                    hasMore.current = false;
                }
            } catch (err) {
                console.error("Failed to fetch comments", err);
            }
        }
        fetchComments();

    }, [currentPage]);

    useEffect(() => {
        setComments(prev => [newComment, ...prev]);
    }, [newComment])

    useEffect(() => {
        setComments([]);
        setCurrentPage(0);
        hasMore.current = true;
    }, [feedId]);


    return (
        <div className={styles.comments}>
            {comments.map((comment) => (
                <FeedComment key={comment.id} comment={comment} feedId={feedId} onCommentDelete={onCommentDelete} setCommentCount={setCommentCount}/>
            ))}
            {hasMore.current && (
                <div className={styles.loadMoreWrapper}>
                    <button
                        className={styles.iconButton}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        <img src={moreIcon} alt="답글 보기" className={styles.icon}/>
                    </button>
                </div>
            )}
        </div>
    );
}
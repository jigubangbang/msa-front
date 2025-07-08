import { useState } from 'react';
import styles from './FeedComment.module.css';
import api from '../../apis/api';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import API_ENDPOINTS from '../../utils/constants';
import defaultProfile from '../../assets/default_profile.png';
import heartFilledIcon from '../../assets/feed/heart_filled_small.svg';
import heartEmptyIcon from '../../assets/feed/heart_empty_small.svg';
import menuIcon from '../../assets/feed/menu_black.svg';
import { Link } from 'react-router-dom';
import Reply from './Reply';

export default function FeedComment({comment, feedId}) {
    const [hasLiked, setHasLiked] = useState(comment.likeStatus);
    const [likeCount, setLikeCount] = useState(comment.likeCount);

    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);

    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyText, setReplyText] = useState("");

    const [showMenu, setShowMenu] = useState(false);

    const handleLikeClick = async() => {
        try {
            if (!hasLiked) {
                await api.post(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/comments/${comment.id}/like`);
                setLikeCount((prev) => prev + 1);
            } else {
                await api.delete(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/comments/${comment.id}/like`);
                setLikeCount((prev) => prev - 1);
            }
            setHasLiked((prev) => !prev)
        } catch (err) {
            console.error("Failed to (un)like comment", err);
        }
    }

    const toggleReplies = async() => {
        if (comment.replyCount > 0 && replies.length === 0) {
            try {
                const response = await api.get(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/comments/${comment.id}/replies`);
                setReplies(response.data.comments || []);
            } catch (err) {
                console.error("Failed to fetch replies", err);
            }
        }
        setShowReplies((prev) => !prev);
    }

    const handleReplyButtonClick = () => {
        setShowReplyInput((prev) => !prev);
        setReplyText("");
    }

    const handleReplySubmit = async() => {
        if (replyText === "") return;
        try {
            setIsSubmitting(true);
            await api.post(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/comments`, {
                feedId: feedId,
                parentCommentId: comment.id,
                content: replyText
            });
            setIsSubmitting(false);
        } catch (err) {
            console.error("Failed to post reply", err);
        }
    }
    
    return (
        <div className={styles.commentWrapper}>
            <div className={styles.topRow}>
                <div className={styles.leftSection}>
                    <img src={comment.profileImage || defaultProfile} alt="프사" className={styles.profileImage} />
                    <div className={styles.commentBody}>
                        <Link to={`/profile/${comment.userId}`}>
                            <span className={styles.username}>{comment.nickname}</span>
                        </Link>
                        <span className={styles.content}>{comment.content}</span>
                    </div>
                </div>
                <button className={styles.iconButton} onClick={handleLikeClick}>
                    <img src={hasLiked ? heartFilledIcon : heartEmptyIcon} alt="좋아요" className={styles.icon} />
                </button>
            </div>

            <div className={styles.infoContainer}>
                <span className={styles.timestamp}>{formatRelativeTime(comment.createdAt)}</span>
                <span className={styles.likes}>좋아요 {likeCount}</span>
                <button 
                    className={styles.replyButton}
                    onClick={handleReplyButtonClick}
                >
                    답글 작성
                </button>
                <button
                    className={`${styles.iconButton} ${styles.menuButton}`}
                    onClick={() => setShowMenu(true)}
                >
                    <img src={menuIcon} alt="메뉴" className={styles.icon} />
                </button>
            </div>

            {showReplyInput && (
                <form onSubmit={handleReplySubmit} className={styles.replyForm}>
                    <input
                        type="text"
                        className={styles.replyInput}
                        placeholder="댓글 달기..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !replyText.trim()}
                        className={`${styles.btn} ${styles.btnSecondary}`}
                    >
                        게시
                    </button>
                </form>
            )}

            {comment.replyCount > 0 ? (
                <button onClick={toggleReplies} className={styles.viewReplies}>
                    {showReplies ? '답글 숨기기' : `답글 보기 (${comment.replyCount || replies.length})`}
                </button>
            ) : null}

            {showReplies && replies.map((reply) => (
                <div key={reply.id}>
                    <Reply key={reply.id} comment={reply} feedId={feedId}/>
                </div>
            ))}
        </div>
        
    );
}
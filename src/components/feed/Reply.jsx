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

export default function Reply({comment, feedId}) {
    const [hasLiked, setHasLiked] = useState(comment.likeStatus);
    const [likeCount, setLikeCount] = useState(comment.likeCount);

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

    return (
        <div className={styles.replyWrapper}>
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
                    className={`${styles.iconButton} ${styles.menuButton}`}
                    onClick={() => setShowMenu(true)}
                >
                    <img src={menuIcon} alt="메뉴" className={styles.icon} />
                </button>
            </div>
        </div>
        
    );
}
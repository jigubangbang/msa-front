import { useEffect, useState } from 'react';
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
import FeedMenu from './FeedMenu';
import { jwtDecode } from 'jwt-decode';
import ReportModal from '../common/Modal/ReportModal';
import Modal from '../common/Modal/Modal';

export default function FeedComment({comment, feedId, onCommentDelete, setCommentCount}) {
    const [hasLiked, setHasLiked] = useState(comment.likeStatus);
    const [likeCount, setLikeCount] = useState(comment.likeCount);
    const [sessionUserId, setSessionUserId] = useState();

    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [replyCount, setReplyCount] = useState(comment.replyCount);

    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyText, setReplyText] = useState("");

    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
        if (replyCount > 0 && replies.length === 0) {
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
            const response = await api.post(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/comments`, {
                feedId: feedId,
                parentCommentId: comment.id,
                content: replyText
            });
            setIsSubmitting(false);
            setShowReplyInput(false);
            setReplyText("");
            setReplies((prev) => [response.data.comment, ...prev]);
            setReplyCount(prev => prev + 1);
            setCommentCount(prev => prev + 1);
        } catch (err) {
            console.error("Failed to post reply", err);
        }
    }

    const handleReportSubmit = async(report) => {
        try {
            await api.post(`${API_ENDPOINTS.USER}/reports`, {
                "reporterId": sessionUserId,
                "targetUserId": comment.userId,
                "contentType": "COMMENT",
                "contentSubtype": "TRAVELFEED",
                "contentId": comment.id,
                "reasonCode": report.reasonCode,
                "reasonText": report.reasonText
            })
        } catch (err) {
            console.error("Failed to report", err);
        }
        setShowReportModal(false);
    }

    const handleDeleteSubmit = async() => {
        try {
            await api.delete(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/comments/${comment.id}`);
            setShowDeleteModal(false);
            onCommentDelete(comment.id);
            setCommentCount(prev => prev - (replyCount + 1));
        } catch(err) {
            console.error("Failed to delete comment", err);
        }
    }

    const onReplyDelete = (id) => {
        setReplies((prev) => prev.filter(c => c.id !== id));
        setReplyCount(prev => prev - 1);
        setCommentCount(prev => prev - 1);
    }

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decoded = jwtDecode(token);
            setSessionUserId(decoded.sub);
        }
    }, [])
    
    return (
        <div className={styles.commentWrapper}>
            <div className={styles.topRow}>
                <div className={styles.leftSection}>
                    <img src={comment.profileImage || defaultProfile} alt="프사" className={styles.profileImage} />
                    <div className={styles.commentBody}>
                        <Link to={`/profile/${comment.userId}`}>
                            <span className={styles.username}>{comment.nickname}</span>
                        </Link>
                        {comment.blindStatus == "VISIBLE" ? (
                            <span className={styles.content}>{comment.content}</span>
                        ) : (
                            <span className={styles.blindedContent}>숨겨진 댓글입니다.</span>
                        )}
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
                <div style={{ position: "relative" }}>
                    <button
                        className={`${styles.iconButton} ${styles.menuButton}`}
                        onClick={() => setShowMenu((prev) => !prev)}
                    >
                        <img src={menuIcon} alt="메뉴" className={styles.icon} />
                    </button>
                    {showMenu && (
                        <FeedMenu
                            sessionUserId={sessionUserId}
                            userId={comment.userId}
                            onClose={() => setShowMenu(false)}
                            type="comment"
                            setShowReportModal={setShowReportModal}
                            setShowDeleteModal={setShowDeleteModal}
                        />
                    )}
                </div>
            </div>

            {showReplyInput && (
                <div className={styles.replyForm}>
                    <input
                        type="text"
                        className={styles.replyInput}
                        placeholder="댓글 달기..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <button 
                        onClick={handleReplySubmit} 
                        disabled={isSubmitting || !replyText.trim()}
                        className={`${styles.btn} ${styles.btnSecondary}`}
                    >
                        게시
                    </button>
                </div>
            )}

            {replyCount > 0 ? (
                <button onClick={toggleReplies} className={styles.viewReplies}>
                    {showReplies ? '답글 숨기기' : `답글 보기 (${replyCount || replies.length})`}
                </button>
            ) : null}

            {showReplies && replies.map((reply) => (
                <div key={reply.id}>
                    <Reply 
                        key={reply.id}
                        comment={reply}
                        feedId={feedId}
                        sessionUserId={sessionUserId}
                        onReplyDelete={() => onReplyDelete(reply.id)}
                    />
                </div>
            ))}
            {showReportModal && (
                <ReportModal
                    show={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    onSubmit={handleReportSubmit}
                />
            )}
            {showDeleteModal && (
                <Modal
                    show={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onSubmit={handleDeleteSubmit}
                    firstLabel="삭제"
                    secondLabel="취소"
                >
                    댓글을 삭제하시겠습니까?
                </Modal>
            )}
        </div>
        
    );
}
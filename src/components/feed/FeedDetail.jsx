import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./FeedDetail.module.css";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import defaultProfile from "../../assets/default_profile.png";
import heartEmptyIcon from "../../assets/feed/heart_empty.svg";
import heartFilledIcon from "../../assets/feed/heart_filled.svg"
import commentIcon from "../../assets/feed/comment_grey.svg";
import bookmarkEmptyIcon from "../../assets/feed/bookmark_empty.svg";
import bookmarkFilledIcon from "../../assets/feed/bookmark_filled.svg";
import menuIcon from "../../assets/feed/menu_black.svg";
import prevIcon from "../../assets/feed/prev_black.svg";
import nextIcon from "../../assets/feed/next_black.svg";
import CommentSection from "./CommentSection";
import { jwtDecode } from "jwt-decode";
import FeedMenu from "./FeedMenu";
import ReportModal from "../common/Modal/ReportModal";
import Modal from "../common/Modal/Modal";



export default function FeedDetail() {
    const {feedId} = useParams();
    const [sessionUserId, setSessionUserId] = useState();

    const navigate = useNavigate();

    const [data, setData] = useState();
    const [title, setTitle] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [publicStatus, setPublicStatus] = useState(true);
    const [hasLiked, setHasLiked] = useState(false);
    const [hasBookmarked, setHasBookmarked] = useState(false);

    const [likeCount, setLikeCount] = useState();
    const [commentCount, setCommentCount] = useState();
    const [newComment, setNewComment] = useState();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyText, setReplyText] = useState("");

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    const handleLikeClick = async() => {
        try {
            if (!hasLiked) {
                await api.post(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/like`);
                setLikeCount(likeCount + 1);
            } else {
                await api.delete(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/like`);
                setLikeCount(likeCount - 1);
            }
            setHasLiked(!hasLiked);
        } catch (err) {
            console.error("Failed to (un)like post", err);
        }
    }

    const handleBookmarkClick = async() => {
        try {
            if (!hasBookmarked) {
                await api.post(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/bookmark`);
            } else {
                await api.delete(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/bookmark`);
            }
            setHasBookmarked(!hasBookmarked);
        } catch (err) {
            console.error("Failed to (un)bookmark post", err);
        }
    }

    const handleReplySubmit = async() => {
        if (!replyText.trim()) return;
        
        try {
            setIsSubmitting(true);
            const response = await api.post(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/comments`, {
                feedId: feedId,
                content: replyText.trim()
            });
            setReplyText("");
            setIsSubmitting(false);
            setCommentCount(prev => prev + 1);
            setNewComment(response.data.comment);
        } catch (err) {
            console.error("Failed to post reply", err);
        }
    }

    const handleReportSubmit = async (report) => {
        try {
            await api.post(`${API_ENDPOINTS.USER}/reports`, {
                "reporterId": sessionUserId,
                "targetUserId": data.userId,
                "contentType": "POST",
                "contentSubtype": "TRAVELFEED",
                "contentId": feedId,
                "reasonCode": report.reasonCode,
                "reasonText": report.reasonText
            })
            
        } catch (err) {
            console.error("Failed to report", err);
        }
        setShowReportModal(false);
    }

    const handleDeletePostSubmit = async() => {
        try {
            await api.delete(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}`);
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Failed to delete post", err)
        }
    }

    const handleEditPostSubmit = async() => {
        try {
            await api.put(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}`, {
                "id": feedId,
                "title": title
            });
            setNewTitle(title);
            setShowEditModal(false);
        } catch (err) {
            console.error("Failed to edit post", err);
        }
    }

    const handleUpdatePrivacySubmit = async() => {
        try {
            await api.put(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}/public?status=${publicStatus}`);
            setShowPrivacyModal(false);
        } catch (err) {
            console.error("Failed to update privacy settings", err);
        }
    }

    useEffect(() => {
        const fetchData = async() => {
            try {
                const response = await api.get(`${API_ENDPOINTS.FEED.PRIVATE}/${feedId}`);
                setData(response.data.post);
                setTitle(response.data.post.title);
                setNewTitle(response.data.post.title);
                setPublicStatus(response.data.post.publicStatus);
                setHasLiked(response.data.post.likeStatus);
                setHasBookmarked(response.data.post.bookmarkStatus);
                setLikeCount(response.data.post.likeCount);
                setCommentCount(response.data.post.commentCount);
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        }
        fetchData();
    }, [feedId])

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decoded = jwtDecode(token);
            setSessionUserId(decoded.sub);
        }
    }, []);

    return (
        <>
            {data && (
                <div className={styles.overlay} onClick={() => navigate(-1)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.imageSection}>
                            {(data && data.images.length > 0) && (
                                <div className={styles.imageCarousel}>
                                    <img
                                        src={data.images[currentImageIndex].photoUrl}
                                        className={styles.postImage}
                                    />
                                    {data.images.length > 1 && (
                                        <>  
                                            {currentImageIndex > 0 && (
                                                <button 
                                                    onClick={() => setCurrentImageIndex((prev) => prev - 1)}
                                                    className={`${styles.navButton} ${styles.prevButton}`}
                                                >
                                                        <img src={prevIcon} alt="이전"/>
                                                </button>
                                            )}
                                            {currentImageIndex < data.images.length - 1 && (
                                                <button onClick={() => setCurrentImageIndex((prev) => prev + 1)} className={`${styles.navButton} ${styles.nextButton}`}>
                                                    <img src={nextIcon} alt="다음"/>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.detailsSection}>
                            <div className={styles.header}>
                                <div>
                                    <div className={styles.location}>
                                        {data.cityName}, {data.countryName}
                                    </div>
                                    <div className={styles.date}>{data.formattedStartDate} - {data.formattedEndDate}</div>
                                </div>
                                <div style={{ position: "relative" }}>
                                    <button
                                        className={styles.iconButton}
                                        onClick={() => setShowMenu((prev) => !prev)}
                                    >
                                        <img src={menuIcon} alt="메뉴" />
                                    </button>
                                    {showMenu && (
                                        <FeedMenu
                                            sessionUserId={sessionUserId}
                                            userId={data.userId}
                                            onClose={() => setShowMenu(false)}
                                            setShowReportModal={setShowReportModal}
                                            setShowEditModal={setShowEditModal}
                                            setShowDeleteModal={setShowDeleteModal}
                                            setShowPrivacyModal={setShowPrivacyModal}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.captionContainer}>
                                <img
                                    src={
                                        (data.profileImage && data.profileImage !== '') ? data.profileImage : defaultProfile
                                    } 
                                    alt="profile" 
                                    className={styles.profileImage}
                                />
                                <div className={styles.caption}>
                                    <Link to={`/profile/${data.userId}`}>
                                        <span className={styles.username}>{data.nickname}</span>
                                    </Link>
                                    {newTitle}
                                </div>
                            </div>
                            <div className={styles.comments}>
                                <CommentSection feedId={feedId} newComment={newComment}/>
                            </div>
                            <div className={styles.footer}>
                                <div className={styles.actionsLeft}>
                                    <div className={styles.actionItem}>
                                        <button onClick={handleLikeClick} className={styles.iconButton}>
                                        <img src={hasLiked ? heartFilledIcon : heartEmptyIcon} className={styles.icon} alt="좋아요"/>
                                        </button>
                                        <span className={styles.count}>{likeCount}</span>
                                    </div>

                                    <div className={styles.actionItem}>
                                        <img src={commentIcon} className={styles.icon} alt="댓글" />
                                        <span className={styles.count}>{commentCount}</span>
                                    </div>
                                </div>
                                <div className={styles.actionsRight}>
                                    <button onClick={handleBookmarkClick} className={styles.iconButton}>
                                        <img src={hasBookmarked ? bookmarkFilledIcon : bookmarkEmptyIcon} className={styles.icon} alt="북마크" />
                                    </button>
                                </div>
                            </div>
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
                                >
                                    게시
                                </button>
                            </div>
                        </div>
                    </div>
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
                            onSubmit={handleDeletePostSubmit}
                            firstLabel="삭제"
                            secondLabel="취소"
                        >
                            게시물을 삭제하겠습니까?
                        </Modal>
                    )}
                    {showEditModal && (
                        <Modal
                            show={showEditModal}
                            onClose={() => setShowEditModal(false)}
                            onSubmit={handleEditPostSubmit}
                            firstLabel="저장"
                            secondLabel="취소"
                            heading="내용 수정"
                        >
                            <div className={styles.formGroup}>
                                <div className={styles.inputWrapper}>
                                    <textarea
                                        className={styles.formInput}
                                        value={title}
                                        maxLength={120}
                                        rows={6}
                                        placeholder="내용을 입력하세요"
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Modal>
                    )}
                    {showPrivacyModal && (
                        <Modal
                            show={showPrivacyModal}
                            onClose={() => setShowPrivacyModal(false)}
                            onSubmit={handleUpdatePrivacySubmit}
                            heading="공개 설정"
                            firstLabel="저장"
                            secondLabel="취소"
                        >
                            <div className={styles.formGroup}>
                                <div className={styles.inputWrapper}>
                                    <select
                                        value={publicStatus}
                                        onChange={(e) => setPublicStatus(e.target.value)}
                                        className={styles.formInput}
                                    >
                                        <option value={true}>공개</option>
                                        <option value={false}>비공개</option>
                                    </select>
                                </div>
                            </div>
                        </Modal>
                    )}
                </div>
            )}
        </>
    );
}
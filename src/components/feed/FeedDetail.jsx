import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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



export default function FeedDetail({post, onClose}) {
    const [data, setData] = useState();
    const [hasLiked, setHasLiked] = useState(false);
    const [hasBookmarked, setHasBookmarked] = useState(false);

    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [commentCount, setCommentCount] = useState(post.commentCount);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyText, setReplyText] = useState("");

    // TODO: add delete / report post option
    // TODO: menu: edit privacy option
    // TODO: edit content option
    const [showMenu, setShowMenu] = useState(false);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handlePrev = () => {
        if (!data) return;
        setCurrentImageIndex((prev) => prev - 1);
    };

    const handleNext = () => {
        if (!data) return;
        setCurrentImageIndex((prev) => prev + 1);
    };

    const handleLikeClick = async() => {
        try {
            if (!hasLiked) {
                await api.post(`${API_ENDPOINTS.FEED.PRIVATE}/${post.id}/like`);
                setLikeCount(likeCount + 1);
            } else {
                await api.delete(`${API_ENDPOINTS.FEED.PRIVATE}/${post.id}/like`);
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
                await api.post(`${API_ENDPOINTS.FEED.PRIVATE}/${post.id}/bookmark`);
            } else {
                await api.delete(`${API_ENDPOINTS.FEED.PRIVATE}/${post.id}/bookmark`);
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
            await api.post(`${API_ENDPOINTS.FEED.PRIVATE}/${post.id}/comments`, {
                feedId: post.id,
                content: replyText.trim()
            });
            setReplyText("");
            setIsSubmitting(false);
            setCommentCount(prev => prev + 1);
        } catch (err) {
            console.error("Failed to post reply", err);
        }
    }

    useEffect(() => {
        const fetchData = async() => {
            try {
                const response = await api.get(`${API_ENDPOINTS.FEED.PRIVATE}/${post.id}`);
                setData(response.data.post);
                setHasLiked(response.data.post.likeStatus);
                setHasBookmarked(response.data.post.bookmarkStatus);
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        }
        fetchData();
    }, [post])
    return (
        <>
            {data && (
                <div className={styles.overlay} onClick={onClose}>
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
                                        {post.cityName}, {post.countryName}
                                    </div>
                                    <div className={styles.date}>{data.formattedStartDate} - {data.formattedEndDate}</div>
                                </div>
                                <button className={styles.iconButton} onClick={() => setShowMenu(true)}>
                                    <img src={menuIcon} alt="메뉴"/>
                                </button>
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
                                    {data.title}
                                </div>
                            </div>
                            <div className={styles.comments}>
                                <CommentSection feedId={post.id}/>
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
                </div>
            )}
        </>
    );
}
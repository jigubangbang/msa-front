import Masonry from "react-masonry-css";
import styles from "./MasonryFeed.module.css";
import commentIcon from "../../assets/feed/comment_white.svg";
import likeIcon from "../../assets/feed/like_white.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginConfirmModal from "../common/LoginConfirmModal/LoginConfirmModal";

export default function MasonryFeed({posts, numColumn=4}) {
    const breakpointColumnsObj = {
        default: numColumn,
        1100: 3,
        700: 2,
        500: 1
    };

    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginConfirmModal, setShowLoginConfirmModal] = useState(false);

    const openPostModal = (postId) => {
        if (!isLoggedIn) {
            setShowLoginConfirmModal(true);
            return;
        }
        navigate(`/feed/${postId}`, { state: { backgroundLocation: location } });
    };

    const handleLoginClick = () => {
        setShowLoginConfirmModal(false);
        navigate("/login");
    }

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <>
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className={styles.masonryGrid}
            columnClassName={styles.masonryColumn}
        >
            {posts.map((post) => (
                <div key={post.id} className={styles.postCard}  onClick={() => openPostModal(post.id)}>
                    <img src={post.photoUrl} className={styles.postImage}/>
                    <div className={styles.overlay}>
                        <div className={styles.stats}>
                            <span>
                                <img src={likeIcon} className={styles.icon}/>{post.likeCount}
                            </span>
                            <span>
                                <img src={commentIcon} className={styles.icon}/>{post.commentCount}
                            </span>
                        </div>
                    </div>
                    <div className={styles.postContent}>
                        <p>{post.cityName}, {post.countryName}</p>
                    </div>
                </div>
            ))}
        </Masonry>
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
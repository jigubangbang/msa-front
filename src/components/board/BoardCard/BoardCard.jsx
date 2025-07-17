import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './BoardCard.module.css';
import LoginConfirmModal from '../../common/LoginConfirmModal/LoginConfirmModal';

const BoardCard = ({ category, isLogin, currentUserId }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState({});

   const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPopularPosts();
  }, [category]);

  useEffect(() => {
    if (isLogin && posts.length > 0) {
      fetchBookmarkStatus();
    }
  }, [isLogin, posts]);

  const fetchPopularPosts = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 6,
        sortOption: 'popular' // 인기순 정렬
      };

      // category 배열을 문자열로 변환
      if (category && category.length > 0) {
        params.category = category.join(',');
      }

      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/board/list`, { params });
      const filteredPosts = (response.data.posts || [])
        .filter(post => post.blindStatus !== 'BLINDED')
        .slice(0, 3);
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Failed to fetch popular posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };


  const fetchBookmarkStatus = async () => {
    if (!posts.length) return;

    try {
      const bookmarkPromises = posts.map(post =>
        api.get(`${API_ENDPOINTS.COMMUNITY.USER}/board/bookmark/${post.id}/status`, {
          headers: { 'User-Id': currentUserId }
        })
      );

      const bookmarkResponses = await Promise.all(bookmarkPromises);
      const bookmarkStatus = {};
      
      posts.forEach((post, index) => {
        bookmarkStatus[post.id] = bookmarkResponses[index].data.isBookmarked || false;
      });

      setBookmarks(bookmarkStatus);
    } catch (error) {
      console.error('Failed to fetch bookmark status:', error);
    }
  };

  const handleBookmarkToggle = async (postId, e) => {
    e.stopPropagation();
    if (!isLogin) {
      setIsModalOpen(true);
      return;
    }

    try {
      const isCurrentlyBookmarked = bookmarks[postId];
      
      if (isCurrentlyBookmarked) {
        await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/board/bookmark/${postId}`, {
          headers: { 'User-Id': currentUserId }
        });
      } else {
        await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/board/bookmark/${postId}`, {}, {
          headers: { 'User-Id': currentUserId }
        });
      }

      setBookmarks(prev => ({
        ...prev,
        [postId]: !isCurrentlyBookmarked
      }));
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);

      console.log('북마크 처리 중 오류가 발생했습니다.');
    }
  };

  const handleCardClick = (postId) => {
    if (!isLogin) {
      setIsModalOpen(true);
      return;
    }
    navigate(`/board/${postId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  };


    const handleLoginConfirm = () => {
    setIsModalOpen(false);
    navigate('/login');
  };


  if (loading) {
    return (
      <div className={styles.cardContainer}>
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.card}>
            <div className={styles.loading}>로딩 중...</div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={styles.cardContainer}>
        <div className={styles.emptyState}>
          <p>표시할 게시글이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cardContainer}>
      {posts.map((post) => (
        <div
          key={post.id}
          className={styles.card}
          onClick={() => handleCardClick(post.id)}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${post.thumbnail || "/icons/common/board_image.jpg"})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* 북마크 버튼 */}
            <button
              className={styles.bookmarkButton}
              onClick={(e) => handleBookmarkToggle(post.id, e)}
            >
              <img
                src={bookmarks[post.id] ? '/icons/common/bookmark_added.svg' : '/icons/common/bookmark.svg'}
                alt="bookmark"
                className={styles.bookmarkIcon}
              />
            </button>

          {/* 게시글 정보 */}
          <div className={styles.postInfo}>
            <h3 className={styles.postTitle}>{post.title}</h3>
            <div className={styles.postMeta}>
              <span className={styles.author}>{`${post.creatorNickname}(${post.userId})`}</span>
              <span className={styles.separator}>|</span>
              <span className={styles.date}>{formatDate(post.createdAt)}</span>
              <span className={styles.separator}>|</span>
              <span className={styles.comments}>{post.commentCount || 0}개의 댓글</span>
            </div>
          </div>
        </div>
      ))}

      <LoginConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLoginConfirm}
      />
    </div>
  );
};

export default BoardCard;
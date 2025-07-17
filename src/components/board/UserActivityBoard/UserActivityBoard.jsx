import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './UserActivityBoard.module.css';

const UserActivityBoard = ({ isLogin, currentUserId }) => {
  const navigate = useNavigate();
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLogin && currentUserId) {
      fetchUserActivityPosts();
    }
  }, [isLogin, currentUserId]);

  const fetchUserActivityPosts = async () => {
    setLoading(true);
    try {

      const bookmarkResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/board/bookmarks`, {
        headers: { 'User-Id': currentUserId }
      });

      const likeResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/board/likes`, {
        headers: { 'User-Id': currentUserId }
      });

      const bookmarkedPostIds = bookmarkResponse.data.bookmarkedPostIds || [];
      const likedPostIds = likeResponse.data.likedPostIds || [];


      // 각 게시글의 상세 정보 가져오기
      if (bookmarkedPostIds.length > 0) {
        const bookmarkedPostsData = await fetchPostDetails(bookmarkedPostIds.slice(0, 5));
        setBookmarkedPosts(bookmarkedPostsData);
      }

      if (likedPostIds.length > 0) {
        const likedPostsData = await fetchPostDetails(likedPostIds.slice(0, 5));
        setLikedPosts(likedPostsData);
      }

    } catch (error) {
      console.error('Failed to fetch user activity posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetails = async (postIds) => {
    try {
      const promises = postIds.map(postId =>
        api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/board/${postId}/info`)
      );
      const responses = await Promise.all(promises);
      
      return responses
        .map(response => {
          if (response.data && response.data.success) {
            return response.data.data;
          }
          return null;
        })
        .filter(data => data);
    } catch (error) {
      console.error('Failed to fetch post details:', error);
      return [];
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/board/${postId}`);
  };

  const handleBookmarkToggle = async (postId, e) => {
    e.stopPropagation();
    
    try {
      await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/board/bookmark/${postId}`, {
        headers: { 'User-Id': currentUserId }
      });

      // 북마크 목록에서 제거
      setBookmarkedPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      alert('북마크 해제 중 오류가 발생했습니다.');
    }
  };

  const handleLikeToggle = async (postId, e) => {
    e.stopPropagation();

    try {
      await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/board/like/${postId}`, {
        headers: { 'User-Id': currentUserId }
      });

      setLikedPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Failed to remove like:', error);
      alert('좋아요 해제 중 오류가 발생했습니다.');
    }
  };

  const handleMoreClick = () => {
      navigate('/board/my');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return '-';
    }
  };
  

  const renderPostList = (posts, type, onToggle) => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>{type === 'bookmark' ? '북마크한 게시글이 없습니다.' : '좋아요한 게시글이 없습니다.'}</p>
        </div>
      );
    }

    return (
      <div className={styles.postList}>
        {posts.map((post, index) => (
          <div 
            key={post.id} 
            className={styles.postItem}
            onClick={() => handlePostClick(post.id)}
          >
            <div className={styles.postNumber}>{index + 1}.</div>
            <div className={styles.postContent}>
              <div className={styles.postTitle}>
                {post.title}
                {post.blindStatus === 'BLINDED' && (
                  <span className={styles.blindedBadge}>블라인드 처리됨</span>
                )}
              </div>
              <div className={styles.postMeta}>
                <span className={styles.author}>{`${post.creatorNickname} (${post.userId})`}</span>
                <span className={styles.separator}>|</span>
                <span className={styles.date}>{formatDate(post.createdAt)}</span>
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <img src="/icons/common/comment.svg" alt="댓글" className={styles.icon} />
                    <span>{post.commentCount || 0}</span>
                  </div>
                  <span className={styles.separator}>|</span>
                  <div className={styles.statItem}>
                    <img src="/icons/common/view.svg" alt="조회수" className={styles.icon} />
                    <span>{post.viewCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              className={styles.actionButton}
              onClick={(e) => onToggle(post.id, e)}
            >
              <img
                src={type === 'bookmark' ? '/icons/common/bookmark_added.svg' : '/icons/common/heart_fill.svg'}
                alt={type === 'bookmark' ? '북마크 해제' : '좋아요 해제'}
                className={styles.actionIcon}
              />
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (!isLogin) {
    return (
      <div className={styles.container}>
        <div className={styles.loginRequired}>
          <p>로그인 후 이용 가능한 서비스입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 내가 북마크한 글 */}
      <div className={styles.boardSection}>
        <div className={styles.boardHeader}>
          <h3 className={styles.boardTitle}>내가 북마크한 글</h3>
          <button 
            className={styles.moreButton}
            onClick={handleMoreClick}
          >
            더보기
          </button>
        </div>
        {renderPostList(bookmarkedPosts, 'bookmark', handleBookmarkToggle)}
      </div>

      {/* 내가 좋아요한 글 */}
      <div className={styles.boardSection}>
        <div className={styles.boardHeader}>
          <h3 className={styles.boardTitle}>내가 좋아요한 글</h3>
          <button 
            className={styles.moreButton}
            onClick={handleMoreClick}
          >
            더보기
          </button>
        </div>
        {renderPostList(likedPosts, 'like', handleLikeToggle)}
      </div>
    </div>
  );
};

export default UserActivityBoard;
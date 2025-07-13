import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './BoardMainList.module.css';

const BoardMainList = (isLogin) => {
  const navigate = useNavigate();
  const [boardData, setBoardData] = useState({});
  const [loading, setLoading] = useState(false);

  const boardCategories = [
    { value: 1, label: '정보', navigate: 'info' },
    { value: 2, label: '추천', navigate: 'recommend' },
    { value: 3, label: '잡담', navigate: 'chat' }
  ];

  useEffect(() => {
    fetchBoardPosts();
  }, []);

  const fetchBoardPosts = async () => {
    setLoading(true);
    try {
      const promises = boardCategories.map(category =>
        api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/board/list`, {
          params: {
            category: category.value,
            limit: 5,
            sortOption: 'popular'
          }
        })
      );

      const responses = await Promise.all(promises);
      const newBoardData = {};

      boardCategories.forEach((category, index) => {
        newBoardData[category.value] = {
          ...category,
          posts: responses[index].data.posts || []
        };
      });

      setBoardData(newBoardData);
    } catch (error) {
      console.error('Failed to fetch board posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (postId) => {
    if (!isLogin) {
      alert('로그인이 필요한 서비스 입니다');
      return;
    }
    navigate(`/board/${postId}`);
  };

  const handleCategoryClick = (path) => {
    navigate(`/board/${path}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  };

  if (loading) {
    return (
      <div className={styles.container}>
        {boardCategories.map(category => (
          <div key={category.value} className={styles.boardSection}>
            <div className={styles.boardHeader}>
              <h3 className={styles.boardTitle}>{category.label} 게시판</h3>
            </div>
            <div className={styles.loadingContainer}>
              <div className={styles.loading}>로딩 중...</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {boardCategories.map(category => {
        const categoryData = boardData[category.value];
        if (!categoryData) return null;

        return (
          <div key={category.value} className={styles.boardSection}>
            <div className={styles.boardHeader}>
              <h3 
                className={styles.boardTitle}
                onClick={() => handleCategoryClick(category.navigate)}
              >
                {category.label} 게시판
              </h3>
            </div>

            <div className={styles.postList}>
              {categoryData.posts.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>표시할 게시글이 없습니다.</p>
                </div>
              ) : (
                categoryData.posts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className={styles.postItem}
                    onClick={() => handlePostClick(post.id)}
                  >
                    <div className={styles.postNumber}>{index + 1}.</div>
                    <div className={styles.postContent}>
                      <div className={styles.postTitle}>{post.title}</div>
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
                            <img src="/icons/common/heart_fill.svg" alt="좋아요" className={styles.icon} />
                            <span>{post.likeCount || 0}</span>
                          </div>
                          <span className={styles.separator}>|</span>
                          <div className={styles.statItem}>
                            <img src="/icons/common/bookmark_added.svg" alt="북마크" className={styles.icon} />
                            <span>{post.bookmarkCount || 0}</span>
                          </div>
                          <span className={styles.separator}>|</span>
                          <div className={styles.statItem}>
                            <img src="/icons/common/view.svg" alt="조회수" className={styles.icon} />
                            <span>{post.viewCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoardMainList;
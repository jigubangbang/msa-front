import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import Pagination from '../../common/Pagination/Pagination';
import Dropdown from '../../common/Dropdown';
import styles from './BoardTravelStyleList.module.css';

const BoardTravelStyleList = ({ category, isLogin, currentUserId }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [userTravelStyle, setUserTravelStyle] = useState(null);
  const [sortOption, setSortOption] = useState('latest');

  const itemsPerPage = 10;

  // 필터 옵션 정의
    const getFilterOptions = () => {
    const baseOptions = [{ value: 'all', label: '모든 글' }];
    baseOptions.push(
        { value: 'same', label: '나와 같은 스타일' },
        { value: 'similar', label: '나와 비슷한 스타일' }
    );
    
    return baseOptions;
    };

  // 정렬 옵션
  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' },
    { value: 'views', label: '조회순' },
    { value: 'likes', label: '좋아요순' },
    { value: 'bookmarks', label: '북마크순' }
  ];

  // 여행 스타일 궁합 매핑
  const travelStyleCompatibility = {
    'A': ['F', 'G'],
    'B': ['I', 'D'],
    'C': ['J', 'H'],
    'D': ['B', 'H'],
    'E': ['H', 'I'],
    'F': ['A', 'I'],
    'G': ['A', 'J'],
    'H': ['B', 'E'],
    'I': ['B', 'H'],
    'J': ['A', 'C']
  };

  useEffect(() => {
    if (isLogin && currentUserId) {
      fetchUserTravelStyle();
    }
  }, [isLogin, currentUserId]);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedFilter, sortOption, category, userTravelStyle]);

  const fetchUserTravelStyle = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/style`, {
        headers: { 'User-Id': currentUserId }
      });
      setUserTravelStyle(response.data.travelStyle);
    } catch (error) {
      console.error('Failed to fetch user travel style:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {
        pageNum: currentPage,
        limit: itemsPerPage,
        sortOption: sortOption
      };

      // 카테고리 파라미터 추가
      if (category) {
        params.category = category;
      }

      // 필터에 따른 여행스타일 파라미터 추가
      if (selectedFilter === 'same' && userTravelStyle) {
        params.travelStyleId = userTravelStyle;
      } else if (selectedFilter === 'similar' && userTravelStyle) {
        const similarStyles = travelStyleCompatibility[userTravelStyle] || [];
        if (similarStyles.length > 0) {
          params.travelStyleId = similarStyles.join(',');
        }
      }

      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/board/list`, { 
        params,
        paramsSerializer: (params) => {
          return Object.keys(params)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');
        }
      });
      
      setPosts(response.data.posts || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

const handleFilterClick = (filterValue) => {
  if (filterValue === 'same' || filterValue === 'similar') {
    if (!isLogin) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    
    if (!userTravelStyle) {
      alert('스타일 검사가 필요합니다.');
      return;
    }
  }
  
  setSelectedFilter(filterValue);
  setCurrentPage(1);
};

  const handleSortChange = (option) => {
    setSortOption(option.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handlePostClick = (postId) => {
    navigate(`/board/${postId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '-';
    }
  };

  const getTravelStyleLabel = (styleId) => {
    const styleLabels = {
      'A': '열정트래블러',
      'B': '느긋한여행가',
      'C': '디테일플래너',
      'D': '슬로우로컬러',
      'E': '감성기록가',
      'F': '혼행마스터',
      'G': '맛집헌터',
      'H': '문화수집가',
      'I': '자연힐링러',
      'J': '실속낭만러'
    };
    return styleLabels[styleId] || styleId;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 필터 버튼들 */}
      <div className={styles.filters}>
      <div className={styles.filterSection}>
        {getFilterOptions().map((option) => (
          <button
            key={option.value}
            className={`${styles.filterButton} ${
              selectedFilter === option.value ? styles.active : ''
            }`}
            onClick={() => handleFilterClick(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 정렬 드롭다운 */}
      <div className={styles.sortSection}>
        <Dropdown
          defaultOption="정렬"
          options={sortOptions}
          onSelect={handleSortChange}
        />
      </div>
</div>
      {/* 게시글 리스트 */}
      <div className={styles.postList}>
        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>표시할 게시글이 없습니다.</p>
          </div>
        ) : (
          posts.map((post, index) => {
            const postNumber = (currentPage - 1) * itemsPerPage + index + 1;
            const isBlinded = post.blindStatus === 'BLINDED';
            
            return (
              <div
                key={post.id}
                className={styles.postItem}
                onClick={() => handlePostClick(post.id)}
              >
                <div className={styles.postNumber}>{postNumber}.</div>
                <div className={styles.postContent}>
                    <div className={styles.postTitle}>
                        {isBlinded ? '블라인드된 게시글입니다' : post.title}
                    </div>
                        <div className={styles.postMeta}>
                          
                            {(!isBlinded && post.creatorTravelStyle) && (
                            <span className={styles.travelStyle}>
                                [{getTravelStyleLabel(post.creatorTravelStyle)}]
                            </span>
                            )}

                            <span className={styles.author}>
                            {isBlinded ? ' - ' : post.creatorNickname} ({isBlinded ? ' - ' : post.userId})
                            </span>
                            <span className={styles.separator}>|</span>
                            <span className={styles.date}>{isBlinded ? ' 0000-00-00 ' : formatDate(post.createdAt)}</span>
                            <span className={styles.separator}>|</span>
                            
                            
                            <div className={styles.stats}>
                              <div className={styles.statItem}>
                                  <img src="/icons/common/comment.svg" alt="댓글" className={styles.icon} />
                                  <span>{isBlinded ? ' - ' : post.commentCount || 0}</span>
                              </div>
                              <span className={styles.separator}>|</span>
                              <div className={styles.statItem}>
                                  <img src="/icons/common/heart_fill.svg" alt="좋아요" className={styles.icon} />
                                  <span>{isBlinded ? ' - ' : post.likeCount || 0}</span>
                              </div>
                              <span className={styles.separator}>|</span>
                              <div className={styles.statItem}>
                                  <img src="/icons/common/view.svg" alt="조회수" className={styles.icon} />
                                  <span>{isBlinded ? ' - ' : post.viewCount || 0}</span>
                              </div>
                            </div>
                        </div>
                    
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          pageBlock={5}
          pageCount={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default BoardTravelStyleList;
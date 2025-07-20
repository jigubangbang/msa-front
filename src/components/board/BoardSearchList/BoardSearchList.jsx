import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import Pagination from '../../common/Pagination/Pagination';
import Dropdown from '../../common/Dropdown';
import styles from './BoardSearchList.module.css';
import LoginConfirmModal from '../../common/LoginConfirmModal/LoginConfirmModal';

const BoardSearchList = ({ searchKeyword, isLogin }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('latest');

   const [isModalOpen, setIsModalOpen] = useState(false);


  const itemsPerPage = 10;

  // 카테고리 옵션 정의
  const categoryOptions = [
    { value: 'all', label: '모든 글' },
    { value: '1', label: '정보' },
    { value: '2', label: '추천' },
    { value: '3', label: '잡담' },
    { value: '4', label: '질문' }
  ];

  // 정렬 옵션
  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' },
    { value: 'views', label: '조회순' },
    { value: 'likes', label: '좋아요순' },
    { value: 'bookmarks', label: '북마크순' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedCategory, sortOption, searchKeyword]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {
        pageNum: currentPage,
        limit: itemsPerPage,
        sortOption: sortOption
      };

      // 검색어가 있을 때만 search 파라미터 추가
      if (searchKeyword && searchKeyword.trim()) {
        params.search = searchKeyword;
      }

      // 카테고리 파라미터 추가
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
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
      setTotalCount(response.data.totalPosts || 0);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

   const handleLoginConfirm = () => {
    setIsModalOpen(false);
    navigate('/login');
  };

  const handleCategoryClick = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setCurrentPage(1);
  };

  const handleSortChange = (option) => {
    setSortOption(option.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNum) => {
    window.scroll(0,0);
    setCurrentPage(pageNum);
  };

  const handlePostClick = (postId) => {
    if(!isLogin){
        setIsModalOpen(true);
        setIsModalOpen(true);
        return;
    }
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

  const getCurrentSortLabel = () => {
  const currentOption = sortOptions.find(option => option.value === sortOption);
  return currentOption ? currentOption.label : '정렬';
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
      {/* 검색 결과 헤더 */}
      <div className={styles.searchHeader}>
        <h2 className={styles.searchTitle}>
          {searchKeyword && searchKeyword.trim() 
            ? `"${searchKeyword}" 의 검색 결과 : ${totalCount}개의 게시글이 검색되었습니다`
            : `전체 ${totalCount}개의 게시글이 있습니다`
          }
        </h2>
      </div>

      {/* 카테고리 필터 및 정렬 */}
      <div className={styles.filters}>
        <div className={styles.filterSection}>
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.filterButton} ${
                selectedCategory === option.value ? styles.active : ''
              }`}
              onClick={() => handleCategoryClick(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 정렬 드롭다운 */}
        <div className={styles.sortSection}>
          <Dropdown
            defaultOption={getCurrentSortLabel()}  
            options={sortOptions}
            onSelect={handleSortChange}
          />
        </div>
      </div>

      {/* 게시글 리스트 */}
      <div className={styles.postList}>
        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{searchKeyword && searchKeyword.trim() ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}</p>
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

      <LoginConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLoginConfirm}
      />

    </div>
  );
};

export default BoardSearchList;
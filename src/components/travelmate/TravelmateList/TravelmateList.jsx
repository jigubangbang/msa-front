import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './TravelmateList.module.css';
import Pagination from '../../common/Pagination/Pagination';
import Dropdown from '../../common/Dropdown';
import api from '../../../apis/api';

const TravelmateList = ({
  onOpenPost,
  searchTerm,
  currentPage,
  setCurrentPage,
  filters,
  setFilters,
  isLogin,
  searchSectionData,
  currentUserId
}) => {
  const [travelmates, setTravelmates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [showCompleted, setShowCompleted]=useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const sortOptions = [
    { value: 'default', label: '기본순' },
    { value: 'latest', label: '최신등록순' },
    { value: 'period', label: '기간빠른순' },
    { value: 'likes', label: '좋아요순' }
  ];

  const formatDateRange = (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const formatDate = (date) => {
        const year = String(date.getFullYear()).slice(-2);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}년 ${month}월 ${day}일`;
      };
      
      if (start.toDateString() === end.toDateString()) {
        return formatDate(start);
      }
      
      return (
        <div>
          <div>{formatDate(start)}</div>
          <div>~{formatDate(end)}</div>
        </div>
      );
    } catch (error) {
      return `${startDate}-${endDate}`;
    }
  };

const formatSearchConditions = (searchSectionData) => {
  if (!searchSectionData) return null;
  
  const conditions = [];
  
  if (searchSectionData.locations && searchSectionData.locations.length > 0) {
    if (searchSectionData.locations[0] === 'ALL') {
      conditions.push('전체 지역');
    } else {
      const locationNames = searchSectionData.locations.map(location => {
        if (location.city && location.city.name) {
          return `${location.country.name} ${location.city.name}`;
        }
        return location.country ? location.country.name : location;
      });
      conditions.push(`위치: ${locationNames.join(', ')}`);
    }
  }
  
  if (searchSectionData.dates) {
    const { startDate, endDate } = searchSectionData.dates;
    if (startDate && endDate) {
      const formatDate = (dateObj) => {
        if (typeof dateObj === 'string') return dateObj;
        if (dateObj.dateString) return dateObj.dateString;
        if (dateObj.year) return `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`;
        return dateObj;
      };
      
      conditions.push(`기간: ${formatDate(startDate)} ~ ${formatDate(endDate)}`);
    }
  }
  
  return conditions;
};

  const handleSortChange = (option) => {
    handleFilterChange('sortOption', option.value);
  };

  const handleStatusChange = (e) => {
    const value = e.target.checked ? true : false;
        setShowCompleted(value);
    };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      if (filterType === 'sortOption' || filterType==='statusOption') {
        return {
          ...prev,
          [filterType]: value
        };
      }

      // 배열 필터의 경우
      const currentValues = prev[filterType] || [];
      let newValues;
      
      if (currentValues.includes(value)) {
        // 이미 선택된 값이면 제거
        newValues = currentValues.filter(v => v !== value);
      } else {
        // 새로운 값이면 추가
        newValues = [...currentValues, value];
      }
      
      return {
        ...prev,
        [filterType]: newValues
      };
    });
    setCurrentPage(1);
  };

  const handleLikeToggle = async (postId) => {
    if (!isLogin) return;
    
    try {
      const isLiked = likedPosts.has(postId);
      
      if (isLiked) {
        await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/like/${postId}`,
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/like/${postId}`, {},
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
        setLikedPosts(prev => new Set(prev).add(postId));
      }
      
      // Update like count in travelmates list
      setTravelmates(prev => prev.map(mate => 
        mate.id === postId 
          ? { ...mate, like_count: mate.like_count + (isLiked ? -1 : 1) }
          : mate
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };


  useEffect(() => {
    fetchTravelmates();
    console.log(searchSectionData);
  }, [currentPage, filters, searchTerm, showCompleted, searchSectionData]);

  useEffect(() => {
    if (isLogin) {
      fetchLikedPosts();
    }
  }, [isLogin]);

  const fetchLikedPosts = async () => {
    if (!isLogin) return;
    
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/likes`,
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
      setLikedPosts(new Set(response.data.likedPostIds));
    } catch (error) {
      console.error('Failed to fetch liked posts:', error);
    }
  };

  const fetchTravelmates = async () => {
   setLoading(true);
    try {
        let params = {
        pageNum: currentPage,
        ...(filters.sortOption && { sortOption: filters.sortOption }),
        showCompleted: showCompleted,
        ...(searchTerm && { search: searchTerm })
        };

        if (searchSectionData) {

        if (searchSectionData.locations && searchSectionData.locations.length > 0) {
            if (searchSectionData.locations[0] === 'ALL') {
            } else {
            params.locations = searchSectionData.locations.map(location => 
                location.id || location.value || location
            ).join(',');
            }
        }

        if (searchSectionData.dates) {
        if (searchSectionData.dates.startDate) {
          if (typeof searchSectionData.dates.startDate === 'string') {
            params.startDate = searchSectionData.dates.startDate;
          } else if (searchSectionData.dates.startDate.dateString) {
            params.startDate = searchSectionData.dates.startDate.dateString;
          }
        }
        
        if (searchSectionData.dates.endDate) {
          if (typeof searchSectionData.dates.endDate === 'string') {
            params.endDate = searchSectionData.dates.endDate;
          } else if (searchSectionData.dates.endDate.dateString) {
            params.endDate = searchSectionData.dates.endDate.dateString;
          }
        }
      }

        } else {

        if (filters.locations?.length > 0) {
            params.locations = filters.locations.map(target => 
            target.id || target.value || target
            ).join(',');
        }
        
        if (filters.targets?.length > 0) {
            params.targets = filters.targets.map(target => 
            target.id || target.value || target
            ).join(',');
        }
        
        if (filters.themes?.length > 0) {
            params.themes = filters.themes.map(theme => 
            theme.id || theme.value || theme
            ).join(',');
        }

        if (filters.continent?.length > 0) {
            params.continent = filters.continent.join(',');
        }
        
        if (filters.styles?.length > 0) {
            params.styles = filters.styles.map(style => 
            style.id || style.value || style
            ).join(',');
        }
        }

        console.log('최종 API 요청 파라미터:', params);

        const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/list`, {
        params: params
        });

      setTravelmates(response.data.travelmates || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch travelmates", err);
      setTravelmates([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };


  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handleTravelmateRowClick = (travelmate) => {
    if (travelmate.blindStatus === "BLINDED"){
        alert("블라인드된 게시글입니다");
        return;
    }
    if (onOpenPost && travelmate.id) {
      onOpenPost(travelmate.id);
    }
  };

  if (loading) {
    return (
      <div className={styles.travelmateList}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.travelmateList}>
      <h2 className={styles.travelmateListTitle}>여행메이트 모집</h2>
      
      {/* Search Section */}
      <div className={styles.searchSection}>
        <p className={styles.totalCount}>
            현재 {totalCount}개의 여행메이트 모집글이 있습니다.
        </p>

        {/* 검색 조건 표시 - 여기에 추가 */}
      {searchSectionData && (
        <div className={styles.searchConditions}>
          <span className={styles.searchConditionsLabel}>검색 조건: </span>
          {formatSearchConditions(searchSectionData).map((condition, index) => (
            <span key={index} className={styles.searchCondition}>
              {condition}
              {index < formatSearchConditions(searchSectionData).length - 1 && ', '}
            </span>
          ))}
        </div>
      )}
      
        <div className={styles.controlsContainer}>
            <label className={styles.checkboxContainer}>
            <input
                type="checkbox"
                checked={showCompleted}
                onChange={handleStatusChange}
                className={styles.checkbox}
            />
            완료된 모임도 보기
            </label>
            <Dropdown
            defaultOption="정렬 기준"
            options={sortOptions}
            onSelect={handleSortChange}
            />
        </div>
        </div>

      {/* Table Header */}
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>썸네일</div>
        <div className={styles.headerCell}>모집자</div>
        <div className={styles.headerCell}>제목</div>
        <div className={styles.headerCell}>기간</div>
        <div className={styles.headerCell}>장소</div>
        <div className={styles.headerCell}>테마/스타일</div>
        <div className={styles.headerCell}>좋아요</div>
        <div className={styles.headerCell}>조회수</div>
      </div>

      {/* Table Body */}
      <div className={styles.tableBody}>
        {travelmates.map((travelmate, index) => {
            //#NeedToChange 기본 썸네일 이미지
          const uniqueKey = travelmate.id ? `travelmate-${travelmate.id}` : `travelmate-${currentPage}-${index}`;
          const isLiked = likedPosts.has(travelmate.id);
          const isBlind = travelmate.blindStatus === 'BLINDED';

          
          return (
            <div 
              key={uniqueKey} 
              className={styles.tableRow}
              onClick={() => handleTravelmateRowClick(travelmate)}
            >
              <div className={styles.cell}>
                <div className={styles.thumbnailImage}>
                  <img 
                    src={isBlind ? '/icons/common/warning.png' : (travelmate.thumbnailImage || '/images/default-thumbnail.jpg')} 
                    alt="썸네일" 
                  />
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.creatorInfo}>
                  <div className={styles.creatorNickname}>
                    {isBlind ? '' : travelmate.creatorNickname}
                  </div>
                  <div className={styles.creatorStyle}>{travelmate.creatorStyle}</div>
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.titleCell}>
                  <div className={styles.title}>
                    {isBlind ? '블라인드 처리된 게시글입니다' : travelmate.title}
                  </div>
                  <div className={styles.description}>{isBlind ? '' : travelmate.simpleDescription}</div>
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.periodCell}>
                  {isBlind ? '-' : formatDateRange(travelmate.startAt, travelmate.endAt)}
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.locationCell}>
                  {isBlind ? '-' : (travelmate.locationNames || '미정')}
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.tagsCell}>
                  {isBlind ? (
                    <div>-</div>
                  ) : (
                    <>
                      <div className={styles.themes}>{travelmate.themeNames || '-'}</div>
                      <div className={styles.styles}>{travelmate.styleNames || '-'}</div>
                      <div className={styles.targets}>{travelmate.targetNames || '-'}</div>
                    </>
                  )}
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.likeSection}>
                  {isBlind ? (
                    <span>-</span>
                  ) : (
                    <>
                      <button 
                        className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeToggle(travelmate.id);
                        }}
                        disabled={!isLogin}
                      >
                        {isLiked ? '❤️' : '🤍'}
                      </button>
                      <span className={styles.likeCount}>{travelmate.likeCount}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.viewCount}>{isBlind ? '-' : travelmate.viewCount}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
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

export default React.memo(TravelmateList);
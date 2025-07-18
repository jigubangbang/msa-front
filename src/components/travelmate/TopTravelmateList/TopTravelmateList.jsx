import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './TopTravelmateList.module.css';
import api from '../../../apis/api';
import heartFilledIcon from '../../../assets/feed/heart_filled.svg';
import heartEmptyIcon from '../../../assets/feed/heart_empty.svg';
import userIcon from '../../../../public/icons/sidebar/user.svg';

const TopTravelmateList = ({ 
  currentUserId,
  title, 
  option, // 'popular' 또는 'recent'
  isLogin = false,
  onViewAll,
  onPostClick 
}) => {
  const [travelmates, setTravelmates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    fetchTopTravelmates();
  }, [option]);

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

  const fetchTopTravelmates = async () => {
    setLoading(true);
    try {
      let params = {
        pageNum: 1,
        limit: 10 
      };

      if (option === 'popular') {
        params.sortOption = 'likes'; 
      } else if (option === 'recent') {
        params.sortOption = 'latest'; 
      }

      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/list`, {
        params: params
      });

      const filteredTravelmates = response.data.travelmates
     ?.filter(travelmate => travelmate.blindStatus === 'VISIBLE')
     ?.slice(0, 5) || [];
   
    setTravelmates(filteredTravelmates);
    } catch (err) {
      console.error("Failed to fetch top travelmates", err);
      setTravelmates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (postId, event) => {
    event.stopPropagation();
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
          ? { ...mate, likeCount: mate.likeCount + (isLiked ? -1 : 1) }
          : mate
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handlePostClick = (travelmate) => {
    if (onPostClick && travelmate.id) {
      onPostClick(travelmate.id);
    }
  };

  const handleViewAllClick = () => {
    if (onViewAll) {
      onViewAll();
    }
  };

  if (loading) {
    return (
      <div className={styles.topTravelmateList}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.topTravelmateList}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <button className={styles.viewAllButton} onClick={handleViewAllClick}>
          모든 모임 보러가기 →
        </button>
      </div>
      
      <div className={styles.cardContainer}>
        {travelmates.map((travelmate) => {
          const isLiked = likedPosts.has(travelmate.id);
          const isBlind = travelmate.blindStatus === 'BLINDED';
          
          return (
            <div 
              key={travelmate.id} 
              className={styles.card}
              onClick={() => handlePostClick(travelmate)}
            >
              <div className={styles.imageContainer}>
                <img 
                  src={isBlind ? '/icons/common/warning.png' : (travelmate.thumbnailImage || '/images/default-thumbnail.jpg')} 
                  alt="썸네일"
                  className={styles.thumbnail}
                />
              </div>
              
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>
                  {isBlind ? '블라인드 처리된 게시글입니다' : travelmate.title}
                </h4>
                <p className={styles.description}>
                  {isBlind ? '' : travelmate.simpleDescription}
                </p>
                
                <div className={styles.stats}>
                  <span className={styles.members}>
                    <img src={userIcon} alt="인원 수" className={`${styles.icon} ${styles.memberIcon}`}/>
                    {isBlind ? '-' : (travelmate.memberCount || 0)}
                  </span>
                  <span className={styles.likes}>
                    <button 
                      className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                      onClick={(e) => handleLikeToggle(travelmate.id, e)}
                      disabled={!isLogin || isBlind}
                    >
                      <img src={isLiked ? heartFilledIcon : heartEmptyIcon} alt="좋아요" className={styles.icon}/>
                    </button>
                    {isBlind ? '' : travelmate.likeCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopTravelmateList;
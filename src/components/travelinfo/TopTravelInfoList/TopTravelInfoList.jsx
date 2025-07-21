import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './TopTravelInfoList.module.css';
import JoinChatModal from '../../modal/JoinChatModal/JoinChatModal';
import { useChatContext } from '../../../utils/ChatContext';
import api from '../../../apis/api';
import ConfirmModal from '../../common/ErrorModal/ConfirmModal';
import LoginConfirmModal from '../../common/LoginConfirmModal/LoginConfirmModal';
import { useNavigate } from 'react-router-dom';
import CirclesSpinner from '../../common/Spinner/CirclesSpinner';

import heartFilledIcon from '../../../assets/feed/heart_filled.svg';
import heartEmptyIcon from '../../../assets/feed/heart_empty.svg';
import userIcon from '../../../../public/icons/sidebar/user.svg';
import chatIcon from '../../../assets/feed/comment_grey.svg';


const TopTravelInfoList = ({ 
  currentUserId,
  title, 
  option, // 'popular', 'recent', 'active'
  isLogin = false,
  onViewAll
}) => {
  const [travelinfos, setTravelinfos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [joinedChats, setJoinedChats] = useState(new Set());
  const [selectedInfo, setSelectedInfo] = useState(null);
  
  // 참여 모달 상태 (JoinChatModal)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  // 로그인 모달 상태 (LoginConfirmModal)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Alert 모달 상태 (ConfirmModal)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('alert');
  const [confirmAction, setConfirmAction] = useState(null);

  const navigate = useNavigate();
  
  // 채팅방 입장
  const { openChat, closeChat, chatRooms } = useChatContext();

  useEffect(() => {
    fetchTopTravelinfos();
  }, [option]);

  useEffect(() => {
    if (isLogin) {
      fetchLikedPosts();
      fetchJoinedChats();
    }
  }, [isLogin]);

  const showAlertModal = (message) => {
    setConfirmMessage(message);
    setConfirmType('alert');
    setConfirmAction(null);
    setShowConfirmModal(true);
  };

  const hideConfirm = () => {
    setShowConfirmModal(false);
    setConfirmMessage('');
    setConfirmAction(null);
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      confirmAction();
    }
    hideConfirm();
  };

  const fetchLikedPosts = async () => {
    if (!isLogin) return;
    
    try {
       const response = await api.get(
      `${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/likes`,
      {
        headers: {
          'User-Id': currentUserId,
        },
      }
    );
      setLikedPosts(new Set(response.data.likedTravelInfoIds));
    } catch (error) {
      console.error('Failed to fetch liked posts:', error);
    }
  };

  const fetchJoinedChats = async () => {
    if (!isLogin) return;
    
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/joined-chats`,
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
      setJoinedChats(new Set(response.data.joinedChatIds));
    } catch (error) {
      console.error('Failed to fetch joined chats:', error);
    }
  };

  const fetchTopTravelinfos = async () => {
    setLoading(true);
    try {
      let params = {
        pageNum: 1
      };

      // option에 따라 다른 파라미터 설정
      if (option === 'popular') {
        params.sortOption = 'likes'; // 좋아요 순 (인기 정보 공유방)
      } else if (option === 'recent') {
        params.sortOption = 'latest'; // 최신 순 (최근 등록 정보 공유방)
      } else if (option === 'active') {
        params.sortOption = 'chat'; // 채팅 수 순 (활발한 정보 공유방)
      }

      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelinfo/list`, {
        params: params
      });

      setTravelinfos(response.data.travelInfos?.slice(0, 5) || []);
    } catch (err) {
      console.error("Failed to fetch top travelinfos", err);
      setTravelinfos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (chatId, event) => {
    event.stopPropagation();
    if (!isLogin) return;
    
    try {
      const isLiked = likedPosts.has(chatId);
      
      if (isLiked) {
        await api.delete(
          `${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/like/${chatId}`,
          {
            headers: {
              'User-Id': currentUserId,
            },
          }
        );
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(chatId);
          return newSet;
        });
      } else {
        await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/like/${chatId}`, 
          {},
          {
            headers: {
              'User-Id': currentUserId,
            },
          }
        );
        setLikedPosts(prev => new Set(prev).add(chatId));
      }
      
      // Update like count in travelinfos list
      setTravelinfos(prev => prev.map(info => 
        info.id === chatId 
          ? { ...info, likeCount: info.likeCount + (isLiked ? -1 : 1) }
          : info
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleViewAllClick = () => {
    if (onViewAll) {
      onViewAll();
    }
  };

  // 로그인 모달 관련 함수들
  const handleLoginConfirm = () => {
    setIsLoginModalOpen(false);
    navigate('/login');
  };

  const handleLoginCancel = () => {
    setIsLoginModalOpen(false);
  };

  // 참여 모달 관련 함수들
  const handleJoinModalClose = () => {
    setIsJoinModalOpen(false);
    setSelectedInfo(null);
  };

  const handleJoinClick = (travelinfo, event) => {
    event.stopPropagation();
    
    if (!isLogin) {
      // 로그인 모달 열기
      setIsLoginModalOpen(true);
      return;
    }

    // 이미 참여 중인지 확인
    if (joinedChats.has(travelinfo.id)) {
      // 채팅하기 - 채팅방으로 이동
      handleChatClick(travelinfo.id);
    } else {
      // 참여하기 모달 열기
      setSelectedInfo(travelinfo);
      setIsJoinModalOpen(true);
    }
  };

  const handleChatClick = async (groupId) => {
    console.log('채팅방으로 이동:', groupId);
    try {
      const response = await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/chat`, {
        groupType: "TRAVELINFO",
        groupId: groupId
      });
      
      console.log('채팅방 조회/생성 성공:', response.data);
    if (response.data.success && response.data.chatRoomId) {
        openChat(response.data.chatRoomId, currentUserId, {
        });
      } else {
        showAlertModal('채팅방 정보를 가져오는데 실패했습니다.');
      }
      
    } catch (error) {
      console.error('Failed to get chat room:', error);
      showAlertModal('채팅방에 접속할 수 없습니다.');
    }
  };

  const handleJoinSubmit = async () => {
    if (!selectedInfo) return;

    console.log(currentUserId);

    try {
      await api.post(
      `${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/${selectedInfo.id}/join`,
      {},
      {
        headers: {
          'User-Id': currentUserId,
        },
      }
    );
      
      // 참여 성공 시 joinedChats에 추가
      setJoinedChats(prev => new Set(prev).add(selectedInfo.id));
      
      // 멤버 수 업데이트
      setTravelinfos(prev => prev.map(info => 
        info.id === selectedInfo.id 
          ? { ...info, memberCount: info.memberCount + 1 }
          : info
      ));

      showAlertModal('참여가 완료되었습니다!');
      setIsJoinModalOpen(false);
      setSelectedInfo(null);
    } catch (error) {
      console.error('Failed to join chat:', error);
      showAlertModal('참여에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className={styles.topTravelInfoList}>
        <CirclesSpinner/>
      </div>
    );
  }

  return (
    <div className={styles.topTravelInfoList}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <button className={styles.viewAllButton} onClick={handleViewAllClick}>
          모든 채팅방 보러가기 →
        </button>
      </div>
      
      <div className={styles.cardContainer}>
        {travelinfos.map((travelinfo) => {
          const isLiked = likedPosts.has(travelinfo.id);
          const isJoined = joinedChats.has(travelinfo.id);
          const isBlind = travelinfo.blindStatus === 'BLINDED';
          
          return (
            <div 
              key={travelinfo.id} 
              className={styles.card}
            >
              <div className={styles.imageContainer}>
                <img 
                  src={isBlind ? '/icons/common/warning.png' : (travelinfo.thumbnailImage || '/images/default-thumbnail.jpg')} 
                  alt="썸네일"
                  className={styles.thumbnail}
                />
              </div>
              
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>
                  {isBlind ? '블라인드 처리된 게시글입니다' : travelinfo.title}
                </h4>
                <p className={styles.description}>
                  {isBlind ? '' : travelinfo.simpleDescription}
                </p>
                
                <div className={styles.stats}>
                <div className={styles.statsRow}>
                  <span className={styles.members}>
                    <img src={userIcon} alt="인원 수" className={`${styles.icon} ${styles.memberIcon}`}/>
                    {isBlind ? '-' : (travelinfo.memberCount || 0)}
                  </span>
                  <span className={styles.likes}>
                    <button 
                      className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                      onClick={(e) => handleLikeToggle(travelinfo.id, e)}
                      disabled={!isLogin || isBlind}
                    >
                      <img src={isLiked ? heartFilledIcon : heartEmptyIcon} alt="좋아요" className={styles.icon}/>
                    </button>
                    {isBlind ? '-' : travelinfo.likeCount}
                  </span>
                  {option === 'active' && (
                    <span className={styles.chatCount}>
                      <img src={chatIcon} alt="채팅 수" className={`${styles.icon} ${styles.chatIcon}`}/>
                      {isBlind ? '-' : (travelinfo.chatCount || 0)}
                    </span>
                  )}
                </div>
                </div>
                {!isBlind && (
                  <button 
                    className={`${styles.joinButton} ${isJoined ? styles.chatButton : ''}`}
                    onClick={(e) => handleJoinClick(travelinfo, e)}
                  >
                    {isJoined ? '채팅하기' : '참여하기'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 참여 모달 (JoinChatModal) */}
      <JoinChatModal
        isOpen={isJoinModalOpen}
        onClose={handleJoinModalClose}
        onSubmit={handleJoinSubmit}
        chatTitle={selectedInfo?.title}
        message={selectedInfo?.enterDescription}
      />

      {/* 로그인 모달 (LoginConfirmModal) */}
      <LoginConfirmModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginCancel}
        onConfirm={handleLoginConfirm}
      />
      
      {/* Alert 모달 (ConfirmModal) */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={hideConfirm}
        onConfirm={confirmAction ? handleConfirmAction : null}
        message={confirmMessage}
        type={confirmType}
      />
    </div>
  );
};

export default TopTravelInfoList;
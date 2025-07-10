import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './TravelmateDetailMain.module.css';
import api from '../../../apis/api';
import JoinApplicationModal from '../../modal/JoinApplicationModal/JoinApplicationModal';
import DetailDropdown from '../../common/DetailDropdown/DetailDropdown';
import ReportModal from '../../common/Modal/ReportModal';

const TravelmateDetailMain = ({ postId, isLogin, currentUserId }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [memberStatus, setMemberStatus] = useState('NOT_MEMBER'); // NOT_MEMBER, PENDING, MEMBER ,creator
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

useEffect(() => {
  if (postId) {
    const loadData = async () => {
      await fetchTravelmateDetail();
      
      if (isLogin) {
        fetchLikeStatus();
      }
    };
    
    loadData();
  }
}, [postId, isLogin]);

useEffect(() => {
  if (isLogin && detail && memberStatus === 'NOT_MEMBER') {
    fetchMemberStatus();
  }
}, [detail, isLogin, memberStatus]);

  const fetchTravelmateDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/${postId}`);
      setDetail(response.data.travelmate);

      if (currentUserId == response.data.travelmate.creatorId){
        setMemberStatus('CREATOR')    
      }
    } catch (error) {
      console.error('Failed to fetch travelmate detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/likes`);
      setIsLiked(response.data.likedPostIds.includes(postId));
    } catch (error) {
      console.error('Failed to fetch like status:', error);
    }
  };

  const fetchMemberStatus = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/${postId}/member-status`);
      setMemberStatus(response.data.status);
    } catch (error) {
      console.error('Failed to fetch member status:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!isLogin) return;

    try {
      if (isLiked) {
        await api.delete(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/like/${postId}`);
        setIsLiked(false);
        setDetail(prev => ({ ...prev, likeCount: prev.likeCount - 1 }));
      } else {
        await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/like/${postId}`);
        setIsLiked(true);
        setDetail(prev => ({ ...prev, likeCount: prev.likeCount + 1 }));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleJoinRequest = async () => {
  if (!isLogin) return;
    
    setShowJoinModal(true);
  };

  const handleJoinSubmit = async (description) => {
    try {
      await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/travelmate/${postId}/join`, {
        description: description
      });
      setMemberStatus('PENDING');
      alert('참여 신청이 완료되었습니다.');
    } catch (error) {
      console.error('Failed to request join:', error);
      const errorMessage = error.response?.data?.error || '참여 신청에 실패했습니다.';
      alert(errorMessage);
      throw error; 
    }
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDate = (date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  };

  const getJoinButtonText = () => {
    switch (memberStatus) {
      case 'PENDING':
        return '모임 참여 신청 중';
      case 'MEMBER':
        return '참여 중인 모임';
      case 'CREATOR' :
        return '내 모임';
      default:
        return '모임 참여 신청하기';
    }
  };

  const handleEdit = () => {
    console.log('수정하기 클릭');
    // 수정 로직 구현
    //#NeedToChange
  };

  const handleDelete = () => {
    console.log('삭제하기 클릭');
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      // 삭제 API 호출
    }
  };

  const handleReport = () => {
    if (!isLogin) {
      alert('로그인이 필요합니다.');
      return;
    }
    setShowReportModal(true);
  };

  const handleReportSubmit = async (reportData) => {
    try {
      const payload = {
        reporterId: currentUserId,
        targetUserId: detail.creatorId,
        contentSubtype: 'TRAVELMATE',
        contentType:'GROUP',
        contentId: postId,
        reasonCode: reportData.reasonCode,
        reasonText: reportData.reasonText
      };

      await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/report`, payload);
      
      setShowReportModal(false);
      alert('신고가 접수되었습니다.');
    } catch (error) {
      console.error('Failed to submit report:', error);
      const errorMessage = error.response?.data?.error || '신고 접수에 실패했습니다.';
      alert(errorMessage);
    }
  };


  const isBlind = detail?.blindStatus === 'BLINDED';

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!detail) {
    return <div className={styles.error}>게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.travelmateDetailMain}>
      {/* 헤더 섹션 */}
      <div className={styles.headerSection}>
        <div className={styles.backgroundImage}>
          <img 
            src={isBlind ? '/icons/common/warning.png' : (detail.thumbnailImage || '/images/default-thumbnail.jpg')} 
            alt="배경 이미지"
          />
          <div className={styles.overlay} />
        </div>
        <div className={styles.dropdownContainer}>
        <DetailDropdown
          isCreator={memberStatus === 'CREATOR'}
          onReport={handleReport}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

        <div className={styles.headerContent}>
          <div className={styles.leftContent}>
            <h1 className={styles.title}>
              {isBlind ? '블라인드 처리된 게시글입니다' : detail.title}
            </h1>
            <p className={styles.simpleDescription}>
              {isBlind ? '' : detail.simpleDescription}
            </p>
          </div>
          
          <div className={styles.rightContent}>
            <div className={styles.actionButtons}>
              <button 
                className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                onClick={handleLikeToggle}
                disabled={!isLogin || isBlind}
              >
                {isLiked ? '❤️' : '🤍'} {isBlind ? '-' : detail.likeCount}
              </button>
              
              <button 
                className={`${styles.joinButton} ${memberStatus !== 'NOT_MEMBER' ? styles.disabled : ''}`}
                onClick={handleJoinRequest}
                disabled={!isLogin || isBlind || memberStatus !== 'NOT_MEMBER'}
              >
                {isBlind ? '참여 불가' : getJoinButtonText()}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 작성자 정보 */}
      <div className={styles.creatorSection}>
        <div className={styles.creatorInfo}>
          <div className={styles.profileImage}>
            <img 
              src={isBlind ? '/icons/common/warning.png' : (detail.creatorProfileImage || '/icons/common/user_profile.svg')} 
              alt="프로필"
            />
          </div>
          <div className={styles.creatorDetails}>
            <div className={styles.creatorName}>
              <span className={styles.style}>[{isBlind ? '-' : (detail.creatorStyle|| '')}]</span>
              <span className={styles.nickname}>{isBlind ? '블라인드 사용자' : detail.creatorNickname}</span>
              <span className={styles.userId}>({isBlind ? '-' : detail.creatorId})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 여행 정보 */}
      <div className={styles.travelInfo}>
        <div className={styles.infoItem}>
          <span className={styles.label}>모임 지역:</span>
          <span className={styles.value}>{isBlind ? '-' : (detail.locationNames || '미정')}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>여행 기간:</span>
          <span className={styles.value}>
            {isBlind ? '-' : formatDateRange(detail.startAt, detail.endAt)}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>대상:</span>
          <span className={styles.value}>{isBlind ? '-' : (detail.targetNames || '-')}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>테마:</span>
          <span className={styles.value}>{isBlind ? '-' : (detail.themeNames || '-')}</span>
        </div>
      </div>

      {/* 모임 설명 */}
      <div className={styles.descriptionSection}>
        <h3 className={styles.sectionTitle}>모임 설명</h3>
        <div className={styles.description}>
          {isBlind ? '블라인드 처리된 게시글입니다.' : (detail.description || '상세 설명이 없습니다.')}
        </div>
      </div>

      {/* 함영하는 여행자 스타일 */}
      <div className={styles.stylesSection}>
        <h3 className={styles.sectionTitle}>함영하는 여행자 스타일</h3>
        <div className={styles.stylesList}>
          {isBlind ? (
            <span>블라인드 처리된 게시글입니다</span>
          ) : (
            detail.styleNames ? detail.styleNames.split(', ').map((style, index) => (
              <span key={index} className={styles.styleTag}>
                {style}
              </span>
            )) : (
              <span>지정된 스타일이 없습니다</span>
            )
          )}
        </div>
      </div>

      <JoinApplicationModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinSubmit}
        groupTitle={detail?.title}
        applicationDescription={detail?.applicationDescription}
      />

      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};
export default TravelmateDetailMain;
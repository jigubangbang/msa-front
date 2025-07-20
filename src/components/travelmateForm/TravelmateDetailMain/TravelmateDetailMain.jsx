import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './TravelmateDetailMain.module.css';
import api from '../../../apis/api';
import JoinApplicationModal from '../../modal/JoinApplicationModal/JoinApplicationModal';
import DetailDropdown from '../../common/DetailDropdown/DetailDropdown';
import ReportModal from '../../common/Modal/ReportModal';
import { useChatContext } from '../../../utils/ChatContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../common/ErrorModal/ConfirmModal';
import SimpleConfirmModal from '../../common/ErrorModal/SimpleConfirmModal';
import LoginConfirmModal from '../../common/LoginConfirmModal/LoginConfirmModal';
import CirclesSpinner from '../../../components/common/Spinner/CirclesSpinner';
import heartFilledIcon from '../../../assets/feed/heart_filled.svg';
import heartEmptyIcon from '../../../assets/feed/heart_empty.svg';

const TravelmateDetailMain = ({ postId, isLogin, currentUserId }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [memberStatus, setMemberStatus] = useState('NOT_MEMBER'); // NOT_MEMBER, PENDING, MEMBER ,creator
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Alert 모달 상태 (ConfirmModal)
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 삭제 확인 모달 상태 (SimpleConfirmModal)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState('');

  // 로그인 확인 모달 상태 (LoginConfirmModal)
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);

  const navigate = useNavigate();
  const { openChat } = useChatContext();

  // 모달 관련 함수들
  const showAlert = (message) => {
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  const hideAlert = () => {
    setShowAlertModal(false);
    setAlertMessage('');
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${postId}`, {
        headers: {
          'User-Id': currentUserId,
        },
      });

      showAlert('여행자모임이 삭제되었습니다.');
      navigate('/traveler/mate'); // 목록 페이지로 이동
    } catch (error) {
      console.error('Failed to delete travelmate:', error);
      showAlert('삭제에 실패했습니다.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleLoginConfirm = () => {
    setShowLoginConfirm(false);
    navigate('/login');
  };

  const handleLoginCancel = () => {
    setShowLoginConfirm(false);
  };

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
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/likes`,
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
      setIsLiked(response.data.likedPostIds.includes(postId));
    } catch (error) {
      console.error('Failed to fetch like status:', error);
    }
  };

  const fetchMemberStatus = async () => {
    if (detail?.blindStatus === 'BLINDED'){
      return;
    }
    try {
      const response = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${postId}/member-status`,
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
      setMemberStatus(response.data.status);
    } catch (error) {
      console.error('Failed to fetch member status:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!isLogin) return;

    try {
      if (isLiked) {
        await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/like/${postId}`,
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
        setIsLiked(false);
        setDetail(prev => ({ ...prev, likeCount: prev.likeCount - 1 }));
      } else {
        await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/like/${postId}`, {},
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
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
      await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${postId}/join`, {
        description: description
      }, {
        headers: {
          'User-Id': currentUserId
        }
      });
      setMemberStatus('PENDING');
      showAlert('참여 신청이 완료되었습니다!');
    } catch (error) {
      console.error('Failed to request join:', error);
      const errorMessage = error.response?.data?.error || '참여 신청에 실패했습니다';
      showAlert(errorMessage);
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
        return '참여 중인 모임: 채팅하기';
      case 'CREATOR' :
        return '내 모임: 채팅하기';
      default:
        return '모임 참여 신청하기';
    }
  };

  const handleEdit = () => {
    navigate(`/traveler/mate/${postId}/edit`);
  };

  const handleDelete = async () => {
    setDeleteConfirmMessage('정말 삭제하시겠습니까?');
    setShowDeleteConfirm(true);
  };

  const handleReport = () => {
    if (!isLogin) {
      setShowLoginConfirm(true);
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

      await api.post(
        `${API_ENDPOINTS.COMMUNITY.USER}/report`,
        payload,
        {
          headers: {
            'User-Id': currentUserId,
          },
        }
      );
      
      setShowReportModal(false);
      showAlert('신고가 접수되었습니다.');
    } catch (error) {
      console.error('Failed to submit report:', error);
      const errorMessage = error.response?.data?.error || '신고 접수에 실패했습니다.';
      showAlert(errorMessage);
    }
  };

  const handleButtonClick = () => {
    if (memberStatus === 'NOT_MEMBER') {
      handleJoinRequest();
    } else if (memberStatus === 'MEMBER' || memberStatus === 'CREATOR') {
      handleChatClick();
    }
  };

  //채팅하기 버튼
  const handleChatClick = async () => {
    console.log('채팅방으로 이동:', postId);
    try {
      const response = await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/chat`, {
        groupType: "TRAVELMATE",
        groupId: postId
      });
      
      console.log('채팅방 조회/생성 성공:', response.data);
    if (response.data.success && response.data.chatRoomId) {
        openChat(response.data.chatRoomId, currentUserId, {
          onLeave: () => {
            fetchTravelmateDetail();
            if (isLogin) {
              fetchMemberStatus();
            }
          }
        });
      } else {
        showAlert('채팅방 정보를 가져오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to get chat room:', error);
      showAlert('채팅방에 접속할 수 없습니다.');
    }
  };

  const handleReportClose = () => {
    setShowReportModal(false);
  };

  const isBlind = detail?.blindStatus === 'BLINDED';

  if (loading) {
    return <CirclesSpinner/>
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
            src={isBlind ? '/icons/common/warning.png' : (detail.backgroundImage || '/images/default-thumbnail.jpg')} 
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
                <img src={isLiked ? heartFilledIcon : heartEmptyIcon} alt="좋아요"/>
                {isBlind ? '-' : detail.likeCount}
              </button>
              
              <button 
              className={`${styles.joinButton} ${memberStatus == 'PENDING' ? styles.disabled : ''}`}
              onClick={handleButtonClick}
              disabled={!isLogin || isBlind}
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
          <div className={styles.profileImageWrapper}>
            <img 
              src={isBlind ? '/icons/common/warning.png' : (detail.creatorProfileImage || '/icons/common/default_profile.png')} 
              alt="프로필"
              onClick={() => navigate(`/profile/${detail.creatorId}`)}
              className={styles.profileImage}
            />
            {!isBlind && detail.creatorStyle && (
              <span className={styles.travelBadge}>
                {detail.creatorStyle}
              </span>
            )}
          </div>
          <div className={styles.creatorDetails}>
            <div className={styles.creatorName}>
              <span className={styles.nickname}  onClick={() => {!isBlind && navigate(`/profile/${detail.creatorId}`)}}>{isBlind ? '블라인드 사용자' : detail.creatorNickname}</span>
              <span className={styles.userId}  onClick={() => {!isBlind && navigate(`/profile/${detail.creatorId}`)}}>({isBlind ? '-' : detail.creatorId})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 여행 정보 */}
      <div className={styles.travelInfo}>
        <div className={styles.infoItem}>
          <span className={styles.label}>여헹 장소 :</span>
          <span className={styles.value}>{isBlind ? '-' : (detail.locationNames || '미정')}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>여행 기간 :</span>
          <span className={styles.value}>
            {isBlind ? '-' : formatDateRange(detail.startAt, detail.endAt)}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>모집 대상 :</span>
          <span className={styles.value}>{isBlind ? '-' : (detail.targetNames || '-')}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>여행 테마 :</span>
          <span className={styles.value}>{isBlind ? '-' : (detail.themeNames || '-')}</span>
        </div>
      </div>

      {/* 모임 설명 */}
      <div className={styles.descriptionSection}>
        <h3 className={styles.sectionTitle}>모임 설명</h3>
        <div className={styles.description}>
          {isBlind ? '블라인드 처리된 게시글입니다' : (detail.description || '상세 설명이 없습니다')}
        </div>
      </div>

      {/* 환영하는 여행자 스타일 */}
      <div className={styles.stylesSection}>
        <h3 className={styles.sectionTitle}>환영하는 여행자 스타일</h3>
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

      {/* 참여 신청 모달 (JoinApplicationModal) */}
      <JoinApplicationModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinSubmit}
        groupTitle={detail?.title}
        applicationDescription={detail?.applicationDescription}
      />

      {/* 신고 모달 (ReportModal) */}
      <ReportModal
        show={showReportModal}
        onClose={handleReportClose}
        onSubmit={handleReportSubmit}
      />

      {/* 로그인 확인 모달 (LoginConfirmModal) */}
      <LoginConfirmModal
        isOpen={showLoginConfirm}
        onClose={handleLoginCancel}
        onConfirm={handleLoginConfirm}
      />

      {/* 삭제 확인 모달 (SimpleConfirmModal) */}
      <SimpleConfirmModal
        isOpen={showDeleteConfirm}
        message={deleteConfirmMessage}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Alert 모달 (ConfirmModal) */}
      <ConfirmModal
        isOpen={showAlertModal}
        onClose={hideAlert}
        message={alertMessage}
        type="alert"
      />
    </div>
  );
};
export default TravelmateDetailMain;
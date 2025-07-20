import React, { useState, useEffect } from 'react';
import styles from './MyTravelinfo.module.css';
import cards from '../MyTravelCard.module.css';
import DetailDropdown from '../../common/DetailDropdown/DetailDropdown';
import { useNavigate } from 'react-router-dom';
import JoinChatModal from '../../modal/JoinChatModal/JoinChatModal';
import { useChatLeave } from '../../../hooks/Chat/useChatLeave';
import ReportModal from '../../common/Modal/ReportModal';
import { useChatContext } from '../../../utils/ChatContext';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import ConfirmModal from '../../common/ErrorModal/ConfirmModal';
import SimpleConfirmModal from '../../common/ErrorModal/SimpleConfirmModal';
import arrow from "../../../assets/community/arrow_right.svg";

export default function MyTravelinfo({ data, fetchTravelinfos, currentUserId, isLogin}) {
  const navigate = useNavigate();

  const [selectedInfo, setSelectedInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('alert');
  const [confirmAction, setConfirmAction] = useState(null);

  // SimpleConfirmModal 상태
  const [showSimpleConfirm, setShowSimpleConfirm] = useState(false);
  const [simpleConfirmMessage, setSimpleConfirmMessage] = useState('');
  const [simpleConfirmCallback, setSimpleConfirmCallback] = useState(null);

  const { openChat, closeChat, chatRooms } = useChatContext();
  const { leaveChatRoom, isLeaving } = useChatLeave();

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

  // SimpleConfirmModal 관련 함수들
  const customConfirm = (message, callback) => {
    setSimpleConfirmMessage(message);
    setSimpleConfirmCallback({ fn: callback });
    setShowSimpleConfirm(true);
  };

  const handleSimpleConfirm = () => {
    if (simpleConfirmCallback && simpleConfirmCallback.fn) {
      simpleConfirmCallback.fn();
    }
    setShowSimpleConfirm(false);
    setSimpleConfirmCallback(null);
  };

  const handleSimpleCancel = () => {
    setShowSimpleConfirm(false);
    setSimpleConfirmCallback(null);
  };

  const themeMap = {
      1: '후기/팁',
      2: '질문/답변',
      3: '맛집/음식',
      4: '항공/교통',
      5: '한달살기/장기여행',
      6: '자유주제',
      7: '아시아',
      8: '유럽',
      9: '미주',
      10: '중동/아프리카',
      11: '오세아니아',
      12: '국내'
    };

    const getThemeLabels = (themeIds) => {
      if (!themeIds || themeIds.length === 0) return '';
      return themeIds.map(id => themeMap[id] || `테마 ${id}`).join(', ');
    };

    const handleJoinClick = (travelinfo) => {
  
  if (travelinfo.isJoined) { 
    handleChatClick(travelinfo.id);
  } else {
    setSelectedInfo(travelinfo);
    setIsModalOpen(true);
  }
};

  const handleChatClick = async (groupId) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/chat`, {
        groupType: "TRAVELINFO",
        groupId: groupId
      });
      
      //채팅하기 버튼
      const chatRoomId = response.data.chatRoomId;
      console.log('채팅방으로 이동:', chatRoomId);

      if (response.data.success && response.data.chatRoomId) {
        openChat(response.data.chatRoomId, currentUserId, {
          onLeave: () => {
            if (fetchTravelinfos) {
              fetchTravelinfos();
            }
          }
        });
      } else {
        showAlertModal('채팅방 정보를 가져오는데 실패했습니다.');
      }
      
    } catch (error) {
      console.error('Failed to get chat room:', error);
      showAlertModal('채팅방을 불러오는데 실패했습니다.');
    }
  };

  const handleJoinSubmit = async () => {
    if (!selectedInfo) return;
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

    showAlertModal('참여가 완료되었습니다!');
      setIsModalOpen(false);
      setSelectedInfo(null);

    if (fetchTravelinfos) {
      await fetchTravelinfos();
    }
      
    } catch (error) {
      console.error('Failed to join chat:', error);
      showAlertModal('참여에 실패했습니다.');
    }
  };

  // 공유방 나가기
  const handleLeaveGroup = async (travelinfoId) => {
    if (!isLogin) {
      showAlertModal('로그인이 필요합니다.');
      return;
    }

    customConfirm(
    '정말로 공유방에서 나가시겠습니까?',
    async () => {
      try {
        const response = await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/chat`, {
          groupType: "TRAVELINFO",
          groupId: travelinfoId
        });
        
        const chatRoomId = response.data.chatRoomId;
        
          if (chatRoomId) {
            const success = await leaveChatRoom(chatRoomId, {
              showAlert: (title, message) => showAlertModal(message),
              onSuccess: () => {
                if (chatRooms[chatRoomId]) {
                  closeChat(chatRoomId);
                }

                showAlertModal('공유방에서 나갔습니다.');
                if (fetchTravelinfos) {
                  fetchTravelinfos();
                }

              
              }
            });
          } else {
            showAlertModal('채팅방 정보를 찾을 수 없습니다.');
          }
        } catch (error) {
          console.error('Failed to get chat room info:', error);
          showAlertModal('채팅방 정보를 가져오는데 실패했습니다.');
        }
      }
    );
  };
    
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedInfo(null);
  };

    const handleReportClose = () => {
    setShowReportModal(false);
    setReportInfo(null);
  };

  const handleReport = (travelinfo) => {
    setShowReportModal(true);
    setReportInfo(travelinfo);
  };

  const handleReportSubmit = async (reportData) => {
      try {
        const payload = {
          reporterId: currentUserId,
          targetUserId: reportInfo.creatorId,
          contentSubtype: 'TRAVELINFO',
          contentType:'GROUP',
          contentId: reportInfo.id,
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
        setReportInfo(null);
        showAlertModal('신고가 접수되었습니다.');
        
      } catch (error) {
        console.error('Failed to submit report:', error);
        const errorMessage = error.response?.data?.error || '신고 접수에 실패했습니다.';
        showAlertModal(errorMessage);
      }
    };
  


  const handleEdit = (travelinfoId) => {
    console.log('수정하기:', travelinfoId);
    // 수정 페이지로 이동
    window.location.href = `/traveler/info/${travelinfoId}/edit`;
  };

  const handleDelete = async (travelinfoId) => {
    customConfirm(
      '정말로 이 정보방을 삭제하시겠습니까?',
      async () => {
        try {
          await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/${travelinfoId}`,
          {
            headers: {
              'User-Id': currentUserId,
            },
          });
          showAlertModal('정보방이 삭제되었습니다.');
          // 목록 새로고침
          fetchTravelinfos();
        } catch (error) {
          console.error('Failed to delete travelinfo:', error);
          showAlertModal('삭제에 실패했습니다.');
        }
      }
    );
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTravelInfoList = (travelInfos, title, sectionType) => {
    // 좋아요한 정보공유방은 카드 스타일로 렌더링
    if (sectionType === 'liked') {
      return renderLikedTravelInfoCards(travelInfos, title);
    }

    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {travelInfos.length === 0 ? (
          <div className={styles.emptyState}>등록된 정보가 없습니다.</div>
        ) : (
          <div className={styles.travelInfoList}>
            {travelInfos.map((info) => (
              <div key={info.id} className={styles.travelInfoCard}>
                <div className={styles.travelInfoHeader}>
                  <div className={styles.thumbnailContainer}>
                    <img 
                      src={info.thumbnailImage} 
                      alt={info.title}
                      className={styles.thumbnail}
                    />
                    {/* 🔄 썸네일 아래에 작성자 정보 + 참가/좋아요 상태 표시 */}
                    <div className={styles.infoDetails}>
                      <span>작성자: {info.creatorNickname}</span>
                    </div>
                  </div>

                  <div className={styles.travelInfoContent}>
                    {info.blindStatus === 'BLINDED' && (
                      <span className={styles.blindedBadge}>블라인드 처리됨</span>
                    )}
                    <h4 className={styles.travelInfoTitle}>{info.title}</h4>
                    <p className={styles.travelInfoDescription}>{info.simpleDescription}</p>
                    
                    <div className={styles.travelInfoMeta}>
                      <span>좋아요: {info.likeCount}</span>
                      <span>멤버: {info.memberCount}명</span>
                      {info.chatCount !== undefined && <span>채팅: {info.chatCount}</span>}
                    </div>

                    <div className={styles.travelSchedule}>
                      <span>작성일: {formatDate(info.createdAt)}</span>
                    </div>

                    {info.themeIds && info.themeIds.length > 0 && (
                      <div className={styles.themes}>
                        {getThemeLabels(info.themeIds).split(', ').map((theme, index) => (
                          <span key={index} className={styles.themeTag}>
                            {theme.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 🔄 참가중/좋아요 상태를 썸네일 아래로 이동 */}
                    {info.joinedAt && (
                      <div className={styles.thumbnailStatus}>
                        <span className={styles.joinedBadge}>참가중</span>
                        <span className={styles.joinedDate}>
                          {formatDate(info.joinedAt)}
                        </span>
                      </div>
                    )}
                    {info.likedAt && (
                      <div className={styles.thumbnailStatus}>
                        <span className={styles.likedBadge}>♥ 좋아요</span>
                        <span className={styles.likedDate}>
                          {formatDate(info.likedAt)}
                        </span>
                      </div>
                    )}

                    {/* TravelMate 스타일로 채팅 버튼 컨테이너 추가 */}
                    <div className={styles.chatButtonContainer}>
                      {(sectionType === 'hosted' || sectionType === 'joined' || info.isJoined) ? (
                        <button className={styles.chatButton} onClick={(e) => {
                          e.stopPropagation();
                          handleChatClick(info.id);
                        }}>
                          채팅 바로가기
                          <img src={arrow} alt="arrow"/>
                        </button>
                      ) : (
                        <button className={styles.joinButton} onClick={(e) => {
                          e.stopPropagation();
                          handleJoinClick(info, e);
                        }}>
                          참가하기
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
                    <DetailDropdown
                      isCreator={sectionType === 'hosted'}
                      onReport={() => handleReport(info)}
                      onEdit={() => handleEdit(info.id)}
                      onDelete={() => handleDelete(info.id)}
                      onLeave={sectionType === 'joined' ? () => handleLeaveGroup(info.id) : undefined}
                      showLeave={sectionType === 'joined'}
                    />
                  </div>
                </div>

                {info.latestMessage && (
                  <div className={styles.latestMessageSection} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.latestMessageHeader}>
                      <span>최근 메시지</span>
                    </div>
                    <div className={styles.latestMessage}>
                      {info.latestMessage}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 새로운 함수: 카드 스타일로 렌더링
  const renderLikedTravelInfoCards = (travelInfos, title) => (
    <div className={cards.section}>
      <h3 className={cards.sectionTitle}>{title}</h3>
      {travelInfos.length === 0 ? (
        <div className={cards.emptyState}>좋아요한 정보공유방이 없습니다.</div>
      ) : (
        <div className={cards.cardContainer}>
          {travelInfos.map((info) => {
            const isBlind = info.blindStatus === 'BLINDED';
            
            return (
              <div 
                key={info.id} 
                className={cards.card}
                onClick={() => navigate(`/traveler/info/${info.id}`)}
              >
                <div className={cards.imageContainer}>
                  <img 
                    src={isBlind ? '/icons/common/warning.png' : (info.thumbnailImage || '/images/default-thumbnail.jpg')} 
                    alt="썸네일"
                    className={cards.thumbnail}
                  />
                  <div className={cards.cardDropdown} onClick={(e) => e.stopPropagation()}>
                    <DetailDropdown
                      isCreator={false}
                      onReport={() => handleReport(info)}
                      onEdit={() => handleEdit(info.id)}
                      onDelete={() => handleDelete(info.id)}
                    />
                  </div>
                </div>
                
                <div className={cards.content}>
                  <h4 className={cards.cardTitle}>
                    {isBlind ? '블라인드 처리된 게시글입니다' : info.title}
                  </h4>
                  <p className={cards.description}>
                    {isBlind ? '' : info.simpleDescription}
                  </p>
                  
                  {!isBlind && (
                    <div className={cards.likedTravelMeta}>
                      <div>작성자: {info.creatorNickname}</div>
                      <div>작성일: {formatDate(info.createdAt)}</div>
                    </div>
                  )}
                  
                  {!isBlind && (
                    <div className={cards.travelMeta}>
                      <span>좋아요: {info.likeCount}</span>
                      <span>멤버: {info.memberCount}명</span>
                      {info.chatCount !== undefined && <span>채팅: {info.chatCount}</span>}
                    </div>
                  )}

                  {isBlind && (
                    <div className={cards.travelMeta}>
                      <span>좋아요: -</span>
                      <span>멤버: -명</span>
                      <span>채팅: -</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );


  return (<>
    <div className={styles.container}>
      {/* 내가 호스팅하는 정보 공유방 */}
      {data.hostedTravelInfos && renderTravelInfoList(data.hostedTravelInfos, '내가 만든 정보 공유방', 'hosted')}

      {/* 참가한 정보 공유방 */}
      {data.joinedTravelInfos && renderTravelInfoList(data.joinedTravelInfos, '참가한 정보 공유방', 'joined')}

      {/* 좋아요한 정보 공유방 */}
      {data.likedTravelInfos && renderTravelInfoList(data.likedTravelInfos, '좋아요한 정보 공유방', 'liked')}
    </div>

    <JoinChatModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleJoinSubmit}
        chatTitle={selectedInfo?.title}
        message={selectedInfo?.enterDescription}
      />

      <ReportModal
              show={showReportModal}
              onClose={handleReportClose}
              onSubmit={handleReportSubmit}
            />

            <ConfirmModal
        isOpen={showConfirmModal}
        onClose={hideConfirm}
        onConfirm={confirmAction ? handleConfirmAction : null}
        message={confirmMessage}
        type={confirmType}
      />

      {/* SimpleConfirmModal 추가 */}
      <SimpleConfirmModal
        isOpen={showSimpleConfirm}
        message={simpleConfirmMessage}
        onConfirm={handleSimpleConfirm}
        onCancel={handleSimpleCancel}
      />

    </>
  );
}
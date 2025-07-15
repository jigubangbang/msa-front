import React, { useState, useEffect } from 'react';

import styles from './MyTravelinfo.module.css';
import DetailDropdown from '../../common/DetailDropdown/DetailDropdown';
import { useNavigate } from 'react-router-dom';
import JoinChatModal from '../../modal/JoinChatModal/JoinChatModal';
import { useChatLeave } from '../../../hooks/chat/useChatLeave';
import ReportModal from '../../common/Modal/ReportModal';
import ChatModal from '../../../pages/chat/ChatModal';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';


export default function MyTravelinfo({ data, fetchTravelinfos, currentUserId, isLogin}) {
  const navigate = useNavigate();

  const [selectedInfo, setSelectedInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);

  // 채팅방 입장
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  // 채팅방 나가기
  const { leaveChatRoom, isLeaving } = useChatLeave();

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
      
      //#NeedToDo채팅
      const chatRoomId = response.data.chatRoomId;
      console.log('채팅방으로 이동:', chatRoomId);

      if (response.data.success && response.data.chatRoomId) {
        setSelectedChatId(response.data.chatRoomId);
        setChatModalOpen(true);
      } else {
        alert('채팅방 정보를 가져오는데 실패했습니다.');
      }
      
    } catch (error) {
      console.error('Failed to get chat room:', error);
      alert('채팅방을 불러오는데 실패했습니다.');
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

      if (fetchTravelinfos) {
            fetchTravelinfos();
          }
      alert('참여가 완료되었습니다!');
      setIsModalOpen(false);
      setSelectedInfo(null);
    } catch (error) {
      console.error('Failed to join chat:', error);
      alert('참여에 실패했습니다.');
    }
  };

  // 채팅방 나가기
  const handleLeaveGroup = async (travelinfoId) => {
    if (!isLogin) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/chat`, {
        groupType: "TRAVELINFO",
        groupId: travelinfoId
      });
      
      const chatRoomId = response.data.chatRoomId;
      
      if (chatRoomId) {
        const success = await leaveChatRoom(chatRoomId, {
          skipConfirmation: false, // 확인 모달 표시
          showAlert: (title, message) => alert(message),
          onSuccess: () => {
            if (fetchTravelinfos) {
              fetchTravelinfos();
            }
          }
        });
      } else {
        alert('채팅방 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Failed to get chat room info:', error);
      alert('채팅방 정보를 가져오는데 실패했습니다.');
    }
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
        alert('신고가 접수되었습니다.');
        
      } catch (error) {
        console.error('Failed to submit report:', error);
        const errorMessage = error.response?.data?.error || '신고 접수에 실패했습니다.';
        alert(errorMessage);
      }
    };
  


  const handleEdit = (travelinfoId) => {
    console.log('수정하기:', travelinfoId);
    // 수정 페이지로 이동
    window.location.href = `/traveler/info/${travelinfoId}/edit`;
  };

  const handleDelete = async (travelinfoId) => {
    if (!window.confirm('정말로 이 정보방을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/${travelinfoId}`,
      {
        headers: {
          'User-Id': currentUserId,
        },
      });
      alert('정보방이 삭제되었습니다.');
      // 목록 새로고침
      fetchTravelinfos();
    } catch (error) {
      console.error('Failed to delete travelinfo:', error);
      alert('삭제에 실패했습니다.');
    }
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

  
  const handleExitClick = async (groupId) => {
    console.log(groupId,"그룹 나가기");
    //나가기
    //TODO 나가기 버튼 구현
  }


  const renderTravelInfoList = (travelInfos, title, sectionType) => (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {travelInfos.length === 0 ? (
        <div className={styles.emptyState}>등록된 정보가 없습니다.</div>
      ) : (
        <div className={styles.travelInfoList}>
          {travelInfos.map((info) => (
            <div key={info.id} className={styles.travelInfoCard}>
              <div className={styles.travelInfoHeader}>
                {/* 참가/채팅 버튼 - 오른쪽 중간 */}
                  <div className={styles.actionButtonContainer}>
                        <img 
                      src={info.thumbnailImage} 
                      alt={info.title}
                      className={styles.thumbnail}
                    />
                    {(sectionType === 'hosted' || sectionType === 'joined' || info.isJoined) ? (  // joinedChats.has(info.id) → info.isJoined
                      <div className={styles.buttonContainer}>
                        <button 
                          className={styles.chatButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChatClick(info.id);
                          }}
                        >
                          채팅하기
                        </button>
                        <button 
                          className={styles.chatButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExitClick(info.id);
                          }}
                        >
                          나가기
                        </button>
                      </div>
                    ) : (
                      <button 
                        className={styles.joinButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinClick(info, e);
                        }}
                      >
                        참가하기
                      </button>
                    )}
                    {(sectionType === 'joined' || info.isJoined) && (
                      <button 
                        className={styles.leaveButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveGroup(info.id);
                        }}
                        disabled={isLeaving}
                      >
                        {isLeaving ? '나가는 중...' : '채팅방 나가기'}
                      </button>
                    )}
                  </div>
                <div className={styles.travelInfoContent}>
                  <h4 className={styles.travelInfoTitle}>{info.title}</h4>
                  <p className={styles.travelInfoDescription}>{info.simpleDescription}</p>
                  
                  <div className={styles.creatorInfo}>
                    <span>작성자: {info.creatorNickname}</span>
                    {info.creatorId && <span>({info.creatorId})</span>}
                  </div>

                  <div className={styles.travelInfoMeta}>
                    <span>좋아요: {info.likeCount}</span>
                    <span>멤버: {info.memberCount}명</span>
                    {info.chatCount !== undefined && <span>채팅: {info.chatCount}</span>}
                    <span>작성일: {formatDate(info.createdAt)}</span>
                  </div>

                  
                  {/* 테마 정보 표시 */}
                  {info.themeIds && info.themeIds.length > 0 && (
                    <div className={styles.themes}>
                      <span>테마: {getThemeLabels(info.themeIds)}</span>
                    </div>
                  )}
                  {/* 참가한 정보의 경우 참가 날짜 표시 */}
                  {info.joinedAt && (
                    <div className={styles.joinedInfo}>
                      <span className={styles.joinedBadge}>참가중</span>
                      <span className={styles.joinedDate}>
                        참가일: {formatDate(info.joinedAt)}
                      </span>
                    </div>
                  )}

                  {/* 좋아요한 정보의 경우 좋아요 날짜 표시 */}
                  {info.likedAt && (
                    <div className={styles.likedInfo}>
                      <span className={styles.likedBadge}>♥ 좋아요</span>
                      <span className={styles.likedDate}>
                        {formatDate(info.likedAt)}
                      </span>
                    </div>
                  )}


                  {/* 최근 메시지 정보 */}
                  {info.latestMessage && (
                    <div className={styles.latestMessage}>
                      <strong>최근 메시지:</strong> {info.latestMessage}
                    </div>
                  )}
                </div>

                {/* 우측 액션 영역 */}
                <div className={styles.rightActions}>
                  {/* 드롭다운 메뉴 - 오른쪽 위 */}
                  <div 
                    className={styles.dropdownContainer}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DetailDropdown
                      isCreator={sectionType === 'hosted'}
                      onReport={() => handleReport(info)}
                      onEdit={() => handleEdit(info.id)}
                      onDelete={() => handleDelete(info.id)}
                    />
                  </div>

                  
                </div>
              </div>
            </div>
          ))}
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

    {chatModalOpen && selectedChatId && (
        <ChatModal
          isOpen={chatModalOpen}
          chatId={selectedChatId}
          currentUserId={currentUserId}
        />
      )}

      <ReportModal
              show={showReportModal}
              onClose={handleReportClose}
              onSubmit={handleReportSubmit}
            />
    </>
  );
}
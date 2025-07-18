import React, { useState } from 'react';
import styles from './MyTravelmate.module.css';
import DetailDropdown from '../../common/DetailDropdown/DetailDropdown';
import {useNavigate } from 'react-router-dom';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import { useChatContext } from '../../../utils/ChatContext';
import { useChatLeave } from '../../../hooks/Chat/useChatLeave';
import ReportModal from '../../common/Modal/ReportModal';
import ConfirmModal from '../../common/ErrorModal/ConfirmModal';
import SimpleConfirmModal from '../../common/ErrorModal/SimpleConfirmModal';

export default function MyTravelmate({ data, fetchTravelerData, currentUserId  }) {
  const [expandedApplications, setExpandedApplications] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);

  const { openChat, closeChat, chatRooms } = useChatContext();
  const { leaveChatRoom, isLeaving } = useChatLeave();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('alert');
  const [confirmAction, setConfirmAction] = useState(null);

  // SimpleConfirmModal 상태
  const [showSimpleConfirm, setShowSimpleConfirm] = useState(false);
  const [simpleConfirmMessage, setSimpleConfirmMessage] = useState('');
  const [simpleConfirmCallback, setSimpleConfirmCallback] = useState(null);

  const navigate = useNavigate();

  const toggleApplications = (id) => {
    setExpandedApplications(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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

  const handleApplicationDelete = async (travelId, applicationId) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${travelId}/application/${applicationId}`, {
        headers: {
          'User-Id': currentUserId,
        },
      });

      if (fetchTravelerData) {
        fetchTravelerData();
      }
    } catch (error) {
      console.error('Failed to process application:', error);
      showAlertModal('처리 중 오류가 발생했습니다.');
    }
  }

   const handleApplicationAction = async (travelId, applicationId, action) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${travelId}/application/${applicationId}/${action}`, {}, {
        headers: {
          'User-Id': currentUserId,
        },
      });
      showAlertModal(`신청을 ${action === 'accept' ? '수락' : '거절'}했습니다.`);
      if (fetchTravelerData) {
        fetchTravelerData();
      }
    } catch (error) {
      console.error('Failed to process application:', error);
      showAlertModal('처리 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (travelId) => {
    navigate(`/traveler/mate/${travelId}/edit`);
  };

  const handleDelete = async (travelId) => {
    customConfirm(
      '정말로 이 여행 모임을 삭제하시겠습니까?',
      async () => {
        try {
          await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${travelId}`, {
            headers: {
              'User-Id': currentUserId,
            },
          });
          showAlertModal('여행 모임이 삭제되었습니다.');
          
          if (fetchTravelerData) {
            fetchTravelerData();
          }
        } catch (error) {
          console.error('Failed to delete travelmate:', error);
          showAlertModal('삭제에 실패했습니다.');
        }
      }
    );
  };

  const handleReport = (travel) => {
    setShowReportModal(true);
    setReportInfo(travel);
  };

  const handleReportClose = () => {
    setShowReportModal(false);
    setReportInfo(null);
  };

 const handleReportSubmit = async (reportData) => {
    try {
      const payload = {
        reporterId: currentUserId,
        targetUserId: reportInfo.creatorId,
        contentSubtype: 'TRAVELMATE',
        contentType: 'GROUP',
        contentId: reportInfo.id,
        reasonCode: reportData.reasonCode,
        reasonText: reportData.reasonText
      };

      await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/report`, payload, {
        headers: {
          'User-Id': currentUserId,
        },
      });
      
      setShowReportModal(false);
      setReportInfo(null);
      showAlertModal('신고가 접수되었습니다.');
      
    } catch (error) {
      console.error('Failed to submit report:', error);
      const errorMessage = error.response?.data?.error || '신고 접수에 실패했습니다.';
      showAlertModal(errorMessage);
    }
  };

    //채팅하기 버튼
    const handleChatClick = async (groupId) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/chat`, {
        groupType: "TRAVELMATE",
        groupId: groupId
      });
      
      const chatRoomId = response.data.chatRoomId;
      console.log('채팅방으로 이동:', chatRoomId);

      if (response.data.success && response.data.chatRoomId) {
        openChat(response.data.chatRoomId, currentUserId, {
          onLeave: () => {
            if (fetchTravelerData) {
              fetchTravelerData();
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

  // 채팅방 나가기
  const handleLeaveGroup = async (travelId) => {
    try {
      // chatId 불러오기
      const response = await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/chat`, {
        groupType: "TRAVELMATE",
        groupId: travelId
      });     
      const chatRoomId = response.data.chatRoomId;
      
      if (chatRoomId) {
        // 모임 나가기
        const success = await leaveChatRoom(chatRoomId, {
          skipConfirmation: false, // 확인 모달 표시
          showAlert: (title, message) => showAlertModal(message),
          onSuccess: () => {
            if (chatRooms[chatRoomId]) {
              closeChat(chatRoomId);
            }
            if (fetchTravelerData){
              fetchTravelerData();
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

  const handleTravelmateRowClick = (travelmate) => {
    navigate(`/traveler/mate/${travelmate.id}`);
  };

  const handleUserClick = (userId) => {
    navigate(`/my-quest/profile/${userId}`);
  }

  const renderTravelList = (travels, title, sectionType) => (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {travels.length === 0 ? (
        <div className={styles.emptyState}>등록된 여행이 없습니다.</div>
      ) : (
        <div className={styles.travelList}>
          {travels.map((travel) => (
            <div key={travel.id} className={styles.travelCard} onClick={() => handleTravelmateRowClick(travel)}>
              <div className={styles.travelHeader}>
                <img 
                  src={travel.thumbnailImage} 
                  alt={travel.title}
                  className={styles.thumbnail}
                />
                <div className={styles.travelInfo}>
                  <div className={styles.titleContainer}>
                    {travel.blindStatus === 'BLINDED' && (
                      <span className={styles.blindedBadge}>블라인드 처리됨</span>
                    )}
                    <h4 className={styles.travelTitle}>{travel.title}</h4>
                  </div>
                  <p className={styles.travelDescription}>{travel.simpleDescription}</p>
                  <div className={styles.travelMeta}>
                    <span>일정: {formatDate(travel.startAt)} ~ {formatDate(travel.endAt)}</span>
                    <span>좋아요: {travel.likeCount}</span>
                    <span>멤버: {travel.memberCount}명</span>
                    <span>조회수: {travel.viewCount}</span>
                  </div>
                  {travel.locationNames && (
                    <div className={styles.locations}>
                      <span>위치: {travel.locationNames}</span>
                    </div>
                  )}
                  {travel.themeNames && (
                    <div className={styles.themes}>
                      <span>테마: {travel.themeNames}</span>
                    </div>
                  )}
                </div>

                {/* 드롭다운 메뉴 */}
                <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
                  <DetailDropdown
                      isCreator={sectionType === 'hosted'}
                      onReport={() => handleReport(travel)}
                      onEdit={() => handleEdit(travel.id)}
                      onDelete={() => handleDelete(travel.id)}
                    />
                    {(sectionType==='hosted' || sectionType==='joined') && (
                      <button 
                        className={styles.chatButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatClick(travel.id);
                        }}
                      >
                        채팅하기
                      </button>
                      
                    )}
                    {sectionType === 'hosted' && (<>
                      <button
                        className={styles.chatButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(travel.id);
                        }}
                      >
                        그룹 삭제하기
                      </button>  
                      </>                                         
                    )}
                    {sectionType === 'joined' && (
                      <button 
                        className={styles.leaveButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveGroup(travel.id);
                        }}
                         disabled={isLeaving}
                      >
                        {isLeaving ? '나가는 중...' : '모임 나가기'}
                      </button>
                      
                    )}
                </div>
              </div>

              {/* 동행 신청 목록 (호스팅 여행이고 신청이 있는 경우에만 표시) */}
              {sectionType==='hosted' && travel.applications && travel.applications.length > 0 && (
                <div 
                  className={styles.applicationsSection}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.applicationsHeader}>
                    <button
                      className={styles.toggleButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleApplications(travel.id);
                      }}
                    >
                      동행 신청 ({travel.applications.length}명)
                      <span className={expandedApplications[travel.id] ? styles.expanded : ''}>
                        ▼
                      </span>
                    </button>
                  </div>

                  {expandedApplications[travel.id] && (
                    <div className={styles.applicationsList}>
                      {travel.applications.map((application) => (
                        <div key={application.id} className={styles.applicationCard}>
                          <div className={styles.applicationInfo}>
                            <div className={styles.applicantInfo}>
                              <div className={styles.applicantUser} onClick={() => handleUserClick(application.userId)}>
                                <span className={styles.nickname}>{application.userNickname}</span>
                                <span className={styles.userId}>({application.userId})</span>
                              </div>
                              {application.status !== 'PENDING' && (
                                <img src={"/icons/common/delete.svg"} alt="지우기" className={styles.bin}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplicationDelete(travel.id, application.id);
                                }}/>
                              )}
                            </div>
                            <div className={styles.applicationComment}>
                              {application.applicationComment || '신청 메시지가 없습니다.'}
                            </div>
                            <div className={styles.applicationDate}>
                              신청일: {formatDate(application.appliedAt)}

                            {application.status === 'PENDING' && (
                            <div className={styles.actionButtons}>
                              <button
                                className={`${styles.actionButton} ${styles.accept}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplicationAction(travel.id, application.id, 'accept');
                                }}
                              >
                                수락
                              </button>
                              <button
                                className={`${styles.actionButton} ${styles.reject}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplicationAction(travel.id, application.id, 'reject');
                                }}
                              >
                                거절
                              </button>
                            </div>
                          )}

                          {application.status === 'ACCEPTED' && (
                            <div className={styles.statusBadge}>
                              <span className={styles.accepted}>수락됨</span>
                            </div>
                          )}

                          {application.status === 'REJECTED' && (
                            <div className={styles.statusBadge}>
                              <span className={styles.rejected}>거절됨</span>
                            </div>
                          )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 신청한 여행의 경우 신청 상태 표시 */}
              {travel.applicationStatus && (
                <div className={styles.myApplicationStatus}>
                  <span className={`${styles.statusBadge} ${styles[travel.applicationStatus.toLowerCase()]}`}>
                    {travel.applicationStatus === 'PENDING' ? '대기중' : 
                     travel.applicationStatus === 'ACCEPTED' ? '수락됨' : '거절됨'}
                  </span>
                  {travel.appliedAt && (
                    <span className={styles.appliedDate}>
                      신청일: {formatDate(travel.appliedAt)}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      {/* 호스팅 중인 여행 */}
      {data.hostedTravelmates && renderTravelList(data.hostedTravelmates, '내가 호스팅하는 여행', 'hosted')}

      {/* 참가한 여행 */}
      {data.joinedTravelmates && renderTravelList(data.joinedTravelmates, '참가한 여행', 'joined')}

      {/* 신청한 여행 */}
      {data.appliedTravelmates && renderTravelList(data.appliedTravelmates, '신청한 여행', 'applied')}

      {/* 좋아요한 여행 */}
      {data.likedTravelmates && renderTravelList(data.likedTravelmates, '좋아요한 여행', 'liked')}

      {/* 완료된 여행 */}
      {data.completedTravelmates && renderTravelList(data.completedTravelmates, '완료된 여행', 'completed')}
      
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
    </div>
  );
}
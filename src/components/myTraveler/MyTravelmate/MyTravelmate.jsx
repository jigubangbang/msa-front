import React, { useState } from 'react';
import styles from './MyTravelmate.module.css';
import cards from '../MyTravelCard.module.css';
import DetailDropdown from '../../common/DetailDropdown/DetailDropdown';
import {useNavigate } from 'react-router-dom';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import { useChatContext } from '../../../utils/ChatContext';
import { useChatLeave } from '../../../hooks/Chat/useChatLeave';
import ReportModal from '../../common/Modal/ReportModal';
import ConfirmModal from '../../common/ErrorModal/ConfirmModal';
import SimpleConfirmModal from '../../common/ErrorModal/SimpleConfirmModal';
import arrow from "../../../assets/community/arrow_right.svg";
import location from "../../../assets/community/location_on.svg";
import drop from "../../../assets/community/arrow_drop.svg";
import drop_down from "../../../assets/community/arrow_drop_down.svg";

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
      showAlertModal('처리 중 오류가 발생했습니다');
    }
  }

   const handleApplicationAction = async (travelId, applicationId, action) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${travelId}/application/${applicationId}/${action}`, {}, {
        headers: {
          'User-Id': currentUserId,
        },
      });
      showAlertModal(`신청을 ${action === 'accept' ? '수락' : '거절'}했습니다`);
      if (fetchTravelerData) {
        fetchTravelerData();
      }
    } catch (error) {
      console.error('Failed to process application:', error);
      showAlertModal('처리 중 오류가 발생했습니다');
    }
  };

  const handleEdit = (travelId) => {
    navigate(`/traveler/mate/${travelId}/edit`);
  };

  const handleDelete = async (travelId) => {
    customConfirm(
      '정말 이 여행자 모임을 삭제하시겠습니까?',
      async () => {
        try {
          await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${travelId}`, {
            headers: {
              'User-Id': currentUserId,
            },
          });
          showAlertModal('여행자 모임이 삭제되었습니다');
          
          if (fetchTravelerData) {
            fetchTravelerData();
          }
        } catch (error) {
          console.error('Failed to delete travelmate:', error);
          showAlertModal('삭제에 실패했습니다');
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
      showAlertModal('신고가 접수되었습니다');
      
    } catch (error) {
      console.error('Failed to submit report:', error);
      const errorMessage = error.response?.data?.error || '신고 접수에 실패했습니다';
      showAlertModal(errorMessage);
    }
  };

    //채팅하기 버튼
    const handleChatClick = async (groupId) => {
    console.log('handleChatClick 함수 실행됨!', groupId);
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
        showAlertModal('채팅방 정보를 가져오는데 실패했습니다');
      }
      
    } catch (error) {
      console.error('Failed to get chat room:', error);
      showAlertModal('채팅방을 불러오는데 실패했습니다');
    }
  };

  // 채팅방 나가기
  const handleLeaveGroup = async (travelId) => {
    customConfirm(
      '정말로 모임에서 나가시겠습니까?',
      async () => {
        try {
          const response = await api.post(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/chat`, {
            groupType: "TRAVELMATE",
            groupId: travelId
          });     
          const chatRoomId = response.data.chatRoomId;
          
          if (chatRoomId) {
            const success = await leaveChatRoom(chatRoomId, {
              showAlert: (title, message) => showAlertModal(message),
              onSuccess: () => {
                if (chatRooms[chatRoomId]) {
                  closeChat(chatRoomId);
                }
                if (fetchTravelerData) {
                  fetchTravelerData();
                }
              }
            });
          } else {
            showAlertModal('채팅방 정보를 찾을 수 없습니다');
          }
        } catch (error) {
          console.error('Failed to get chat room info:', error);
          showAlertModal('채팅방 정보를 가져오는데 실패했습니다');
        }
      }
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',  
      day: '2-digit'     
    }).replace(/\.$/, ''); 
  };

  const handleTravelmateRowClick = (travelmate) => {
    navigate(`/traveler/mate/${travelmate.id}`);
  };

  const handleUserClick = (userId) => {
    navigate(`/my-quest/profile/${userId}`);
  }

  const renderTravelList = (travels, title, sectionType) => {
    // 좋아요한 여행은 카드 스타일로 렌더링
    if (sectionType === 'liked' || sectionType === 'applied') {
    return renderTravelCards(travels, title, sectionType);
  }
    
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {travels.length === 0 ? (
          <div className={styles.emptyState}>등록된 모임이 없습니다</div>
        ) : (
          <div className={styles.travelList}>
            {travels.map((travel) => (
              <div key={travel.id} className={styles.travelCard} onClick={() => handleTravelmateRowClick(travel)}>
                <div className={styles.travelHeader}>
                   <div className={styles.thumbnailContainer}>
                      <img
                        src={travel.thumbnailImage}
                        alt={travel.title}
                        className={styles.thumbnail}
                      />
                      {travel.locationNames && (
                        <div className={styles.locations}>
                          <img src={location} alt="location"/>
                          <span>{travel.locationNames}</span>
                        </div>
                      )}
                    </div>
                  <div className={styles.travelInfo}>
                    {travel.blindStatus === 'BLINDED' && (
                      <span className={styles.blindedBadge}>블라인드 처리됨</span>
                    )}
                    <h4 className={styles.travelTitle}>{travel.title}</h4>
                    <p className={styles.travelDescription}>{travel.simpleDescription}</p>
                    <div className={styles.travelSchedule}>
                      <span>일정 | {formatDate(travel.startAt)} ~ {formatDate(travel.endAt)}</span>
                    </div>
                    <div className={styles.travelMeta}>
                      <span>좋아요 {travel.likeCount}</span>
                      |<span>멤버 {travel.memberCount}명</span>
                      |<span>조회수 {travel.viewCount}</span>
                    </div>
                    {travel.themeNames && (
                      <div className={styles.themes}>
                        {travel.themeNames.split(',').map((theme, index) => (
                          <span key={index} className={styles.themeTag}>
                            {theme.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className={styles.chatButtonContainer}>
                      <button className={styles.chatButton} onClick={(e) => {
                        console.log('버튼 클릭됨!', travel.id);
                        e.stopPropagation();
                        e.preventDefault();
                        handleChatClick(travel.id);
                      }}>
                        채팅 바로가기
                        <img src={arrow} alt="arrow" onClick={(e) => e.stopPropagation()}/>
                      </button>
                    </div>
                  </div>

                  {/* 드롭다운 메뉴 */}
                  <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
                    <DetailDropdown
                        isCreator={sectionType === 'hosted'}
                        onReport={() => handleReport(travel)}
                        onEdit={() => handleEdit(travel.id)}
                        onDelete={() => handleDelete(travel.id)}
                        onLeave={sectionType === 'joined' ? () => handleLeaveGroup(travel.id) : undefined}
                        showLeave={sectionType === 'joined'}
                      />
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
                        모임 참가 신청 ({travel.applications.length}명)
                        <span>
                          <img src={expandedApplications[travel.id] ? drop : drop_down} className={expandedApplications[travel.id] ? styles.expanded : ''}/>
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
                                {application.applicationComment || '신청 메시지가 없습니다'}
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
                        신청일 | {formatDate(travel.appliedAt)}
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
  };

  const renderTravelCards = (travels, title, sectionType) => (
    <div className={cards.section}>
      <h3 className={cards.sectionTitle}>{title}</h3>
      {travels.length === 0 ? (
        <div className={cards.emptyState}>등록된 모임이 없습니다</div>
      ) : (
        <div className={cards.cardContainer}>
          {travels.map((travel) => {
            const isBlind = travel.blindStatus === 'BLINDED';
            
            return (
              <div 
                key={travel.id} 
                className={cards.card}
                onClick={() => handleTravelmateRowClick(travel)}
              >
                <div className={cards.imageContainer}>
                  <img 
                    src={isBlind ? '/icons/common/warning.png' : (travel.thumbnailImage || '/images/default-thumbnail.jpg')} 
                    alt="썸네일"
                    className={cards.thumbnail}
                  />
                  <div className={cards.cardDropdown} onClick={(e) => e.stopPropagation()}>
                    <DetailDropdown
                      isCreator={false}
                      onReport={() => handleReport(travel)}
                      onEdit={() => handleEdit(travel.id)}
                      onDelete={() => handleDelete(travel.id)}
                    />
                  </div>
                </div>
                
                <div className={cards.content}>
                  <h4 className={cards.cardTitle}>
                    {isBlind ? '블라인드 처리된 게시글입니다' : travel.title}
                  </h4>
                  <p className={cards.description}>
                    {isBlind ? '' : travel.simpleDescription}
                  </p>
                  
                  {!isBlind && (
                    <div className={cards.likedTravelMeta}>
                      <span>{formatDate(travel.startAt)} ~ {formatDate(travel.endAt)}</span>
                    </div>
                  )}

                  {!isBlind && (
                    <div className={cards.travelMeta}>
                      <span>좋아요 {travel.likeCount}</span>
                      |<span>멤버 {travel.memberCount}명</span>
                      |<span>조회수 {travel.viewCount}</span>
                    </div>
                  )}

                  {/* 블라인드된 게시글의 경우 */}
                  {isBlind && (
                    <div className={cards.travelMeta}>
                      <span>좋아요 : -</span>
                      <span>멤버 : -명</span>
                      <span>조회수 : -</span>
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


  return (
    <div className={styles.container}>
      {/* 호스팅 중인 여행 */}
      {data.hostedTravelmates && renderTravelList(data.hostedTravelmates, '내가 호스팅하는 모임', 'hosted')}

      {/* 참가한 여행 */}
      {data.joinedTravelmates && renderTravelList(data.joinedTravelmates, '참가 중인 모임', 'joined')}

      {/* 신청한 여행 */} 
      {data.appliedTravelmates && renderTravelList(data.appliedTravelmates, '신청한 모임', 'applied')}

      {/* 좋아요한 여행 */}
      {data.likedTravelmates && renderTravelList(data.likedTravelmates, '좋아요한 모임', 'liked')}

      {/* 완료된 여행 */}
      {data.completedTravelmates && renderTravelList(data.completedTravelmates, '완료된 모임', 'completed')}
      
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
// src/components/chat/ChatSidebar.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStomp } from '../../hooks/chat/useStomp';
import useChatRoomInfo from '../../hooks/chat/useChatRoomInfo';
import { useChatSubscriptionStore } from '../../hooks/chat/useStomp';
import ChatReportTab from '../../components/chat/ChatReportTab';
import ChatDescriptionEditor from '../../components/chat/ChatDescriptionEditor';
import ChatReportModal from '../../components/chat/ChatReportModal';
import ChatAlertModal from '../../components/chat/ChatAlertModal';
import defaultProfile from '../../assets/default_profile.png';
import API_ENDPOINTS from '../../utils/constants';
import api from "../../apis/api";
import { getAccessToken } from '../../utils/tokenUtils';
import '../../styles/Chat/ChatSidebar.css';

export default function ChatSidebar({ chatId, senderId, isOpen, onClose, chatInfo, onForceClose, showAlert, isDark, onLeave }) {
  const { subscribe, unsubscribe } = useStomp();
  const { info, members, loading, error, refetch} = useChatRoomInfo(chatId);
  const {removeSubscription, getSubscription} = useChatSubscriptionStore();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [description, setDescription] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [confirmModalInfo, setConfirmModalInfo] = useState({ show: false, title: '', message: '', onConfirm: () => {}, position: 'top' });
  const [sidebarTopOffset, setSidebarTopOffset] = useState(58);
  const [originalCreatorId, setOriginalCreatorId] = useState(null);
  const sidebarRef = useRef(null);
  const groupType = chatInfo?.groupType || info?.groupType;
  const navigate = useNavigate();

  const isManager = members.some(member => member.userId === senderId && member.isCreator === 1);
  const accessToken = getAccessToken();
  const subscriptionRef = useRef(null);

  const getUserNickname = (userId) => {
    const member = members.find(member => member.userId === userId);
    return member?.nickname || userId; // 닉네임이 없으면 userId를 fallback으로 사용
  };

  const handleProfileClick = (userId, e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    console.log( "그룹 멤버 조회 중" );
  }
  if (error) {
    console.log(  "그룹 멤버 조회 중 에러 발생" );
  }

  useEffect(() => {
    if (info?.description !== undefined) {
      setDescription(info.description);
    }
  }, [info?.description]);

  const showConfirmModal = (title, message, onConfirm, position = 'top') => {
    setConfirmModalInfo({ show: true, title, message, onConfirm, position });
  };

  const hideConfirmModal = () => {
    setConfirmModalInfo({ show: false, title: '', message: '', onConfirm: () => {}, position: 'top' });
  };

  const customShowAlert = (title, message, position = 'top') => {
    setConfirmModalInfo({ 
      show: true, 
      title, 
      message, 
      onConfirm: () => {
        setConfirmModalInfo({ show: false, title: '', message: '', onConfirm: () => {}, position: 'top' });
      }, 
      position 
    });
  };

  // 채팅방 신고 핸들러
  const handleReport = () => {
    setShowReportModal(true);
  };

  // 최초 생성자 조회
  const getOriginalCreator = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.CHAT}/${chatId}/original-creator`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error("[ChatSidebar] 최초 생성자 조회 실패:", error);
      throw error;
    }
  };

  const getMemberRole = (member) => {
    if (member.isCreator === 1) {
      // 최초 생성자인지 확인
      if (originalCreatorId && member.userId === originalCreatorId) {
        return "방장";
      } else {
        return "운영진";
      }
    }
    return null; // 일반 멤버는 역할 표시 안함
  };

  // 신고 제출 핸들러
  const handleReportSubmit = async (reportData) => {
    try {
      console.log("[ChatSidebar] 최초 생성자 조회 시작");
      const originalCreatorId = await getOriginalCreator();
      console.log("[ChatSidebar] 최초 생성자 ID:", originalCreatorId);

      const reportPayload = {
        reporterId: senderId,
        targetUserId: originalCreatorId, // 최초 생성자 받아와서 넣기?
        contentType: "GROUP",
        contentSubtype: info?.groupType,
        contentId: parseInt(info?.groupId),
        reasonCode: reportData.reasonCode,
        reasonText: reportData.reasonText || null
      };

      console.log("[ChatSidebar] 신고 데이터:", reportPayload);
      console.log("[ChatSidebar] Access Token:", accessToken);

      const response = await api.post(`${API_ENDPOINTS.USER}/reports`, reportPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'User-Id': senderId
        }
     });

      if (response.status === 200 || response.status === 201) {
        showAlert("알림", "신고가 접수되었습니다.");
        setShowReportModal(false);
      } else {
        showAlert("오류", "신고 접수에 실패했습니다.");
      }
    } catch (error) {
      console.error("[ChatSidebar] 채팅방 신고 실패:", error);
    
    if (error.response) {
      console.error("응답 데이터:", error.response.data);
      console.error("응답 상태:", error.response.status);
    
      if (error.response.status === 404) {
        showAlert("오류", "신고 API를 찾을 수 없습니다. 관리자에게 문의하세요.");
      } else if (error.response.status === 400) {
        showAlert("오류", "잘못된 신고 데이터입니다.");
      } else {
        showAlert("오류", `신고 처리 중 오류가 발생했습니다. (${error.response.status})`);
      }
    } else {
      showAlert("오류", "신고 처리 중 네트워크 오류가 발생했습니다.");
    }
  }
};

  const handleLeaveGroup = () => {

    if (originalCreatorId && senderId === originalCreatorId) {
      showAlert("알림", "방장은 채팅방을 탈퇴할 수 없습니다.");
      return;
    }

    showConfirmModal("그룹 탈퇴", "정말로 그룹을 탈퇴하시겠습니까?", async () => {
      try {
        await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/members/me`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
  
        const sub = getSubscription(chatId);
        if (sub) {
          sub.unsubscribe();
          console.log(`[ChatSidebar] 채팅방 ${chatId} 구독 해제 완료`);
        }
  
        removeSubscription(chatId);
        showAlert("알림", "채팅방을 성공적으로 탈퇴했습니다.");
        if (onLeave) {
          onLeave();
        }
        onForceClose?.(); // 사이드바 닫기
  
      } catch (error) {
        console.error("[ChatSidebar] 채팅방 탈퇴 실패:", error);
        showAlert("오류", "탈퇴 처리 중 오류가 발생했습니다.");
      }
    }, 'top');
  };

  const handleDeleteChatRoom = () => {
    const confirmMessage = groupType === 'TRAVELMATE' 
      ? "정말로 그룹을 삭제하시겠습니까? 삭제된 그룹은 복구할 수 없습니다."
      : "정말로 채팅방을 삭제하시겠습니까? 삭제된 채팅방은 복구할 수 없습니다.";

    showConfirmModal("채팅방 삭제", confirmMessage, async () => {
      try {

        if (groupType === 'TRAVELINFO') {
          await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelinfo/${info?.groupId}`, {
            headers: {
              'User-Id': senderId,
            },
          });
        } else if (groupType === 'TRAVELMATE') {
          await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/travelmate/${info?.groupId}`, {
            headers: {
              'User-Id': senderId,
            },
          });
        }
        
        const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'User-Id': senderId,
          },
        });

        if (!response.ok) {
          throw new Error(`채팅방 삭제 실패: ${response.status}`);
        }
  
        const sub = getSubscription(chatId);
        if (sub) {
          sub.unsubscribe();
          console.log(`[ChatSidebar] 채팅방 ${chatId} 구독 해제 완료`);
        }
  
        removeSubscription(chatId);
        if (onLeave) {
          onLeave();
        }
        showAlert("알림", "채팅방이 성공적으로 삭제되었습니다.");
        onClose?.();
        onForceClose?.();
        
      } catch (error) {
        console.error("[ChatSidebar] 채팅방 삭제 실패:", error);
        showAlert("오류", "채팅방 삭제 중 오류가 발생했습니다.");
      }
    }, 'top');
  };

  const handleReportTab = (userId) => {
    setSelectedUserId(prev => (prev === userId ? null : userId));
  };

  const promoteToManager = async (userId) => {
    try {
      await api.post(`${API_ENDPOINTS.CHAT}/${chatId}/promote/${userId}`, {});
      await refetch();
      setSelectedUserId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // 강제퇴장 알림을 보내는 함수 추가
  const sendForcedRemovalNotification = async (targetUserId) => {
    try {
      console.log("[ChatSidebar] info 객체:", info);

      const notificationData = {
        userId: targetUserId,                    // 퇴장당한 유저 ID
        groupName: info?.groupName || groupType,  // 그룹/채팅방 이름
        groupId: parseInt(info?.groupId) || 0,   // 그룹 ID
        relatedUrl: `/traveler/my/travelmate`,   // 채팅방 URL
        creatorId: senderId,                     // 강퇴를 실행한 운영진 ID
      };

      console.log("[ChatSidebar] 강제퇴장 알림 데이터:", notificationData);

      // 알림 서비스에 API 호출
      const response = await api.post(`${API_ENDPOINTS.NOTI}/chat/removal`, notificationData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'User-Id': senderId
        }
      });

      if (response.status === 200 || response.status === 201) {
        console.log("[ChatSidebar] 강제퇴장 알림 전송 완료");
      }
    } catch (error) {
      console.error("[ChatSidebar] 강제퇴장 알림 전송 실패:", error);
      // 알림 전송 실패해도 강퇴 자체는 성공했으므로 에러 메시지는 콘솔에만 출력
    }
  };

  const kickUser = (userId) => {
    const targetNickname = getUserNickname(userId);
    showConfirmModal("멤버 내보내기", `정말 ${targetNickname}님을 내보내시겠습니까?`, async () => {
      try {
        await sendForcedRemovalNotification(userId);

        const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/members/${userId}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'User-Id': senderId,
          },
        });
        if (response.ok) {
          await refetch();
          setSelectedUserId(null);
        } else {
        }
      } catch (error) {
        console.error("강퇴 오류:", error);
      }
    });
  };

  const demoteManager = (userId) => {
    const targetNickname = getUserNickname(userId);
    showConfirmModal("운영진 제외", `${targetNickname}님을 운영진에서 제외하시겠습니까?`, async () => {
      try {
        await api.post(`${API_ENDPOINTS.CHAT}/${chatId}/demote/${userId}`);
        await refetch();
        setSelectedUserId(null);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const getButtonTexts = () => {
    const isOriginalCreator = originalCreatorId && senderId === originalCreatorId;
    
    if (groupType === 'TRAVELMATE') {
      return {
        report: '그룹 신고',
        leave: isOriginalCreator ? '그룹 삭제' : '그룹 탈퇴'
      };
    } 
      return {
        report: '채팅방 신고',
        leave: isOriginalCreator ? '채팅방 삭제' : '채팅 탈퇴'
      };
  };

  const buttonTexts = getButtonTexts();

  useEffect(() => {
    const fetchOriginalCreator = async () => {
      try {
        const creatorId = await getOriginalCreator();
        setOriginalCreatorId(creatorId);
      } catch (error) {
        console.error("[ChatSidebar] 최초 생성자 조회 실패:", error);
      }
    };

    if (chatId && accessToken) {
      fetchOriginalCreator();
    }
  }, [chatId, accessToken]);

  // 새 멤버 감지
  useEffect(() => {
    if (!chatId) return;

    // 새 멤버 입장 구독
    subscriptionRef.current = subscribe(`/topic/chat/${chatId}/join`, (message) => {
      console.log("새 멤버 입장 이벤트 수신:", message);
      refetch(); // useChatRoomInfo에서 받은 refetch
    });

    return () => {
      if (subscriptionRef.current) {
        unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [chatId, refetch, subscribe, unsubscribe]);

  return (
    <div
      className={`chat-sidebar-overlay ${!isOpen ? 'hidden' : ''}`}
      onClick={onClose}
      style={{
        top: `${sidebarTopOffset}px`,
        height: `calc(100% - ${sidebarTopOffset}px)` // 높이도 동적으로 조정
      }}
    >
      <div className="chat-sidebar" onClick={e => e.stopPropagation()}> {/* 사이드바 자체 클릭 시 오버레이 닫힘 방지 */}
       <div className="chat-sidebar-content"> 
        <ChatDescriptionEditor
          description={description}
          setDescription={setDescription}
          chatId={chatId}
          isManager={isManager}
          showAlert={customShowAlert}
          refetch={refetch}
        />
        <div className="sidebar-section members-section">
          <h3>멤버들 ({!members || members.length === 0 ? 0 : members.length})</h3>
          {!members || members.length === 0 ? (
            <div>참여 중인 멤버가 없습니다.</div>
          ) : (
          <ul className="member-list">
            {members.map(member => (
              <li key={member.userId} className="member-item">
                <div className="member-profile">
                  <div className="member-avatar"
                    onClick={(e) => handleProfileClick(member.userId, e)}
                    title={`${member.userId}의 프로필 보기`}
                  >
                    <img 
                      src={member.profileImage || defaultProfile} 
                      alt="프로필"
                      onError={(e) => {
                        e.target.src = defaultProfile;
                      }}
                    />
                  </div>
                  <div className="member-info">
                    <div className="member-name-line">
                      <span className="member-nickname">{member.nickname || member.userId}</span>
                      <span className="member-id">{member.userId}</span>
                    </div>
                    {member.isCreator == '1' && <span className="member-role">{getMemberRole(member)}</span>}
                  </div>
                </div>

                {isManager && member.userId !== senderId && (
                  <div className="member-actions">
                    <span 
                      className="member-action-dots"
                      onClick={() => handleReportTab(member.userId)}
                      title="멤버 관리"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                      </svg>
                    </span> 
                    {selectedUserId === member.userId && (
                      <ChatReportTab
                        userId={member.userId} 
                        isManager={member.isCreator === 1}
                        onPromote={promoteToManager}
                        onKick={kickUser}
                        onDemote={demoteManager}
                      />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          )}
        </div>
      </div>
        <div className="sidebar-footer">
          <button className="report-button" onClick={handleReport}>{buttonTexts.report}</button>
          <button 
            className="leave-button" 
            onClick={originalCreatorId && senderId === originalCreatorId ? handleDeleteChatRoom : handleLeaveGroup}
          >
            {buttonTexts.leave}
          </button>
        </div>
      </div>

      <ChatReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
      />
      <ChatAlertModal
        show={confirmModalInfo.show}
        title={confirmModalInfo.title}
        message={confirmModalInfo.message}
        onConfirm={confirmModalInfo.onConfirm}
        onClose={hideConfirmModal}
        onCancel={hideConfirmModal}
        position={confirmModalInfo.position}
      />
    </div>
  );
}
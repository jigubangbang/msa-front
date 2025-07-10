// src/components/chat/ChatSidebar.jsx
import React, { useEffect, useState, useRef } from 'react';
import '../../styles/Chat/ChatSidebar.css'; // 사이드바 전용 CSS 파일
import { useStomp } from '../../hooks/chat/useStomp';
import useChatRoomInfo from '../../hooks/chat/useChatRoomInfo';
import { useChatSubscriptionStore } from '../../hooks/chat/useStomp';
import ChatReportTab from '../../components/chat/ChatReportTab';
import ChatDescriptionEditor from '../../components/chat/ChatDescriptionEditor';
import ReportModal from '../../components/common/Modal/ReportModal';
import ChatAlertModal from '../../components/chat/ChatAlertModal';
import API_ENDPOINTS from '../../utils/constants';
import api from "../../apis/api";
import { getAccessToken } from '../../utils/tokenUtils';

export default function ChatSidebar({ chatId, senderId, isOpen, onClose, chatInfo, onForceClose }) {
  const { subscribe, unsubscribe } = useStomp();
  const { members, loading, error, refetch } = useChatRoomInfo(chatId);
  const { removeSubscription, getSubscription } = useChatSubscriptionStore();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [description, setDescription] = useState(chatInfo?.description || "");
  const [showReportModal, setShowReportModal] = useState(false);

  // 단일 상태로 모든 모달 관리
  const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', onConfirm: null });

  const isManager = members.some(member => member.userId === senderId && member.isCreator === 1);
  const accessToken = getAccessToken();
  const subscriptionRef = useRef(null);

  const hideModal = () => setModalInfo({ show: false, title: '', message: '', onConfirm: null });

  // 확인/취소 버튼이 있는 확인 모달 표시
  const showConfirmModal = (title, message, onConfirm) => {
    setModalInfo({ show: true, title, message, onConfirm });
  };

  // 확인 버튼만 있는 결과 모달 표시
  const showAlert = (title, message) => {
    setModalInfo({ show: true, title, message, onConfirm: null });
  };

  const handleReport = () => setShowReportModal(true);

  const handleReportSubmit = async (reportData) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.CHAT}/${chatId}/report`, {
        reasonCode: reportData.reasonCode,
        reasonText: reportData.reasonText,
      });
      setShowReportModal(false);
      if (response.status === 200 || response.status === 201) {
        showAlert("알림", "신고가 접수되었습니다.");
      } else {
        showAlert("오류", "신고 접수에 실패했습니다.");
      }
    } catch (error) {
      setShowReportModal(false);
      console.error("[ChatSidebar] 채팅방 신고 실패:", error);
      showAlert("오류", "신고 처리 중 오류가 발생했습니다.");
    }
  };

  const handleLeaveGroup = () => {
    showConfirmModal("그룹 탈퇴", "정말로 그룹을 탈퇴하시겠습니까?", async () => {
      try {
        await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/members/me`, {
          method: "DELETE",
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        });
        const sub = getSubscription(chatId);
        if (sub) sub.unsubscribe();
        removeSubscription(chatId);
        showAlert("알림", "채팅방을 성공적으로 탈퇴했습니다.");
        onForceClose?.();
      } catch (error) {
        console.error("[ChatSidebar] 채팅방 탈퇴 실패:", error);
        showAlert("오류", "탈퇴 처리 중 오류가 발생했습니다.");
      }
    });
  };

  const promoteToManager = (userId) => {
    showConfirmModal("운영진 초대", `${userId}님을 운영진으로 초대하시겠습니까?`, async () => {
      try {
        await api.post(`${API_ENDPOINTS.CHAT}/${chatId}/promote/${userId}`, {});
        showAlert("알림", "해당 유저를 관리자로 지정했습니다.");
        await refetch();
        setSelectedUserId(null);
      } catch (err) {
        console.error(err);
        showAlert("오류", "관리자 지정에 실패했습니다.");
      }
    });
  };

  const kickUser = (userId) => {
    showConfirmModal("멤버 내보내기", `정말 ${userId}님을 내보내시겠습니까?`, async () => {
      try {
        await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/members/${userId}`, {
          method: "DELETE",
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'User-Id': senderId },
        });
        showAlert("알림", `${userId}님을 성공적으로 강퇴했습니다.`);
        await refetch();
        setSelectedUserId(null);
      } catch (error) {
        console.error("강퇴 오류:", error);
        showAlert("오류", "강퇴 중 오류가 발생했습니다.");
      }
    });
  };

  const demoteManager = (userId) => {
    showConfirmModal("운영진 제외", `${userId}님을 운영진에서 제외하시겠습니까?`, async () => {
      try {
        await api.post(`${API_ENDPOINTS.CHAT}/${chatId}/demote/${userId}`);
        showAlert("알림", `${userId}님을 운영진에서 제외했습니다.`);
        await refetch();
        setSelectedUserId(null);
      } catch (err) {
        console.error(err);
        showAlert("오류", "운영진 제외에 실패했습니다.");
      }
    });
  };

  useEffect(() => {
    if (!chatId) return;
    subscriptionRef.current = subscribe(`/topic/chat/${chatId}/join`, () => refetch());
    return () => {
      if (subscriptionRef.current) unsubscribe(subscriptionRef.current);
    };
  }, [chatId, refetch, subscribe, unsubscribe]);

  return (
    <div className={`chat-sidebar-overlay ${!isOpen ? 'hidden' : ''}`} onClick={onClose}>
      <div className="chat-sidebar" onClick={e => e.stopPropagation()}>
        <div className="scrollable-content">
          <ChatDescriptionEditor
            description={description}
            setDescription={setDescription}
            chatId={chatId}
            isManager={isManager}
            showAlert={showAlert} // 내부 showAlert 전달
          />
          <div className="sidebar-section members-section">
            <h4>멤버들 ({members?.length || 0})</h4>
            {!members || members.length === 0 ? (
              <div>참여 중인 멤버가 없습니다.</div>
            ) : (
              <ul className="member-list">
                {members.map(member => (
                  <li key={member.userId} className="member-item">
                    <div className="member-profile">
                      <div className="member-avatar">👤</div>
                      <span className="member-nickname">{member.nickname || member.userId}</span>
                      {member.isCreator == '1' && <span className="member-role">(관리자)</span>}
                    </div>
                    {isManager && member.userId !== senderId && (
                      <div className="member-actions">
                        <span className="member-action-dots" onClick={() => setSelectedUserId(prev => (prev === member.userId ? null : member.userId))}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/></svg>
                        </span>
                        {selectedUserId === member.userId && (
                          <ChatReportTab userId={member.userId} isManager={member.isCreator === 1} onPromote={promoteToManager} onKick={kickUser} onDemote={demoteManager} />
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
          <button className="report-button" onClick={handleReport}>채팅방 신고하기</button>
          <button className="leave-button" onClick={handleLeaveGroup}>그룹 탈퇴하기</button>
        </div>
      </div>
      <ReportModal show={showReportModal} onClose={() => setShowReportModal(false)} onSubmit={handleReportSubmit} />
      
      {/* 사이드바 내에서 직접 렌더링하는 단일 모달 */}
      <ChatAlertModal
        show={modalInfo.show}
        title={modalInfo.title}
        message={modalInfo.message}
        onConfirm={modalInfo.onConfirm}
        onClose={hideModal}
        onCancel={hideModal}
        position="top"
      />
    </div>
  );
}
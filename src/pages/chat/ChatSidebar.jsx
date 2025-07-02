// src/components/chat/ChatSidebar.jsx
import React, {useState} from 'react';
import '../../styles/Chat/ChatSidebar.css'; // 사이드바 전용 CSS 파일
import useChatRoomInfo from '../../hooks/Chat/useChatRoomInfo';
import { useChatSubscriptionStore } from '../../hooks/chat/useStomp';
import ChatReportTab from '../../components/chat/ChatReportTab';
import API_ENDPOINTS from '../../utils/constants';

export default function ChatSidebar({ chatId, senderId, isOpen, onClose, chatInfo, onForceClose }) {
  const {members, loading, error} = useChatRoomInfo(chatId);
  const { removeSubscription, getSubscription } = useChatSubscriptionStore();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const isManager = members.some(member => member.userId === senderId && member.isCreator == 1);

  // 로딩 중일 때 보여줄 UI
  if (loading) {
    return <div>멤버 목록을 불러오는 중...</div>;
  }
  // 에러 발생 시 보여줄 UI
  if (error) {
    return <div>에러가 발생했습니다: {error.message}</div>;
  }

  const handleLeaveGroup = async () => {
    const confirmed = window.confirm( "정말로 그룹을 탈퇴하시겠습니까? ");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/members/me`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'User-Id': senderId,
        },
      });

      const sub = getSubscription(chatId);
      if (sub) {
        sub.unsubscribe();
        console.log(`[ChatSidebar] 채팅방 ${chatId} 구독 해제 완료`);
      }

      removeSubscription(chatId);
      alert("채팅방을 성공적으로 탈퇴했습니다.");
      onForceClose?.(); // 사이드바 닫기

    } catch (error) {
      console.error("[ChatSidebar] 채팅방 탈퇴 실패:", error);
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    }
  };

  const handleReportTab = (userId) => {
    setSelectedUserId(prev => (prev === userId ? null : userId));
  };

  return (
    <div
      className={`chat-sidebar-overlay ${!isOpen ? 'hidden' : ''}`}
      onClick={onClose}
    >
      <div className="chat-sidebar" onClick={e => e.stopPropagation()}> {/* 사이드바 자체 클릭 시 오버레이 닫힘 방지 */}
        <div className="sidebar-header">
          <h3>채팅방 정보</h3>
          <button className="close-button" onClick={onClose}>X</button>
        </div>

        <div className="sidebar-section chat-info-section">
          <h4>채팅방 설명</h4>
          <p>{chatInfo?.description || "채팅방 설명이 나오는 부분입니다."}</p>
          {isManager == '1' && ( // 방장일 경우에만 '수정하기' 버튼 표시
            <button className="edit-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
              </svg>
            </button>
          )}
        </div>

        <div className="sidebar-section members-section">
          <h4>멤버들 ({!members || members.length === 0 ? 0 : members.length})</h4>
          {!members || members.length === 0 ? (
            <div>참여 중인 멤버가 없습니다.</div>
          ) : (
          <ul className="member-list">
            {members.map(member => (
              <li key={member.userId} className="member-item">
                <div className="member-profile">
                  <div className="member-avatar">👤</div>
                  <span className="member-nickname">{member.nickname || member.userId}</span>
                  {member.isCreator == '1' && <span className="member-role">(방장)</span>}
                </div>
                {isManager && member.userId !== senderId && ( // 방장이고 내 자신이 아닌 경우에만 메뉴 표시
                  <div className="member-actions">
                    <span className="member-action-dots" onClick={() => handleReportTab(member.userId)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                      </svg>
                    </span> 
                    {selectedUserId === member.userId && (
                      <ChatReportTab
                        onReport={() => alert(`${selectedUserId} 신고`)}
                        onPromote={() => alert(`${selectedUserId}를 관리자 승격`)}
                        onKick={() => alert(`${selectedUserId} 추방`)}
                      />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          )}
        </div>

        <div className="sidebar-footer">
          <button className="report-button">채팅방 신고하기</button>
          <button className="leave-button" onClick={handleLeaveGroup}>그룹 탈퇴하기</button>
        </div>
      </div>
    </div>
  );
}
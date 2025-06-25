// src/components/Chat/ChatSidebar.jsx
import React from 'react';
import '../../styles/Chat/ChatSidebar.css'; // 사이드바 전용 CSS 파일

export default function ChatSidebar({ isOpen, onClose, chatInfo, members }) {
  if (!isOpen) return null; // isOpen이 false면 아무것도 렌더링하지 않음

  return (
    <div className="chat-sidebar-overlay" onClick={onClose}> {/* 오버레이 클릭 시 닫기 */}
      <div className="chat-sidebar" onClick={e => e.stopPropagation()}> {/* 사이드바 자체 클릭 시 오버레이 닫힘 방지 */}
        <div className="sidebar-header">
          <h3>채팅방 정보</h3>
          <button className="close-button" onClick={onClose}>X</button>
        </div>

        <div className="sidebar-section chat-info-section">
          <h4>채팅방 설명</h4>
          <p>{chatInfo.description || "채팅방 설명이 나오는 부분입니다."}</p>
          {chatInfo.isManager && ( // 방장일 경우에만 '수정하기' 버튼 표시
            <button className="edit-button">수정하기</button>
          )}
        </div>

        <div className="sidebar-section members-section">
          <h4>멤버들 ({members.length})</h4>
          <ul className="member-list">
            {members.map(member => (
              <li key={member.id} className="member-item">
                <div className="member-profile">
                  <div className="member-avatar">👤</div>
                  <span className="member-nickname">{member.nickname}</span>
                  {member.isManager && <span className="member-role">(방장)</span>}
                </div>
                {chatInfo.isManager && !member.isMine && ( // 방장이고 내 자신이 아닌 경우에만 메뉴 표시
                  <div className="member-actions">
                    <span className="member-action-dots">&#x22EE;</span> {/* 메뉴 아이콘 */}
                    {/* 여기에 추가 메뉴 (신고하기, 관리자로 추가/만들기) */}
                    {/* 실제로는 클릭 시 팝업 등을 띄우는 로직이 필요 */}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-footer">
          <button className="report-button">채팅방 신고하기</button>
          <button className="leave-button">채팅방 나가기</button>
        </div>
      </div>
    </div>
  );
}
// src/components/chat/ChatReportTab.jsx
import React from 'react';
import '../../styles/Chat/ChatReportTab.css';

export default function ChatReportTab({ userId, isManager, onPromote, onKick, onDemote }) {
  return (
    <div className="chat-report-tab">
      {isManager ? (
        <button className="report-option" onClick={() => onDemote(userId)}>운영진 제외</button>
      ) : (
        <>
          <button className="report-option" onClick={() => onPromote?.(userId)}>운영진 초대</button>
          <button className="report-option" onClick={() => onKick?.(userId)}>내보내기</button>
        </>
      )}
    </div>
  );
}
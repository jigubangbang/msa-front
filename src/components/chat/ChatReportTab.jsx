// src/components/chat/ChatReportTab.jsx
import React from 'react';
import '../../styles/chat/ChatReportTab.css';

export default function ChatReportTab({ onReport, onPromote, onKick }) {
  return (
    <div className="chat-report-tab">
      <button className="report-option" onClick={onReport}>신고하기</button>
      <button className="report-option" onClick={onPromote}>관리자로 만들기</button>
      <button className="report-option" onClick={onKick}>추방하기</button>
    </div>
  );
}
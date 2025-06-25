// src/components/Chat/ChatModal.jsx
import React, {useEffect} from 'react';
import ReactDOM from 'react-dom'; // Portal을 사용하기 위해 필요
import ChatPanel from './ChatPanel'; // 기존 채팅 패널 컴포넌트
import { joinChat } from '../../hooks/Chat/joinChat';
import '../../styles/Chat/ChatModal.css'

export default function ChatModal({ isOpen, onClose, chatId, senderId }) {
  const { isJoining, joinError, chatGroup, resetChatState } = joinChat(chatId, isOpen);

  // 모달이 닫힐 때 채팅 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      resetChatState();
    }
  }, [isOpen, resetChatState]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetChatState();
    onClose();
  };

  // Portal을 사용하여 body 바로 아래에 렌더링
  return ReactDOM.createPortal(
    <div className="chat-modal-overlay" onClick={handleClose}>
      {/* 모달 내용 컨테이너: 오버레이 클릭 시 닫히는 것을 방지 */}
      <div className="chat-modal-content" onClick={e => e.stopPropagation()}>
         {/* 로딩 상태 표시 */}
        {isJoining && (
          <div className="chat-loading">
            <p>채팅방에 입장 중...</p>
          </div>
        )}
        
        {/* 에러 상태 표시 */}
        {joinError && (
          <div className="chat-error">
            <p>채팅방 입장에 실패했습니다.</p>
            <p>{joinError.message}</p>
          </div>
        )}
        
        {/* 채팅방 입장 성공 시 채팅 패널 표시 */}
        {chatGroup && !isJoining && !joinError && (
          <ChatPanel chatId={chatId} senderId={senderId}chatGroup={chatGroup}/>
        )}
        
        {/* 모달 닫기 버튼 */}
        <button className="modal-close-button" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>,
    document.body // body 태그에 렌더링
  );
}
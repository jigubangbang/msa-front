// src/components/chat/ChatModal.jsx
import React, {useEffect} from 'react';
import ReactDOM from 'react-dom'; // Portal을 사용하기 위해 필요
import ChatPanel from './ChatPanel.jsx';
import { joinSock } from '../../hooks/chat/joinSock.js';
import '../../styles/chat/ChatModal.css'

export default function ChatModal({ isOpen, onClose, chatId }) {
  const { senderId, messages, sendMessage, isLoading, chatError, isJoining, unsubscribeChatRoom } = joinSock(isOpen, chatId);

  // 모달이 닫힐 때 채팅 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      console.log("[ChatModal] Modal is closing.");
      unsubscribeChatRoom?.();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  // Portal을 사용하여 body 바로 아래에 렌더링
  return ReactDOM.createPortal(
    <div className="chat-modal-overlay" onClick={handleClose}>
      {/* 모달 내용 컨테이너: 오버레이 클릭 시 닫히는 것을 방지 */}
      <div className="chat-modal-content" onClick={e => e.stopPropagation()}>
         {/* 로딩 상태 표시 */}
        {(isLoading || isJoining) && (
          <div className="chat-loading">
            <p>채팅방에 입장 중...</p>
          </div>
        )}
        
        {/* 에러 상태 표시 */}
        {chatError && (
          <div className="chat-error">
            <p>채팅방 입장에 실패했습니다.</p>
            <p>{chatError.message}</p>
          </div>
        )}
        
        {/* 채팅방 입장 성공 시 채팅 패널 표시 */}
        {!(isLoading || isJoining) && !chatError && (
          <ChatPanel
            chatId={chatId}
            senderId={senderId}
            // chatGroup={chatGroup} // chatGroup이 joinSock 훅에서 반환되지 않으므로 제거 또는 추가 필요
            messages={messages}
            onSendMessage={sendMessage}
            onClose={onClose}
            onForceClose={onClose}
          />
        )}
        
      </div>
    </div>,
    document.body // body 태그에 렌더링
  );
}
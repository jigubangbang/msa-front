// src/components/chat/ChatModal.jsx
import React, {useEffect, useState, useRef} from 'react';
import ReactDOM from 'react-dom'; // Portal을 사용하기 위해 필요
import ChatPanel from './ChatPanel.jsx';
import { joinSock } from '../../hooks/chat/joinSock.js';
import '../../styles/chat/ChatModal.css'

export default function ChatModal({ isOpen, onClose, chatId }) {
  const { senderId, messages, sendMessage, isLoading, chatError, isJoining, unsubscribeChatRoom } = joinSock(isOpen, chatId);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const panelRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  // 채팅창 이동 이벤트 핸들러
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging.current) return;
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    };

    const handleMouseUp = () => {
      dragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startDragging = (e) => {
    if (!panelRef.current) return;
    dragging.current = true;
    const rect = panelRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

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
    <div className="chat-modal-overlay">
      <div className="chat-modal-content"
        onMouseDown={startDragging}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: 'move',
        }}>

        {(isLoading || isJoining) && (
          <div className="chat-loading">
            <p>채팅방에 입장 중...</p>
          </div>
        )}
        {chatError && (
          <div className="chat-error">
            <p>채팅방 입장에 실패했습니다.</p>
            <p>{chatError.message}</p>
          </div>
        )}
        
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
    document.body
  );
}
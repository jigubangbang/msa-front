// src/components/chat/ChatModal.jsx
import React, {useEffect, useState, useRef} from 'react';
import ReactDOM from 'react-dom';
import { MutatingDots } from 'react-loader-spinner';
import ChatPanel from './ChatPanel.jsx';
import { joinSock } from '../../hooks/chat/joinSock.js';
import ChatAlertModal from '../../components/chat/ChatAlertModal.jsx'; // 수정된 모달 임포트
import '../../styles/chat/ChatModal.css'

export default function ChatModal({ isOpen, onClose, chatId }) {
  const [alertInfo, setAlertInfo] = useState({ show: false, title: '', message: '' });

  const showAlert = (title, message) => {
    setAlertInfo({ show: true, title, message });
  };

  const hideAlert = () => {
    setAlertInfo({ show: false, title: '', message: '' });
  };

  const {
    senderId,
    nickname,
    messages,
    setMessages,
    sendMessage,
    isLoading,
    chatError,
    isJoining,
    isKicked,
    unsubscribeChatRoom
  } = joinSock(isOpen, chatId, showAlert); // showAlert 함수를 joinSock에 전달

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
    // 모달창 내부의 클릭은 드래그 시작하지 않도록
    if (e.target.closest('.draggable-modal-content')) return;
    if (!panelRef.current) return;
    dragging.current = true;
    const rect = panelRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // 강제 퇴장 모달 닫기
  useEffect(() => {
    if (isKicked) {
      console.log("[ChatModal] 강제 퇴장으로 모달 닫기");
      // showAlert에서 모달을 띄우고, 사용자가 확인을 누르면 onClose가 호출되도록 수정
      // 여기서는 onClose()를 직접 호출하지 않음
    }
  }, [isKicked])

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
    <>
      {(isLoading || isJoining) ? (
        <div className="chat-loading-overlay">
          <div className="loadingContainer">
            <MutatingDots />
          </div>
          <div className="chat-loading-text">입장 중입니다...</div>
        </div>
      ) : (
        <div className="chat-modal-overlay" onMouseDown={startDragging}>
          <div
            className="chat-modal-content draggable-modal-content"
            ref={panelRef} // ref를 여기에 할당
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              cursor: 'move',
            }}>
            {chatError && (
              // chatError 발생 시 바로 알림 모달을 띄우도록 수정
              showAlert("오류", "채팅방 입장에 실패하였습니다.\n" + chatError.message)
            )}
            {!chatError && (
              <ChatPanel
                chatId={chatId}
                nickname={nickname}
                senderId={senderId}
                messages={messages}
                setMessages={setMessages}
                onSendMessage={sendMessage}
                onClose={onClose}
                onForceClose={onClose}
                showAlert={showAlert} // ChatPanel에 showAlert 전달
              />
            )}
            <ChatAlertModal
              show={alertInfo.show}
              title={alertInfo.title}
              message={alertInfo.message}
              onClose={() => {
                hideAlert();
                if (isKicked || chatError) {
                  onClose(); // 강퇴 또는 입장 에러 시 모달 닫고 채팅방도 닫기
                }
              }}
            />
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
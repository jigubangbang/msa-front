// src/components/chat/ChatModal.jsx
import React, {useEffect, useState, useRef} from 'react';
import ReactDOM from 'react-dom';
import { MutatingDots } from 'react-loader-spinner';
import ChatPanel from './ChatPanel.jsx';
import { joinSock } from '../../hooks/chat/joinSock.js';
import useChatRoomInfo from '../../hooks/Chat/useChatRoomInfo';
import ChatAlertModal from '../../components/chat/ChatAlertModal.jsx'; // 수정된 모달 임포트
import defaultProfile from '../../assets/default_profile.png';
import exit from '../../assets/chat/logout.svg';
import '../../styles/chat/ChatModal.css'

export default function ChatModal({ isOpen, onClose, chatId, currentUserId }) {
  const [alertInfo, setAlertInfo] = useState({ show: false, title: '', message: '' });
  const [isMinimized, setIsMinimized] = useState(false);

  const showAlert = (title, message) => {
    setAlertInfo({ show: true, title, message });
  };

  const hideAlert = () => {
    setAlertInfo({ show: false, title: '', message: '' });
  };

  const {senderId, nickname, messages, setMessages, sendMessage, isLoading, chatError, isJoining, isKicked, unsubscribeChatRoom} 
    = joinSock(isOpen, chatId, showAlert, currentUserId);

  const {info, members} = useChatRoomInfo(chatId);

  // 최소화된 채팅창 컴포넌트
  const MinimizedChat = () => {
    const lastMessage = messages[messages.length - 1];
    const isSystemMessage = lastMessage && (lastMessage.senderId === 'System' || lastMessage.nickname === 'System');
    const senderProfile = members?.find(member => 
        member.userId === lastMessage?.senderId || member.nickname === lastMessage?.nickname
      )?.profileImage;

    return (
      <div className="minimized-chat" onClick={() => setIsMinimized(false)}>
        <div className="minimized-chat-content">
          <div className="minimized-chat-header">
            <h3 className="minimized-chat-header-title">
              {info?.groupType || `Room ${chatId}`}
            </h3>
            <button 
              className="minimized-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <img src={exit} alt="채팅방나가기"/>
            </button>
          </div>
          <div className="minimized-chat-body">
            {messages.length > 0 && lastMessage ? (
              isSystemMessage ? (
                <div className="minimized-system-message">
                  <span className="minimized-system-text">
                    {lastMessage.message?.substring(0, 30)}
                    {lastMessage.message?.length > 30 ? '...' : ''}
                  </span>
                </div>
              ) : (
                <div className="minimized-message-row">
                  <div className="minimized-profile-area">
                    <div className="minimized-avatar">
                      <img 
                        src={senderProfile || defaultProfile} 
                        alt="프로필"
                        onError={(e) => {
                          e.target.src = defaultProfile; // 이미지 로드 실패 시 기본 이미지
                        }}
                      />
                    </div>
                  </div>
                  <div className="minimized-message-content">
                    <span className="minimized-chat-nickname">
                      {lastMessage.nickname || lastMessage.senderId}
                    </span>
                    <span className="minimized-last-message">
                      {lastMessage.message?.substring(0, 20)}
                      {lastMessage.message?.length > 20 ? '...' : ''}
                    </span>
                  </div>
                </div>
              )
            ) : (
              <div className="minimized-no-messages">
                <span className="minimized-chat-nickname">{nickname}</span>
                <span className="minimized-last-message">메시지가 없습니다.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }; // 최소화 상태 추가

  // 강제 퇴장 모달 닫기
  useEffect(() => {
    if (isKicked) {
      console.log("[ChatModal] 강제 퇴장으로 모달 닫기");
    }
  }, [isKicked])

  // 모달이 닫힐 때 채팅 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      console.log("[ChatModal] Modal is closing.");
      unsubscribeChatRoom?.();
      setIsMinimized(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  return ReactDOM.createPortal(
    <>
     {(isLoading || isJoining) ? (
        <div className="chat-loading-overlay">
          <div className="loadingContainer">
            <MutatingDots />
          </div>
          <div className="chat-loading-text">입장 중입니다...</div>
        </div>
      ) : isMinimized ? (
      <>
        <MinimizedChat />
        <ChatAlertModal
          show={alertInfo.show}
          title={alertInfo.title}
          message={alertInfo.message}s
          onClose={() => {
            hideAlert();
            if (isKicked || chatError) {
              onClose();
            }
          }}
        />
      </>
    ) : (
        <div className="chat-modal-overlay">
          <div className="chat-modal-content">
            {chatError && (
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
                onMinimize={() => setIsMinimized(true)} // 최소화 콜백
                onRestore={() => setIsMinimized(false)} // 복원 콜백
                onForceClose={onClose}
                showAlert={showAlert} // ChatPanel에 showAlert 전달
                isMinimized={isMinimized}
                members={members}
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
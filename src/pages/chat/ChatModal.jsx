// src/components/chat/ChatModal.jsx
import React, {useEffect, useState, useRef} from 'react';
import ReactDOM from 'react-dom';
import { Circles } from 'react-loader-spinner';
import ChatPanel from './ChatPanel.jsx';
import { useChatContext } from '../../utils/ChatContext.jsx';
import { joinSock } from '../../hooks/Chat/joinSock.js';
import useChatRoomInfo from '../../hooks/Chat/useChatRoomInfo';
import ChatAlertModal from '../../components/chat/ChatAlertModal.jsx'; // 수정된 모달 임포트
import defaultProfile from '../../assets/default_profile.png';
import exit from '../../assets/chat/logout.svg';
import '../../styles/Chat/ChatModal.css'


export default function ChatModal({ isOpen, onClose, chatId, currentUserId, onLeave}) {
  
  const { getMinimizedPosition, minimizeChat, restoreChat, minimizedChats, updateChatRoom } = useChatContext();
  const {info, members} = useChatRoomInfo(chatId);
  const [alertInfo, setAlertInfo] = useState({ show: false, title: '', message: '' });
  const [forceUpdate, setForceUpdate] = useState(0);
  const { chatRooms } = useChatContext();
  const isMinimized = chatRooms[chatId]?.isMinimized || false;

  const showAlert = (title, message) => {
    setAlertInfo({ show: true, title, message });
  };

  const hideAlert = () => {
    setAlertInfo({ show: false, title: '', message: '' });
  };

  const {senderId, nickname, messages, setMessages, sendMessage, isLoading, chatError, isJoining, isKicked, unsubscribeChatRoom} 
    = joinSock(isOpen, chatId, showAlert, currentUserId, onClose);

  const handleMinimize = () => {
    console.log(`[ChatModal] 최소화: ${chatId}`);
    minimizeChat(chatId);
  };

  const handleRestore = () => {
    console.log(`[ChatModal] 복원: ${chatId}`);
    restoreChat(chatId);
  }

  useEffect(() => {
    if (isMinimized) {
      const currentIndex = minimizedChats.indexOf(chatId);
      const currentPosition = currentIndex * 130;
      console.log(`[ChatModal] ${chatId} 위치 업데이트: index=${currentIndex}, position=${currentPosition}px`);
      console.log(`[ChatModal] 현재 최소화 목록:`, minimizedChats);

      setForceUpdate(prev => prev + 1);
    }
  }, [minimizedChats, chatId, isMinimized]);

  // 채팅방 정보 업데이트
  useEffect(() => {
    if (isOpen && info) {
      updateChatRoom(chatId, {
        info,
        members,
        messages,
        nickname,
        senderId,
        isOpen: true
      });
    }
  }, [isOpen, info, members, messages, nickname, senderId, chatId, updateChatRoom]);

  // 최소화된 채팅창 컴포넌트
  const MinimizedChat = () => {
  const lastMessage = messages[messages.length - 1];
  const isSystemMessage = lastMessage && (lastMessage.senderId === 'System' || lastMessage.nickname === 'System');
  const senderProfile = members?.find(member => 
      member.userId === lastMessage?.senderId || member.nickname === lastMessage?.nickname
    )?.profileImage;

  const position = getMinimizedPosition(chatId);
  const zIndexValue = 1000 + minimizedChats.length - minimizedChats.indexOf(chatId);
  
  console.log(`[MinimizedChat] ${chatId} 위치: ${position}px, z-index: ${zIndexValue}`);

    return (
      <div 
        key={forceUpdate}
        className="minimized-chat" 
        style={{
          bottom: `${20 + position}px`,
          zIndex: zIndexValue,
          position: 'fixed',
          right: '20px'
        }}
        onClick={handleRestore}
      >
        <div className="minimized-chat-content">
          <div className="minimized-chat-header">
            <h3 className="minimized-chat-header-title">
              { info?.groupName || info?.groupType || `Room ${chatId}`}
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
     if (unsubscribeChatRoom) {
        try {
          unsubscribeChatRoom();
        } catch (error) {
          console.error("[ChatModal] unsubscribe 에러:", error);
        }
      }
      if (isMinimized) {
        restoreChat(chatId);
      }
    }
  }, [isOpen, unsubscribeChatRoom]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
     {(isLoading || isJoining) ? (
        <div className="chat-loading-overlay" style={{zIndex: 3000}}>
          <div className="loadingContainer">
            <Circles color = "#000"/>
          </div>
        </div>
      ) : isMinimized ? (
      <>
        <MinimizedChat />
        <ChatAlertModal
          show={alertInfo.show}
          title={alertInfo.title}
          message={alertInfo.message}
          onClose={() => {
            hideAlert();
            if (isKicked || chatError) {
              onClose();
            }
          }}
        />
      </>
    ) : (
        <div 
          className="chat-modal-overlay"
        >
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
                onMinimize={handleMinimize}
                onRestore={handleRestore}
                onForceClose={onClose}
                showAlert={showAlert} // ChatPanel에 showAlert 전달
                isMinimized={isMinimized}
                members={members}
                onLeave={onLeave}
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
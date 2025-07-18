// /src/components/chat/ChatPanel.jsx
import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { ThemeContext } from '../../utils/themeContext';
import ChatSidebar from './ChatSidebar';
import menu_vert_white from '../../assets/common/more_vert_white.svg';
import menu_horiz_white from '../../assets/common/more_horiz_white.svg';
import minimize from '../../assets/chat/hide.svg';
import defaultProfile from '../../assets/default_profile.png';
import '../../styles/Chat/ChatPanel.css'
import useChatRoomInfo from '../../hooks/Chat/useChatRoomInfo';

export default function ChatPanel({ chatId, senderId, nickname, messages, setMessages, onSendMessage, 
    onClose, onMinimize, onForceClose, showAlert, members, onLeave }) {
  
  const { isDark, setIsDark } = useContext(ThemeContext);

  const [input, setInput] = useState('');
  // 인코딩 관리
  const [isComposing, setIsComposing] = useState(false);

  const messagesEndRef = useRef(null);
  const chatMessagesDisplayRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [isSidebar, setIsSidebar] = useState(false);
  const {info} = useChatRoomInfo(chatId);

  /*
  // 전체 화면 다크모드 할 시
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDark]);
  */

  // 인코딩 관리 후, 메세지 전송
  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  const handleCompositionEnd = () => {
    setIsComposing(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isComposing) {
      handleSubmit(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages, isScrolledToBottom]);

  const handleSidebar = () => {
    setIsSidebar(prev => !prev);  // 토글 방식으로 변경
  };

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = chatMessagesDisplayRef.current;
    // 현재 스크롤 위치가 맨 아래로부터 1px 이내인지 확인 (오차 범위 설정)
    if (scrollHeight - scrollTop <= clientHeight + 1) {
      setIsScrolledToBottom(true);
    } else {
      setIsScrolledToBottom(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 강제 퇴장 멤버 메세지 전송 차단
    const kickedStatus = localStorage.getItem(`kicked:${chatId}`) === 'true';
    if (kickedStatus) {
      showAlert("알림", "강제 퇴장되셨습니다. 메시지를 전송할 수 없습니다.");
      return;
    }

    if (isComposing) {
      console.log('IME 조합 중이므로 전송 차단');
      return;
    }

    if(input.trim()) {
      onSendMessage(input);
      setInput('');
      setIsComposing(false);
    }
  }

  const handleTheme = () => {
    setIsDark(!isDark);
  }

  const handleMinimize = () => {
    onMinimize();
  };

  const isKicked = localStorage.getItem(`kicked:${chatId}`) === 'true';
  
  return (
    <div className={`chat-panel-container ${isDark ? 'dark-mode' : ''}`}>
      <div className="chat-header">
        <div className="chat-minimize-button" onClick={handleMinimize}>
          <img src={minimize} alt="화면축소"/>
        </div>
        <h2>{info?.groupName || info?.groupType || `Room ${chatId}`}</h2>
        <div 
          className="chat-header-menu"
          onClick={handleSidebar}
        >
         {isSidebar ? (
            <img src={menu_horiz_white} alt="사이드바"/>
          ) : (
            <img src={menu_vert_white} alt="사이드바"/>
          )}
        </div>
      </div>
      <div className='chat-body-wrapper'>
        <div 
          className="chat-messages-display"
          ref={chatMessagesDisplayRef}
          onScroll={handleScroll}
        >
          {Array.isArray(messages) && messages.map((msg, index) => {
            const isMine = msg.nickname === nickname;
            const isSystem = msg.senderId === 'System' || msg.nickname === 'System';

            return (
              <div 
                key={index}
                className={`message-row ${
                    isSystem ? 'system-message-row' : isMine ? 'my-message-row' : 'other-message-row'
                  }`}
                >
                  {isSystem ? (
                    <div className="system-message">{msg.message}</div>
                  ) : (
                    <>
                  {!isMine && ( // 상대방 메시지일 때만 아바타와 닉네임 표시
                    <div className="profile-area">
                      {/* 실제 아바타 이미지 대신 임시 아이콘 사용 */}
                      <div className="avatar">
                        <img 
                          src={
                            members?.find(member => 
                              member.userId === msg.senderId || 
                              member.nickname === msg.nickname
                            )?.profileImage || defaultProfile
                          } 
                          alt="프로필"
                          onError={(e) => {
                            e.target.src = defaultProfile;
                          }}
                        />
                      </div>
                      <span className="nickname">{msg.nickname || msg.senderId}</span>
                    </div>
                  )}
                <div
                  className={`chat-message-bubble ${isMine ? 'my-message' : 'other-message'}`}
                >
                  <p className="message-text">{msg.message}</p>
                    <span className="timestamp">{msg.createdAt ? new Date(msg.createdAt + 'Z').toLocaleTimeString() : ''}</span>
                </div>
              </>
              )}
            </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="chat-input-area">
          <div onClick={handleTheme} className='theme-button'>
          { !isDark && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-brightness-low-fill" viewBox="0 0 16 16">
              <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8.5 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 11a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m5-5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m-11 0a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9.743-4.036a.5.5 0 1 1-.707-.707.5.5 0 0 1 .707.707m-7.779 7.779a.5.5 0 1 1-.707-.707.5.5 0 0 1 .707.707m7.072 0a.5.5 0 1 1 .707-.707.5.5 0 0 1-.707.707M3.757 4.464a.5.5 0 1 1 .707-.707.5.5 0 0 1-.707.707"/>
            </svg>
            )}
            { isDark && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-brightness-low" viewBox="0 0 16 16">
              <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8m.5-9.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 11a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m5-5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m-11 0a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9.743-4.036a.5.5 0 1 1-.707-.707.5.5 0 0 1 .707.707m-7.779 7.779a.5.5 0 1 1-.707-.707.5.5 0 0 1 .707.707m7.072 0a.5.5 0 1 1 .707-.707.5.5 0 0 1-.707.707M3.757 4.464a.5.5 0 1 1 .707-.707.5.5 0 0 1-.707.707"/>
            </svg>
            )}
          </div>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={isKicked ? "강제 퇴장되어 메시지를 보낼 수 없습니다." : "메세지를 입력하세요..."}
            className="chat-input"
            disabled={isKicked}
          />
          <button type="submit" className="chat-send-button" disabled={isKicked}>
            Send
          </button>
        </form>
      </div>

     {isSidebar && (
      <ChatSidebar
        chatId={chatId}
        senderId={senderId}
        nickname={nickname}
        onClose={handleSidebar}
        chatInfo={info}
        onForceClose={onForceClose}
        showAlert={showAlert}
        isDark={isDark}
        onLeave={onLeave}
      />
     )}

    </div>
  );
}

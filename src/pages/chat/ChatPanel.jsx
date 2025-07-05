// /src/components/chat/ChatPanel.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../../utils/themeContext';
import { kickSock } from '../../hooks/chat/kickSock.js';
import ChatSidebar from './ChatSideBar';
import '../../styles/chat/ChatPanel.css'
import useChatRoomInfo from '../../hooks/Chat/useChatRoomInfo';

export default function ChatPanel({ chatId, senderId, messages, setMessages, onSendMessage, onClose, onForceClose }) {
  
  const { isDark, setIsDark } = useContext(ThemeContext);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null); // Ref for auto-scrolling
  const chatMessagesDisplayRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [isSidebar, setIsSidebar] = useState(false);
  const {info} = useChatRoomInfo(chatId);
  const [isKicked, setIsKicked] = useState(false);
  kickSock(chatId, senderId, setIsKicked, setMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDark]);
  
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
    if (kickedStatus || isKicked) {
      alert("강제 퇴장되셨습니다. 메시지를 전송할 수 없습니다.");
      return;
    }
    if(input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  }

  const handleTheme = () => {
    setIsDark(!isDark);
  }

  return (
    <div className="chat-panel-container" style={{
          backgroundColor: isDark ? '#242424' : '#f9f9f9',
          color: isDark ? '#f9f9f9' : '#242424'
      }}>
      <div className="chat-header">
        <div className="chat-close-button" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" fill="currentColor" className="bi bi-box-arrow-left" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
            <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
          </svg>
        </div>
        <h2>{info?.groupType || `Room ${chatId}`}</h2>
        <div 
          className="chat-header-menu"
          onClick={handleSidebar}
        >
         {isSidebar ? (
            // 사이드바 열려 있으면 X 아이콘
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 011.708 0L8 6.293l1.646-1.647a.5.5 0 01.708.708L8.707 7l1.647 1.646a.5.5 0 01-.708.708L8 7.707l-1.646 1.647a.5.5 0 01-.708-.708L7.293 7 5.646 5.354a.5.5 0 010-.708z"/>
            </svg>
          ) : (
            // 사이드바 닫혀 있으면 햄버거 아이콘
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
            </svg>
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
            const isMine = msg.senderId === senderId;
            const isSystem = msg.senderId === 'System';

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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                        </svg>
                      </div>
                      <span className="nickname">{msg.senderId || 'Unknown'}</span>
                    </div>
                  )}
                <div
                  className={`chat-message-bubble ${isMine ? 'my-message' : 'other-message'}`}
                >
                  <p className="message-text">{msg.message}</p>
                  <span className="timestamp">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}</span>
                </div>
              </>
              )}
            </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="chat-input-area" style={{
          backgroundColor: isDark ? '#242424' : '#f9f9f9',
          color: isDark ? '#f9f9f9' : '#242424'
        }}>
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
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
            placeholder={isKicked ? "강제 퇴장되어 메시지를 보낼 수 없습니다." : "메세지를 입력하세요..."}
            className="chat-input"
            disabled={isKicked}
          />
        <button type="submit" className="chat-send-button" disabled={isKicked}>Send</button>
        </form>
      </div>

     {isSidebar && (
      <ChatSidebar
        chatId={chatId}
        senderId={senderId}
        onClose={handleSidebar}
        chatInfo={info}
        onForceClose={onForceClose}
      />
     )}

    </div>
  );
}

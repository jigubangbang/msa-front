// /src/components/Chat/ChatPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
// import useChat from '../../hooks/Chat/useChat';
import ChatSidebar from './ChatSideBar';
import '../../styles/Chat/ChatPanel.css'

export default function ChatPanel({ chatId, senderId, messages, onSendMessage, onClose }) {
  // const { messages, postMessage } = useChat(chatId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null); // Ref for auto-scrolling
  const chatMessagesDisplayRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [isSidebar, setIsSidebar] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages, isScrolledToBottom]);

  const handleSidebar = () => {
    /*
    if (!isSidebar) {
      setIsSidebar(true);
    } else {
      setIsSidebar(false);
    }
    */
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

  // 폴링 메세지 전송
  /*
  const handleSend = () => {
    if (!input.trim()) return;
    postMessage(senderId, input);
    setInput('');
  };
  */

  // 웹소켓 메세지 전송
  const handleSubmit = (e) => {
    e.preventDefault();
    if(input.trim()) {
      onSendMessage(input); // 부모로부터 받은 메세지 전송 함수 호출
      setInput('');
    }
  }

  // 임시 데이터 (실제로는 서버에서 가져와야 함)
  const tempChatInfo = {
    description: "다이빙 동호회 회원들을 위한 대화방입니다. 즐거운 다이빙!",
    isManager: senderId === 'aaa'
  };
  const tempMembers = [
    { id: 'ccc', nickname: '세라', isManager: false, isMine: true },
    { id: 'bbb', nickname: '비비비', isManager: true }, // 방장
    { id: 'aaa', nickname: '아아아', isManager: false },
    { id: 'ddd', nickname: '디디디', isManager: false },
  ].map(member => ({ ...member, isMine: member.id === senderId })); // isMine 추가

  return (
    <div className="chat-panel-container">
      <div className="chat-header">
        <div 
          className="chat-header-menu"
          onClick={handleSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
          </svg>
        </div>
        <h2>Chat Room {chatId}</h2>
        <button className="close-button" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="29" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
            <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
          </svg>
        </button>
      </div>
      <div 
        className="chat-messages-display"
        ref={chatMessagesDisplayRef}
        onScroll={handleScroll}
      >
        {Array.isArray(messages) && messages.map((msg, index) => {
          const isMine = msg.senderId === senderId;
          return (
            <div 
              key={index}
              className={`message-row ${msg.senderId === senderId ? 'my-message-row' : 'other-message-row'}`}
            >
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
          </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
          placeholder="Type a message..."
          className="chat-input"
        />
      <button type="submit" className="chat-send-button">Send</button>
      </form>

      <ChatSidebar
        isOpen={isSidebar}
        onClose={handleSidebar}
        chatInfo={tempChatInfo}
        members={tempMembers}
      />

    </div>
  );
}

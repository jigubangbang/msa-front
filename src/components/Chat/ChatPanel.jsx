// /src/components/Chat/ChatPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import useChat from '../../hooks/Chat/useChat';
import '../../styles/Chat/ChatPanel.css'

export default function ChatPanel({ chatId = 1, senderId = 'ccc' }) {
  const { messages, postMessage } = useChat(chatId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null); // Ref for auto-scrolling
  const chatMessagesDisplayRef = useRef(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages, isScrolledToBottom]);

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = chatMessagesDisplayRef.current;
    // 현재 스크롤 위치가 맨 아래로부터 1px 이내인지 확인 (오차 범위 설정)
    if (scrollHeight - scrollTop <= clientHeight + 1) {
      setIsScrolledToBottom(true);
    } else {
      setIsScrolledToBottom(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    postMessage(senderId, input);
    setInput('');
  };

  return (
    <div className="chat-panel-container">
      <div className="chat-header">
        <h2>Chat Room {chatId}</h2>
      </div>
      <div 
        className="chat-messages-display"
        ref={chatMessagesDisplayRef}
        onScroll={handleScroll}
      >
        {Array.isArray(messages) && messages.map((msg, index) => (
          <div 
            key={index}
            className={`chat-message-bubble ${msg.senderId === senderId ? 'my-message' : 'other-message'}`}
          >
            <span>{msg.senderId || 'Unknown'}</span>
            <p className="message-text">{msg.message}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="chat-input"
        />
      <button onClick={handleSend} className="chat-send-button">Send</button>
      </div>
    </div>
  );
}

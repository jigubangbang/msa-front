// src/utils/ChatContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chatRooms, setChatRooms] = useState({});
  const [minimizedChats, setMinimizedChats] = useState([]);

  // 채팅방 추가/업데이트
  const updateChatRoom = useCallback((chatId, data) => {
    setChatRooms(prev => ({
      ...prev,
      [chatId]: { ...prev[chatId], ...data }
    }));
  }, []);

  // 채팅방 제거
  const removeChatRoom = useCallback((chatId) => {
    setChatRooms(prev => {
      const newRooms = { ...prev };
      delete newRooms[chatId];
      return newRooms;
    });
    setMinimizedChats(prev => prev.filter(id => id !== chatId));
  }, []);

  // 최소화 상태 관리
  const minimizeChat = useCallback((chatId) => {
    setMinimizedChats(prev => {
      if (!prev.includes(chatId)) {
        return [...prev, chatId];
      }
      return prev;
    });
  }, []);

  const restoreChat = useCallback((chatId) => {
    setMinimizedChats(prev => prev.filter(id => id !== chatId));
  }, []);

  // 최소화된 채팅방의 위치 계산
  const getMinimizedPosition = useCallback((chatId) => {
    const index = minimizedChats.indexOf(chatId);
    return index * 60; // 60px씩 위로 쌓기
  }, [minimizedChats]);

  const value = {
    chatRooms,
    minimizedChats,
    updateChatRoom,
    removeChatRoom,
    minimizeChat,
    restoreChat,
    getMinimizedPosition
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
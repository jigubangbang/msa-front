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

  const openChat = useCallback((chatId, currentUserId, options = {}) => {
    console.log(`[ChatContext] 채팅방 열기: ${chatId}, 사용자: ${currentUserId}`);
    
    setChatRooms(prev => ({
      ...prev,
      [chatId]: {
        chatId,
        currentUserId,
        isOpen: true,
        ...prev[chatId], // 기존 데이터가 있다면 유지
        ...options, // 추가 옵션들
        onClose: () => closeChat(chatId), // onClose 함수 자동 설정
      }
    }));

    // 최소화된 상태였다면 복원
    setMinimizedChats(prev => prev.filter(id => id !== chatId));
  }, []);

  // 채팅방 닫기
  const closeChat = useCallback((chatId) => {
    console.log(`[ChatContext] 채팅방 닫기: ${chatId}`);
    
    setChatRooms(prev => {
      const newRooms = { ...prev };
      if (newRooms[chatId]) {
        // isOpen을 false로 설정 (데이터는 유지)
        newRooms[chatId] = {
          ...newRooms[chatId],
          isOpen: false,
        };
        // 또는 완전히 제거하려면 다음 라인을 사용:
        // delete newRooms[chatId];
      }
      return newRooms;
    });

    // 최소화 목록에서도 제거
    setMinimizedChats(prev => prev.filter(id => id !== chatId));
  }, []);

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
    return index * 130; // 위로 쌓기
  }, [minimizedChats]);

  const value = {
    chatRooms,
    minimizedChats,
    openChat,        
    closeChat,       
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
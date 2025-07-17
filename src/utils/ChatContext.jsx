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
        info: null,
        members: null,
        messages: [],
        nickname: null,
        senderId: null,
        ...options, // 추가 옵션들
        isMinimized: false,
        onClose: () => closeChat(chatId),
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
      delete newRooms[chatId];
      return newRooms;
    });

    // 최소화 목록에서도 제거
    setMinimizedChats(prev => {
    const newList = prev.filter(id => id !== chatId);
    console.log(`[ChatContext] 닫기 후 최소화 목록:`, newList);
    console.log(`[ChatContext] 제거된 채팅방: ${chatId}`);
    return newList;
    });
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
      if (prev.includes(chatId)) {
        return prev;
      }

      let newMinimizedChats = [...prev];
      
      // 🔧 최대 5개 제한 - 5개 이상이면 가장 오래된 것 제거
      if (newMinimizedChats.length >= 5) {
        const oldestChatId = newMinimizedChats[0]; // 가장 오래된 것
        console.log(`[ChatContext] 최대 개수 초과로 ${oldestChatId} 채팅방 자동 닫기`);
        
        // 가장 오래된 채팅방 완전히 닫기
        setChatRooms(prevRooms => {
          const newRooms = { ...prevRooms };
          delete newRooms[oldestChatId];
          return newRooms;
        });
        
        // 배열에서도 제거
        newMinimizedChats = newMinimizedChats.slice(1);
      }
      
      // 새로운 채팅방 추가 (가장 최근 = 배열 끝)
      newMinimizedChats.push(chatId);
      console.log(`[ChatContext] 최소화 목록 업데이트:`, newMinimizedChats);
      
      return newMinimizedChats;
    });
    
    // 채팅방 상태도 업데이트
    setChatRooms(prev => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        isMinimized: true
      }
    }));
  }, []);

  const restoreChat = useCallback((chatId) => {
    setMinimizedChats(prev => prev.filter(id => id !== chatId));

    setChatRooms(prev => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        isMinimized: false
      }
    }));
  }, []);

  // 최소화된 채팅방의 위치 계산
  const getMinimizedPosition = useCallback((chatId) => {
    const actuallyRendered = minimizedChats.filter(id => {
      const room = chatRooms[id];
      return room && room.isOpen && room.isMinimized;
    });
    
    const index = actuallyRendered.indexOf(chatId);
    const position = index * 130;
    
    console.log(`[ChatContext] ${chatId} 실제 위치 계산: 전체목록=[${minimizedChats.join(',')}], 렌더링목록=[${actuallyRendered.join(',')}], index=${index}, position=${position}px`);
    
    return position;
  }, [minimizedChats, chatRooms]);

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
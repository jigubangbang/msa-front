// src/hooks/joinChat.js
import { useState, useEffect } from 'react';
import { joinGroupChat } from '../../services/api/chatApi';

export const joinChat = (chatId, isOpen, senderId) => {
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [chatGroup, setChatGroup] = useState(null);

  useEffect(() => {
    // 모달이 열리고 chatId가 있을 때만 채팅방 입장 시도
    if (isOpen && chatId && !isJoining && !chatGroup) {
      joinChatRoom();
    }
  }, [isOpen, chatId]);

  const joinChatRoom = async () => {
    if (!chatId) return;

    setIsJoining(true);
    setJoinError(null);

    try {
      const result = await joinGroupChat(chatId);
      setChatGroup(result);
      console.log('채팅방 입장 성공:', result);
    } catch (error) {
      setJoinError(error);
      console.error('채팅방 입장 실패:', error);
    } finally {
      setIsJoining(false);
    }
  };

  // 모달이 닫힐 때 상태 초기화
  const resetChatState = () => {
    setChatGroup(null);
    setJoinError(null);
    setIsJoining(false);
  };

  return {
    isJoining,
    joinError,
    chatGroup,
    joinChatRoom,
    resetChatState
  };
};
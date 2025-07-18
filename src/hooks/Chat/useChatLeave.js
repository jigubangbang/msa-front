// src/hooks/chat/useChatLeave.js
import { useState } from 'react';
import { useChatSubscriptionStore } from './useStomp';
import API_ENDPOINTS from '../../utils/constants';
import api from '../../apis/api';
import { getAccessToken } from '../../utils/tokenUtils';

export const useChatLeave = () => {
  const [isLeaving, setIsLeaving] = useState(false);
  const { removeSubscription, getSubscription } = useChatSubscriptionStore();

  const leaveChatRoom = async (chatId, options = {}) => {
    const {
      showAlert = (title, message) => alert(message),
      onSuccess = () => {},
      onError = () => {},
    } = options;

    if (isLeaving) return false;
    setIsLeaving(true);
    const accessToken = getAccessToken();

    try {
      const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/members/me`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const sub = getSubscription(chatId);
      if (sub) {
        sub.unsubscribe();
        console.log(`[useChatLeave] 채팅방 ${chatId} 구독 해제 완료`);
      }

      removeSubscription(chatId);
      showAlert("알림", "채팅방을 성공적으로 나갔습니다.");
      onSuccess();

      return true;

    } catch (error) {
      console.error("[useChatLeave] 채팅방 나가기 실패:", error);
      showAlert("오류", "채팅방 나가기 중 오류가 발생했습니다.");
      onError(error);
      return false;
    } finally {
      setIsLeaving(false);
    }
  };

  return {
    leaveChatRoom,
    isLeaving
  };
};
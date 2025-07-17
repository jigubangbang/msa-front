// src/hooks/Chat/useChatLeave.js
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
      skipConfirmation = false
    } = options;

    // 확인 없이 바로 실행하는 경우
    if (skipConfirmation) {
      return await executeLeaveChatRoom(chatId, { showAlert, onSuccess, onError });
    }

    // 확인 모달이 필요한 경우 Promise 반환
    return new Promise((resolve, reject) => {
      const confirmed = window.confirm('정말로 채팅방을 나가시겠습니까?');
      if (confirmed) {
        executeLeaveChatRoom(chatId, { showAlert, onSuccess, onError })
          .then(resolve)
          .catch(reject);
      } else {
        resolve(false); // 취소한 경우
      }
    });
  };

  const executeLeaveChatRoom = async (chatId, { showAlert, onSuccess, onError }) => {
    if (isLeaving) return false;
    
    setIsLeaving(true);
    const accessToken = getAccessToken();

    try {
      // API 호출로 채팅방 탈퇴
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

      // 구독 해제
      const sub = getSubscription(chatId);
      if (sub) {
        sub.unsubscribe();
        console.log(`[useChatLeave] 채팅방 ${chatId} 구독 해제 완료`);
      }

      // 구독 정보 제거
      removeSubscription(chatId);

      // 성공 알림
      showAlert("알림", "채팅방을 성공적으로 나갔습니다.");
      
      // 성공 콜백 실행
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
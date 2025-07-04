// src/hooks/chat/kickSock.js
import { useEffect } from 'react';
import { useStomp, useStore } from './useStomp';

export function kickSock(chatId, senderId, setIsKicked) {
  const { subscribe, unsubscribe } = useStomp();
  //const userId = useStore(state => state.senderId);
  const userId = senderId;
  
  useEffect(() => {
    if (!chatId || !senderId) return;

    const kickSub = subscribe(`/topic/chat/${chatId}/kick/${userId}`, (msg) => {
      console.log('[useKickSock] 강퇴 메시지 수신:', msg);

      // 강퇴 상태 업데이트
      setIsKicked(true);
      localStorage.setItem(`kicked:${chatId}`, 'true');

      alert("운영진에 의해 강제 퇴장되었습니다. 채팅 기능이 제한됩니다.");
    });

    return () => {
      unsubscribe(kickSub);
    };
  }, [chatId, senderId]);
}
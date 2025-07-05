// src/hooks/chat/kickSock.js
import { useEffect } from 'react';
import { useStomp } from './useStomp';

export function kickSock(chatId, senderId, setIsKicked, setMessages) {
  const { subscribe, unsubscribe } = useStomp();
  //const userId = useStore(state => state.senderId);
  const userId = senderId;
  
  useEffect(() => {
    if (!chatId || !senderId) return;

    const topic = `/topic/chat/${chatId}/kick/${userId}`;
    const kickSub = subscribe(topic, (msg) => {
      console.log('[useKickSock] 강퇴 메시지 수신:', msg);

      const kickMessage = {
        chatId,
        senderId: "System",
        message: "운영진에 의해 강제 퇴장되었습니다.",
        type: "KICK",
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(`kicked:${chatId}`, 'true');
      setIsKicked(true);
      setMessages(prev => [...prev, kickMessage]);

      alert("운영진에 의해 강제 퇴장되었습니다. 채팅 기능이 제한됩니다.");

      const mainChatTopic = `/topic/chat/${chatId}`;
      unsubscribe(mainChatTopic);
    });

    return () => {
      if (kickSub) {
        console.log(`[kickSock] 구독 해제: ${topic}`);
        unsubscribe(kickSub);
      }
    };
  }, [chatId, senderId]);
}
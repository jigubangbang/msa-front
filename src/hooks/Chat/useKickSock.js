// src/hooks/chat/kickSock.js
import { useEffect, useRef, useCallback } from 'react';
import { useStomp } from './useStomp';

export function useKickSock(chatId, senderId, setIsKicked, setMessages) {
  const { subscribe, isConnected } = useStomp();
  //const userId = useStore(state => state.senderId);
  const kickSubRef = useRef(null);
  const isSubscribedRef = useRef(false);
  const chatIdRef = useRef(chatId);
  const senderIdRef = useRef(senderId);
  
  // refs 업데이트
  chatIdRef.current = chatId;
  senderIdRef.current = senderId;

  const handleKickMessage = useCallback((msg) => {
    console.log('[useKickSock] 강퇴 메시지 수신:', msg);

    const kickMessage = {
      chatId: chatIdRef.current,
      senderId: "System",
      message: "운영진에 의해 강제 퇴장되었습니다.",
      type: "KICK",
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`kicked:${chatIdRef.current}`, 'true');
    setIsKicked(true);
    setMessages(prev => [...prev, kickMessage]);

    alert("운영진에 의해 강제 퇴장되었습니다. 채팅 기능이 제한됩니다.");
  }, [setIsKicked, setMessages]);
  

  useEffect(() => {
    const isReady = chatId && senderId && isConnected;
    if (!isReady) {
      console.log('[kickSock] 구독 준비 안됨:', { chatId, senderId, isConnected });
      return;
    }

    if (isSubscribedRef.current) {
      console.log('[kickSock] 이미 구독됨, 중복 구독 방지');
      return;
    }

    const topic = `/topic/chat/${chatId}/kick/${senderId}`;
    console.log(`[kickSock] ${senderId} 가 ${topic} 구독 시도`);

    const kickSub = subscribe(topic, handleKickMessage);

    if (kickSub) {
      kickSubRef.current = kickSub;
      isSubscribedRef.current = true;
      console.log(`[kickSock] 구독 성공: ${topic}`);
    }

    return () => {
      if (kickSubRef.current && isSubscribedRef.current) {
        console.log(`[kickSock] 구독 해제: ${topic}`);
        kickSubRef.current.unsubscribe();
        kickSubRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [chatId, senderId, isConnected]);

  // 컴포넌트 언마운트 시 정리
 useEffect(() => {
    return () => {
      if (kickSubRef.current) {
        console.log('[kickSock] 구독 정리');
        kickSubRef.current.unsubscribe();
        kickSubRef.current = null;
        currentChatIdRef.current = null;
        currentSenderIdRef.current = null;
      }
    };
  }, [chatId, senderId]);
}
// src/hooks/Chat/useChat.js

// 폴링 방식 (추후, 웹소켓으로 바꿀 가능성)
import { useEffect, useState } from 'react';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';
import { fetchMessages, sendMessage } from '../../services/api/chatApi';

export default function useChat(chatId, pollingInterval = 2000) {
  const [messages, setMessages] = useState([]);

  // 메시지 가져오기 (폴링)
  useEffect(() => {
    const getMessages = async () => {
      try {
        const data = await fetchMessages(chatId);
      setMessages(Array.isArray(data) ? data : []); // 배열 확인
      } catch (error) {
        console.error('메시지 조회 실패:', error);
        setMessages([]); // 에러 시 빈 배열
      }
    };

    getMessages(); // 최초 한 번

    const interval = setInterval(getMessages, pollingInterval);
    return () => clearInterval(interval);
  }, [chatId]);

  // 메시지 전송
  const postMessage = async (senderId, message) => {
    try {
        await sendMessage(chatId, senderId, message);
        const data = await fetchMessages(chatId); // 전송 후 새로고침
        setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  return { messages, postMessage };
}

/* 웹소켓 예시
export default function useChat(roomId, userId) {
  const [messages, setMessages] = useState([]);
  const stompClientRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws-chat');
      const stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
          // 채팅방 구독
          stompClient.subscribe(`/topic/chat/${roomId}`, (msg) => {
            const newMsg = JSON.parse(msg.body);
            setMessages(prev => [...prev, newMsg]);
          });

          // (선택) 입장 메시지 전송
          stompClient.publish({
            destination: '/app/chat.enter',
            body: JSON.stringify({ groupId: roomId, userId })
          });
          //
        }
      });

      stompClient.activate();
      stompClientRef.current = stompClient;

      return () => {
        stompClient.deactivate(); // 컴포넌트 언마운트 시 연결 해제
      };
    }, [roomId, userId]);

    const sendMessage = (message) => {
      if (!stompClientRef.current?.connected) return;

      stompClientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          chatId: roomId,
          senderId: userId,
          message
        })
      });
    };

    return { messages, sendMessage };
  }
*/
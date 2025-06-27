// src/hooks/Chat/joinSocketChat.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs'; // STOMP 클라이언트 임포트
import SockJS from 'sockjs-client'; // SockJS 임포트 (Spring Boot에서 withSockJS()를 사용하므로 필요)
import API_ENDPOINTS from '../../utils/constants';
// Spring Boot WebSocket 엔드포인트 URL
// 백엔드 Spring Boot의 WebSocketConfig.java에 설정된 엔드포인트와 일치해야 합니다.
// 예: registry.addEndpoint("/ws/chat").withSockJS();
const WEBSOCKET_ENDPOINT_URL = `${API_ENDPOINTS.WS}`; // 백엔드 서버 주소와 포트를 정확히 명시

export function joinChat(chatId, isOpen, senderId) {
  const [isJoining, setIsJoining] = useState(true);
  const [joinError, setJoinError] = useState(null);
  const [chatGroup, setChatGroup] = useState(null); // 채팅 그룹 정보 (UI 표시용)
  const [messages, setMessages] = useState([]); // 실시간으로 수신되는 메시지 목록
  const stompClientRef = useRef(null); // STOMP 클라이언트 인스턴스 저장

  // 채팅 상태를 초기화하고 웹소켓 연결을 끊는 함수
  const resetChatState = useCallback(() => {
    console.log("[joinChat] resetChatState called.");
    setIsJoining(false);
    setJoinError(null);
    setChatGroup(null);
    setMessages([]);
    if (stompClientRef.current && stompClientRef.current.connected) {
      console.log("[joinChat] Disconnecting STOMP client.");
      stompClientRef.current.deactivate(); // STOMP 연결 해제
      stompClientRef.current = null;
    }
  }, []);

  // 채팅방 입장 및 웹소켓 연결/구독 로직
  useEffect(() => {
    if (isOpen && chatId && senderId) { // 모달이 열렸고, 필요한 정보가 모두 있을 때만 연결 시도
      console.log(`[joinChat] Attempting to connect to chat ${chatId} as ${senderId}`);
      setIsJoining(true);
      setJoinError(null);
      setMessages([]); // 새 채팅방 입장 시 메시지 초기화

      // 기존 연결이 있다면 먼저 해제 (새로운 연결을 위해)
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("[joinChat] Existing STOMP client found, deactivating.");
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }

      // 과거 메세지 기록 불러오기
      const fetchChatHistory = async () => {
        try {
          const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/messages`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const history = await response.json();
          setMessages(Array.isArray(history) ? history : []); // 불러온 과거 메시지로 상태 초기화
          console.log(`[joinChat] Fetched ${history.length} historical messages.`);
        } catch (err) {
          console.error('[joinChat] Failed to fetch chat history:', err);
          setJoinError(new Error('Failed to load chat history.')); // 에러 처리
          setIsJoining(false); // 에러 발생 시 로딩 중단
        }
      };

      fetchChatHistory();

      // STOMP 클라이언트 생성
      const client = new Client({
        // Spring Boot의 SockJS 엔드포인트를 사용하기 위해 webSocketFactory 설정
        webSocketFactory: () => new SockJS(WEBSOCKET_ENDPOINT_URL),
        connectHeaders: {
          // 필요시 인증 토큰 등을 보낼 수 있습니다. (예: 'Authorization': `Bearer ${yourAuthToken}`)
          // Spring Security와 연동할 때 유용
        },
        debug: (str) => {
          // STOMP 클라이언트의 디버그 로그를 콘솔에 출력
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000, // 연결 끊어졌을 때 5초 후 재연결 시도
        heartbeatIncoming: 4000, // 서버가 4초 이내에 heartbeat를 보내지 않으면 연결 끊김으로 간주
        heartbeatOutgoing: 4000, // 4초마다 heartbeat를 서버로 전송 (클라이언트에서 서버로)

        // 연결 성공 시 콜백
        onConnect: (frame) => {
          console.log('STOMP Connected:', frame);
          stompClientRef.current = client; // 연결된 클라이언트 인스턴스 저장

          setIsJoining(false);
          setChatGroup({ id: chatId, name: `Chat ${chatId}` }); // UI에 표시할 채팅방 정보 설정 (임시)

          // 1. 채팅방 입장 메시지 전송
          // 서버의 @MessageMapping("/chat.addUser/{chatId}")로 매핑됩니다.
          client.publish({
            destination: `/app/chat.addUser/${chatId}`, // 백엔드 @MessageMapping 경로
            body: JSON.stringify({ senderId: senderId, message: "joined" }), // 서버 ChatMessage DTO에 맞게
          });
          console.log(`[joinChat] Published join message for ${senderId} to /app/chat.addUser/${chatId}`);

          // 2. 채팅방 메시지 수신 구독
          // 서버의 messagingTemplate.convertAndSend("/topic/chat/{chatId}") 목적지에서 메시지를 받습니다.
          client.subscribe(`/topic/chat/${chatId}`, (message) => {
            console.log('Received message from broker:', message.body);
            const receivedMessage = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
          });
          console.log(`[joinChat] Subscribed to /topic/chat/${chatId}`);
        },

        // STOMP 에러 발생 시 콜백
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
          setJoinError(new Error(`STOMP error: ${frame.headers['message'] || frame.body || 'Unknown error'}`));
          setIsJoining(false);
        },

        // 웹소켓 연결이 닫혔을 때 콜백
        onWebSocketClose: (event) => {
            console.log('WebSocket Closed:', event);
            // 재연결 로직은 @stomp/stompjs가 기본적으로 처리합니다.
            // 필요시 여기에서 추가적인 정리 또는 사용자 알림을 할 수 있습니다.
        },
        // 웹소켓 에러 발생 시 콜백
        onWebSocketError: (event) => {
            console.error('WebSocket Error:', event);
            setJoinError(new Error('WebSocket connection failed.'));
            setIsJoining(false);
        }
      });

      client.activate(); // STOMP 클라이언트 활성화 (실제로 연결 시작)
      console.log("[joinChat] STOMP client activated.");

      // 컴포넌트 언마운트 또는 isOpen이 false가 될 때 STOMP 연결 정리
      return () => {
        console.log("[joinChat] Cleanup effect triggered.");
        resetChatState(); // 정리 함수 호출
      };
    } else if (!isOpen && stompClientRef.current) {
        // isOpen이 false가 되면 소켓 연결 정리 (모달이 닫힐 때 명시적으로 정리)
        console.log("[joinChat] isOpen is false, triggering reset.");
        resetChatState();
    }
  }, [isOpen, chatId, senderId, resetChatState]); // 의존성 배열에 필요한 값 포함

  // 메시지 전송 함수 (외부 컴포넌트에서 사용할 수 있도록 노출)
  const sendMessage = useCallback((messageText) => {
    if (stompClientRef.current && stompClientRef.current.connected && chatGroup) {
      const chatMessage = {
        senderId: senderId,
        message: messageText,
        // timestamp는 서버에서 설정하는 것이 일관성 유지에 좋습니다.
        // type: 'CHAT' // 필요시 메시지 타입 추가
      };
      // 메시지 전송 목적지: /app/chat.send/{chatId}
      stompClientRef.current.publish({
        destination: `/app/chat.send/${chatGroup.id}`, // 백엔드 @MessageMapping 경로
        body: JSON.stringify(chatMessage),
      });
      console.log('Sent message:', chatMessage);
    } else {
      console.warn('Cannot send message: STOMP client not connected or chatGroup not set.');
      // 메시지 전송 실패 시 사용자에게 알림 로직 추가 가능
    }
  }, [chatGroup, senderId]);

  return { isJoining, joinError, chatGroup, messages, resetChatState, sendMessage };
}
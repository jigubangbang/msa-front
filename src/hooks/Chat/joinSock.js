// src/hooks/chat/joinSock.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStomp, useStore } from '/../chat/useStomp';
import API_ENDPOINTS from '../../utils/constants';

export function joinSock(isOpen, chatId, senderId) {
  const { accessToken, stompClient, senderId: storeSenderId } = useStore();
  // const accessToken = localStorage.getItem("accessToken");
  // const accessToken = "AXmxOoAbZ+MzB31Diio24unhX3uPneVd0TJCeALqTfhDgHohZdzHG/DXf41DUXQIH+gR1QL7s5ONGcjCZeIg1g== ";
  const { connect, disconnect, send, subscribe, unsubscribe } = useStomp();
  const effectiveSenderId = senderId || storeSenderId;
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [chatGroup, setChatGroup] = useState(null); // 채팅 그룹 정보 (UI 표시용)
  const [messages, setMessages] = useState([]); // 실시간 수신 메시지
  const [chatError, setChatError] = useState(null);
  const subscriptionRef = useRef(null); // 현 구독 객체 저장 ref

  // STOMP 클라이언트 활성화 및 메세지 구독
  const activateStompClient = useCallback(() => {
    console.log(`[joinSock] STOMP 활성화 시작: ${chatId} as ${effectiveSenderId}`);
    setIsLoading(true);
    setChatError(null);

    // useStomp 훅의 connect 함수 호출
    connect({
      accessToken: accessToken, // accessToken,
      onConnect: () => {
        console.log("[joinChat] STOMP 연결 성공");

        // 입장 메세지 전송
        send(`/app/chat.addUser/${chatId}`, {
          senderId: effectiveSenderId,
          message: "joined"
        });

        // 구독 시작
        const subscription = subscribe(`/topic/chat/${chatId}`, (receivedMessage) => {
          console.log('[joinChat] 메시지 수신: ', receivedMessage);
          setMessages(prevMessages => [...prevMessages, receivedMessage]);
        });
        
        // 구독 객체 저장
        subscriptionRef.current = subscription;

        setIsLoading(false); // 연결 성공 및 구독 후 로딩 해제
      },
      onError: (e) => {
        console.error("[joinChat] STOMP 연결 실패: ", e );
        setChatError(new Error( "STOMP 연결/구독 실패: " + (e.headers?.message || e.body ||  "알 수 없는 에러")));
        setIsLoading(false);
      },
      onDisconnect: () => {
        console.log("[joinChat] STOMP 연결 해제 콜백");
      },
    });
  }, [accessToken, chatId, effectiveSenderId, connect, send, subscribe]);

  // STOMP 잠시 나가기 - 구독 해제
  const unsubscribeChatRoom = () => {
    if (subscriptionRef.current) {
      unsubscribe(subscriptionRef.current);
      subscriptionRef.current = null;
      console.log(`[joinSock] chatId ${chatId}에 대한 구독 해제 완료`);
    }
  }

  // STOMP 완전 해제 - 모든 채팅방의 연결을 끊을 때
  const disconnectStompClient = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      console.log("[joinSock] 구독 해제 완료");
    }
    disconnect();
  }, [disconnect]);

  // 채팅방 초기화
  useEffect(() => {
    if (!chatId || !isOpen || !effectiveSenderId ) {
      console.log("[joinSock] 초기화 건너뛰기: 정보 부족 또는 모달 닫힘", { chatId, isOpen, effectiveSenderId });
      setIsLoading(false);
      setIsJoining(false);
      setChatError(null);
      return;
    }

    console.log(`[joinSock] 채팅방 초기화 시작: ${chatId} (${effectiveSenderId})`);
    setIsLoading(true);
    setChatError(null);
    setIsJoining(true);

    const initializeChatRoom = async () => {
        let restApiJoinSuccess = false;

        try {
            const joinResponse = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/join`, {
                method: 'POST',
                headers: {
                    'User-Id': effectiveSenderId
                },
            });

          if (joinResponse.ok) { 
              const contentType = joinResponse.headers.get("content-type");
              if (contentType?.includes("application/json")) {
                  const data = await joinResponse.json();
                  console.log("[joinSock] 채팅방 REST 입장 성공:", data);
              } else {
                  console.log("[joinSock] REST 입장 성공 (본문 없음 또는 JSON 아님)");
              }
              restApiJoinSuccess = true;
          } else {
              const errorText = await joinResponse.text();
              setChatError(new Error("채팅방 입장 실패: " + joinResponse.status + " " + errorText));
          }
      } catch (err) {
          console.error("[joinSock] REST API 입장 실패:", err);
          setChatError(new Error("REST 입장 실패: " + err.message));
      }

      if (restApiJoinSuccess) {
        // 과거 메세지 조회
        try {
          const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/messages`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const history = await response.json();
          setMessages(Array.isArray(history) ? history : []);
          console.log(`[joinSock] 과거 메시지 ${history.length}개 로드됨`);
        } catch (err) {
          console.error('[joinSock] 과거 메시지 조회 실패:', err);
          setChatError(new Error("과거 메시지 조회 실패: " + (err.message || "알 수 없는 에러")));
        }
        // 그 후 STOMP 활성화
        activateStompClient();
      } else {
        setIsLoading(false); // REST API 실패 시 로딩 해제
      }
      setIsJoining(false);
    };

    initializeChatRoom();

    return () => {
      console.log("[joinSock] 훅 클린업 실행.");
      setMessages([]);
      setIsJoining(false);
      setIsLoading(false);
      setChatError(null);
    };
  }, [chatId, isOpen, effectiveSenderId, activateStompClient]);

  // 메시지 전송
  const sendMessage = useCallback((messageContent) => {
    if (!messageContent.trim()) return;

    send(`/app/chat.send/${chatId}`, {
      chatId,
      senderId: effectiveSenderId,
      message: messageContent
    });
  }, [chatId, effectiveSenderId, send]);

  return { 
    messages, 
    sendMessage, 
    isLoading, 
    chatError, 
    isJoining,
    unsubscribeChatRoom,
    disconnectStompClient 
  };

}
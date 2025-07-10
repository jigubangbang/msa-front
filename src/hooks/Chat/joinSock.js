// src/hooks/chat/joinSock.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStomp, useStore } from './useStomp';
import API_ENDPOINTS from '../../utils/constants';
import api from "../../apis/api";

export function joinSock(isOpen, chatId, showAlert) {
  const senderId = useStore(state => state.senderId);
  const setSenderId = useStore(state => state.setSenderId);
  const { connect, disconnect, send, subscribe, unsubscribe } = useStomp();
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [chatGroup, setChatGroup] = useState(null); // 채팅 그룹 정보 (UI 표시용)
  const [messages, setMessages] = useState([]); // 실시간 수신 메시지
  const [chatError, setChatError] = useState(null);
  const [isKicked, setIsKicked] = useState(false);
  const subscriptionRef = useRef(null); // 현 구독 객체 저장 ref

  // STOMP 클라이언트 활성화 및 메세지 구독
  const activateStompClient = useCallback((userId) => {
    console.log(`[joinSock] STOMP 활성화 시작: Room number: ${chatId}`);
    setIsLoading(true);
    setChatError(null);

    // useStomp 훅의 connect 함수 호출
    connect({
      onConnect: () => {
        console.log("[joinChat] STOMP 연결 성공");

        // 중복 구독 방지
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }

        // 입장 메세지 전송
        send(`/app/chat.addUser/${chatId}`, {
          senderId: userId,
          message: "joined"
        });

        // 구독 시작
        const subscription = subscribe(`/topic/chat/${chatId}`, (receivedMessage) => {
          console.log('[joinChat] 메시지 수신: ', receivedMessage);

          // 백엔드에서 "강제 퇴장" 문구가 포함된 LEAVE 메시지를 보내므로, 이를 KICK으로 간주
          if (receivedMessage.type === 'LEAVE' && receivedMessage.message.includes('강제 퇴장')) {
            // 화면 표시를 위해 KICK 타입으로 변경하여 시스템 메시지처럼 보이게 함
            const kickSystemMessage = { ...receivedMessage, type: 'KICK' };
            setMessages(prevMessages => [...prevMessages, kickSystemMessage]);
          } else {
            setMessages(prevMessages => [...prevMessages, receivedMessage]);
          }
        });

        // 2. 개별 강제 퇴장 알림 구독 추가
        const kickSubscription = subscribe(`/topic/chat/${chatId}/kick/${userId}`, (kickMessage) => {
          console.log('[joinChat] 강제 퇴장 알림 수신: ', kickMessage);
          handleKickMessage(kickMessage);
        });
        
        // 구독 객체 저장
        subscriptionRef.current = {
          chat: subscription,
          kick: kickSubscription
      };

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
  }, [chatId, connect, send, subscribe]);

  const unsubscribeChatRoom = useCallback(() => {
    if (subscriptionRef.current) {
      // 여러 구독이 있는 경우 모두 해제
      if (subscriptionRef.current.chat) {
        subscriptionRef.current.chat.unsubscribe();
      }
      if (subscriptionRef.current.kick) {
        subscriptionRef.current.kick.unsubscribe();
      }
      subscriptionRef.current = null;
      console.log(`[joinSock] 모든 구독 해제 완료: chatId=${chatId}`);
    }
  }, [chatId]);

  // 강제 퇴장 메시지 처리 함수 추가
  const handleKickMessage = useCallback((kickMessage) => {
    console.log('[joinChat] 강제 퇴장 처리: ', kickMessage);
    
    // 현재 채팅방에서 강제 퇴장당한 경우
    if (kickMessage.chatId === chatId) {
      setIsKicked(true);
      showAlert('강제 퇴장', '관리자에 의해 채팅방에서 내보내졌습니다.');
      
      // 구독 해제
      unsubscribeChatRoom();
      
      // 채팅방 나가기 처리
      // 예: 페이지 이동, 모달 닫기 등
      if (typeof isOpen === 'function') {
        isOpen(false); // 채팅방 닫기
      }
    
    /*
    if (kickMessage.chatId === chatId) {
    // 1. 강제 퇴장 메시지를 채팅창에 표시
    setMessages(prevMessages => [...prevMessages, {
      ...kickMessage,
      type: 'SYSTEM' // 시스템 메시지로 표시
    }]);
    
    // 2. 잠시 후 알림 표시
    setTimeout(() => {
      alert(kickMessage.message || '관리자에 의해 채팅방에서 내보내졌습니다.');
      
      // 3. 구독 해제 및 채팅방 닫기
      unsubscribeChatRoom();
      if (typeof isOpen === 'function') {
        isOpen(false);
      }
    }, 1000); // 1초 후 실행
    */
      
      // 또는 페이지 이동
      // window.location.href = '/chatrooms';
      setMessages([]);
      setIsLoading(false);
      setIsJoining(false);
      setChatError(null);
    }
  }, [chatId, unsubscribeChatRoom, isOpen]);

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
    if (!chatId || !isOpen) {
      console.log("[joinSock] 초기화 건너뛰기: 정보 부족 또는 모달 닫힘", { chatId, isOpen, senderId });
      setIsLoading(false);
      setIsJoining(false);
      setChatError(null);
      return;
    }

    console.log(`[joinSock] 채팅방 초기화 시작: Room number: ${chatId}`);
    setIsLoading(true);
    setChatError(null);
    setIsJoining(true);

    const initializeChatRoom = async () => {
        let restApiJoinSuccess = false;
        let userIdFromJoin = null;

        try {
            const joinResponse = await api.post(`${API_ENDPOINTS.CHAT}/${chatId}/join`);
            restApiJoinSuccess = true;
            userIdFromJoin = joinResponse.data.userId;
            setSenderId(joinResponse.data.userId);
            } catch (err) {
              console.error("[joinSock] REST API 입장 실패:", err);
              setChatError(new Error("REST 입장 실패: " + err.message));
            }
        if (restApiJoinSuccess) {
          // 과거 메세지 조회
          try {
            const response = await api.get(`${API_ENDPOINTS.CHAT}/${chatId}/messages`);
            const history = response.data;
            setMessages(Array.isArray(history) ? history : []);
            console.log(`[joinSock] 과거 메시지 ${history.length}개 로드됨`);
          } catch (err) {
            console.error('[joinSock] 과거 메시지 조회 실패:', err);
            setChatError(new Error("과거 메시지 조회 실패: " + (err.message || "알 수 없는 에러")));
          }
          // 그 후 STOMP 활성화
          activateStompClient(userIdFromJoin);
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
  }, [chatId, isOpen, activateStompClient]);

  // 메시지 전송
  const sendMessage = useCallback((messageContent) => {
    if (!messageContent.trim()) return;

    send(`/app/chat.send/${chatId}`, {
      chatId,
      senderId: senderId,
      message: messageContent
    });
  }, [chatId, senderId, send]);

  return { 
    senderId,
    messages,
    setMessages,
    sendMessage,
    isLoading, 
    chatError, 
    isJoining,
    isKicked,
    unsubscribeChatRoom,
    disconnectStompClient
  };

}
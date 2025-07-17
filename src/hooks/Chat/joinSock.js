// src/hooks/Chat/joinSock.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStomp, useStore } from './useStomp';
import API_ENDPOINTS from '../../utils/constants';
import api from "../../apis/api";

export function joinSock(isOpen, chatId, showAlert, currentUserId, onCloseModal) {
  const senderId = useStore(state => state.senderId);
  const setSenderId = useStore(state => state.setSenderId);
  const { connect, disconnect, send, subscribe, unsubscribe } = useStomp();
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState(null);
  const [messages, setMessages] = useState([]); // 실시간 수신 메시지
  const [chatError, setChatError] = useState(null);
  const [isKicked, setIsKicked] = useState(false);
  const subscriptionRef = useRef(null); // 현 구독 객체 저장 ref
  
  // 무한 리렌더링 감지를 위한 ref들
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  const errorCountRef = useRef(0);
  const refreshTriggeredRef = useRef(false);

  // 무한 리렌더링 감지 및 새로고침 함수
  const checkForInfiniteRerender = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastRenderTimeRef.current;
    
    renderCountRef.current += 1;
    
    // 1초 내에 10번 이상 렌더링되면 무한 리렌더링으로 판단
    if (timeDiff < 1000) {
      if (renderCountRef.current > 10 && !refreshTriggeredRef.current) {
        console.warn('[joinSock] 무한 리렌더링 감지됨 - 페이지 새로고침 실행');
        refreshTriggeredRef.current = true;

        setTimeout(() => {
          window.location.reload();
        }, 1300);
        return true;
      }
    } else {
      // 1초가 지났으면 카운터 리셋
      renderCountRef.current = 1;
      lastRenderTimeRef.current = now;
    }
    return false;
  }, [showAlert]);

  // 에러 카운트를 통한 새로고침 트리거
  const handleCriticalError = useCallback((error) => {
    console.error('[joinSock] 치명적 에러 발생:', error);
    errorCountRef.current += 1;
    
    // 10초 내에 3번 이상 에러가 발생하면 새로고침
    if (errorCountRef.current >= 3 && !refreshTriggeredRef.current) {
      refreshTriggeredRef.current = true;
      console.warn('[joinSock] 반복적인 에러로 인한 자동 새로고침');
      
      if (showAlert) {
        showAlert('연결 실패', '채팅 연결이 계속 실패합니다. 페이지를 새로고침합니다.');
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    // 에러 카운트는 10초 후 리셋
    setTimeout(() => {
      errorCountRef.current = Math.max(0, errorCountRef.current - 1);
    }, 10000);
  }, [showAlert]);

  // 중복 구독 방지
  const safeUnsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      // 여러 구독이 있는 경우 모두 해제
      if (subscriptionRef.current.chat && typeof subscriptionRef.current.chat.unsubscribe === 'function') {
        subscriptionRef.current.chat.unsubscribe();
      }
      if (subscriptionRef.current.kick && typeof subscriptionRef.current.kick.unsubscribe === 'function') {
        subscriptionRef.current.kick.unsubscribe();
      }
      subscriptionRef.current = null;
      console.log(`[joinSock] 모든 구독 해제 완료`);
    }
  }, []);

  // STOMP 클라이언트 활성화 및 메세지 구독
  const activateStompClient = useCallback((userId) => {
    console.log(`[joinSock] STOMP 활성화 시작: Room number: ${chatId}`);
    setIsLoading(true);
    setChatError(null);

    if (checkForInfiniteRerender()) {
      return;
    }

    // useStomp 훅의 connect 함수 호출
    connect({
      onConnect: () => {
        console.log("[joinChat] STOMP 연결 성공");
        safeUnsubscribe();

        // 입장 메세지 전송
        send(`/app/chat.addUser/${chatId}`, {
          senderId: userId,
          message: "joined"
        });

        // 구독 시작
        const subscription = subscribe(`/topic/chat/${chatId}`, (receivedMessage) => {
          console.log('[joinChat] 메시지 수신: ', receivedMessage);

          if (receivedMessage.type === 'ROOM_DELETE') {
            handleRoomDelete(receivedMessage);
            return;
          }

          if (receivedMessage.type === 'LEAVE' && receivedMessage.message.includes('강제 퇴장')) {
            // 화면 표시를 위해 KICK 타입으로 변경하여 시스템 메시지처럼 보이게 함
            const kickSystemMessage = { ...receivedMessage, type: 'KICK' };
            setMessages(prevMessages => [...prevMessages, kickSystemMessage]);
          } else {
            setMessages(prevMessages => [...prevMessages, receivedMessage]);
          }
        });

        const kickSubscription = subscribe(`/topic/chat/${chatId}/kick/${userId}`, (kickMessage) => {
          console.log('[joinChat] 강제 퇴장 알림 수신: ', kickMessage);
          handleKickMessage(kickMessage);
        });
        
        // 구독 객체 저장
        if (subscription && kickSubscription) {
          subscriptionRef.current = {
            chat: subscription,
            kick: kickSubscription
          };
        } else {
          console.error('[joinChat] 구독 객체 생성 실패');
        }

        setIsLoading(false);
      },
      onError: (e) => {
        console.error("[joinChat] STOMP 연결 실패: ", e );
        setChatError(new Error( "STOMP 연결/구독 실패: " + (e.headers?.message || e.body ||  "알 수 없는 에러")));
        setIsLoading(false);
      },
      onDisconnect: () => {
        console.log("[joinChat] STOMP 연결 해제 콜백");
        safeUnsubscribe();
      },
    });
  }, [chatId, connect, send, subscribe, safeUnsubscribe]);

  const unsubscribeChatRoom = useCallback(() => {
    safeUnsubscribe();
  }, [safeUnsubscribe]);

  // 채팅방 삭제
  const handleRoomDelete = useCallback((deleteMessage) => {
    if (deleteMessage.chatId === chatId) {
      console.log('[joinChat] 현재 채팅방이 삭제됨 - 자동 퇴장 처리');
      unsubscribeChatRoom();

      setMessages([]);
      setIsLoading(false);
      setIsJoining(false);
      setChatError(null);
      
      showAlert('채팅방 삭제', deleteMessage.message || '현 채팅방이 삭제되어 더이상 채팅이 불가합니다.');
      setTimeout(() => {
        if (onCloseModal) {
          onCloseModal();
        }
      }, 1500);
    }
  }, [chatId, unsubscribeChatRoom, showAlert, onCloseModal]);


  // 강제 퇴장 메시지 처리
  const handleKickMessage = useCallback((kickMessage) => {
    console.log('[joinChat] 강제 퇴장 처리: ', kickMessage);
    
    // 현재 채팅방에서 강제 퇴장당한 경우
    if (kickMessage.chatId === chatId) {

      unsubscribeChatRoom();

      setIsKicked(true);
      setMessages([]);
      setIsLoading(false);
      setIsJoining(false);
      setChatError(null);

      showAlert('강제 퇴장', '운영진에 의해 채팅방에서 내보내졌습니다.');
      if (typeof isOpen === 'function') {
        isOpen(false); // 채팅방 닫기
      }
    }
  }, [chatId, unsubscribeChatRoom, isOpen]);

  // STOMP 완전 해제 - 모든 채팅방의 연결을 끊을 때
  const disconnectStompClient = useCallback(() => {
    safeUnsubscribe();
    disconnect();
  }, [disconnect, safeUnsubscribe]);

  // 채팅방 초기화
  useEffect(() => {
    if (!chatId || !isOpen) {
      setIsLoading(false);
      setIsJoining(false);
      setChatError(null);
      return;
    }

    if (checkForInfiniteRerender()) {
      return;
    }

    console.log(`[joinSock] 채팅방 초기화 시작: Room number: ${chatId}`);
    setIsLoading(true);
    setIsJoining(true);
    setChatError(null);

    const initializeChatRoom = async () => {
        let restApiJoinSuccess = false;
        let userIdFromJoin = null;
        let nicknameFromJoin = null;

        try {
            const joinResponse = await api.post(`${API_ENDPOINTS.CHAT}/${chatId}/join`);
            restApiJoinSuccess = true;
            userIdFromJoin = joinResponse.data.userId;
            nicknameFromJoin = joinResponse.data.nickname;
            setSenderId(joinResponse.data.userId);
            setNickname(joinResponse.data.nickname);
            
            console.log(`[joinSock] 입장 성공 - currentUserId: ${currentUserId}, serverUserId: ${userIdFromJoin}`);
            
          } catch (err) {
            console.error("[joinSock] REST API 입장 실패:", err);
            setChatError(new Error("REST 입장 실패: " + err.message));
          }

          if (restApiJoinSuccess) {
            // 과거 메시지 조회
            try {
              const response = await api.get(`${API_ENDPOINTS.CHAT}/${chatId}/messages`);
              const history = response.data;
              setMessages(Array.isArray(history) ? history : []);
              console.log(`[joinSock] 과거 메시지 ${history.length}개 로드됨`);
            } catch (err) {
              console.error('[joinSock] 과거 메시지 조회 실패:', err);
              setChatError(new Error("과거 메시지 조회 실패: " + (err.message || "알 수 없는 에러")));
            }
            activateStompClient(userIdFromJoin || currentUserId);
          } else {
            setIsLoading(false);
          }
          setIsJoining(false);
        };

      initializeChatRoom();

    return () => {
      console.log("[joinSock] 훅 클린업 실행.");
      safeUnsubscribe();
      setMessages([]);
      setIsJoining(false);
      setIsLoading(false);
      setChatError(null);
    };
  }, [chatId, isOpen, currentUserId, setSenderId, activateStompClient, safeUnsubscribe]);

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
    nickname,
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
// src/hooks/useGlobalWebSocket.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStomp } from './useStomp';

export function useGlobalWebSocket(userId) {
  const { connect, disconnect, subscribe, send, isConnected } = useStomp();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const subscriptionsRef = useRef({});
  const isGlobalConnectedRef = useRef(false);

  // 글로벌 연결 설정
  const connectGlobal = useCallback(() => {
    if (!userId || isGlobalConnectedRef.current) return;

    console.log('[GlobalWebSocket] 글로벌 연결 시작:', userId);
    
    connect({
      onConnect: () => {
        console.log('[GlobalWebSocket] 연결 성공');
        isGlobalConnectedRef.current = true;
        
        // 기본 알림들 구독
        subscribeToNotifications();
      },
      onError: (error) => {
        console.error('[GlobalWebSocket] 연결 실패:', error);
        isGlobalConnectedRef.current = false;
      },
      onDisconnect: () => {
        console.log('[GlobalWebSocket] 연결 해제');
        isGlobalConnectedRef.current = false;
        subscriptionsRef.current = {};
      }
    });
  }, [userId, connect]);

  // 기본 알림 구독
  const subscribeToNotifications = useCallback(() => {
    if (!isConnected || !userId) return;

    // 1. 일반 알림 구독 (피드, 퀘스트, 시스템 등)
    const generalNotificationSub = subscribe(`/user/queue/notifications`, (notification) => {
      console.log('[GlobalWebSocket] 일반 알림 수신:', notification);
      addNotification(notification);
    });

    // 2. 강제 퇴장 알림 구독 (모든 채팅방)
    const kickNotificationSub = subscribe(`/user/queue/kick`, (kickNotification) => {
      console.log('[GlobalWebSocket] 강퇴 알림 수신:', kickNotification);
      handleGlobalKickNotification(kickNotification);
    });

    // 3. 친구 요청 알림
    const friendRequestSub = subscribe(`/user/queue/friend-requests`, (friendRequest) => {
      console.log('[GlobalWebSocket] 친구 요청 수신:', friendRequest);
      addNotification({
        type: 'FRIEND_REQUEST',
        title: '친구 요청',
        message: `${friendRequest.senderName}님이 친구 요청을 보냈습니다.`,
        data: friendRequest
      });
    });

    subscriptionsRef.current = {
      general: generalNotificationSub,
      kick: kickNotificationSub,
      friendRequest: friendRequestSub
    };

    console.log('[GlobalWebSocket] 기본 구독 완료');
  }, [isConnected, userId, subscribe]);

  // 채팅방별 동적 구독 (채팅방 입장 시 호출)
  const subscribeToChatRoom = useCallback((chatId) => {
    if (!isConnected) return null;

    console.log('[GlobalWebSocket] 채팅방 구독:', chatId);
    
    const chatSub = subscribe(`/topic/chat/${chatId}`, (message) => {
      console.log('[GlobalWebSocket] 채팅 메시지 수신:', message);
      // 채팅 메시지는 별도 상태로 관리하거나 이벤트로 전달
      window.dispatchEvent(new CustomEvent('chatMessage', { 
        detail: { chatId, message } 
      }));
    });

    // 구독 객체 저장
    subscriptionsRef.current[`chat_${chatId}`] = chatSub;
    
    return chatSub;
  }, [isConnected, subscribe]);

  // 채팅방 구독 해제
  const unsubscribeFromChatRoom = useCallback((chatId) => {
    const subscription = subscriptionsRef.current[`chat_${chatId}`];
    if (subscription) {
      subscription.unsubscribe();
      delete subscriptionsRef.current[`chat_${chatId}`];
      console.log('[GlobalWebSocket] 채팅방 구독 해제:', chatId);
    }
  }, []);

  // 전역 강퇴 알림 처리
  const handleGlobalKickNotification = useCallback((kickNotification) => {
    // 일반 알림으로도 추가
    addNotification({
      type: 'KICK',
      title: '채팅방 강제 퇴장',
      message: kickNotification.message || '관리자에 의해 채팅방에서 퇴장되었습니다.',
      data: kickNotification
    });

    // 해당 채팅방이 현재 열려있다면 이벤트 발생
    window.dispatchEvent(new CustomEvent('chatKick', { 
      detail: kickNotification 
    }));
  }, []);

  // 알림 추가
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      isRead: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // 토스트 알림 표시
    showToastNotification(newNotification);
  }, []);

  // 토스트 알림 표시
  const showToastNotification = useCallback((notification) => {
    // 브라우저 알림 API 사용
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png'
      });
    }

    // 커스텀 토스트도 표시 가능
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: notification 
    }));
  }, []);

  // 알림 읽음 처리
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    setUnreadCount(0);
  }, []);

  // 사용자 상태 전송 (온라인/오프라인)
  const sendUserStatus = useCallback((status) => {
    if (!isConnected) return;
    
    send('/app/user/status', {
      userId,
      status, // 'ONLINE', 'OFFLINE', 'BUSY' 등
      timestamp: new Date().toISOString()
    });
  }, [isConnected, userId, send]);

  // 초기 연결
  useEffect(() => {
    if (userId && !isGlobalConnectedRef.current) {
      connectGlobal();
    }
    
    return () => {
      // 컴포넌트 언마운트 시 연결 해제하지 않음 (글로벌이므로)
    };
  }, [userId, connectGlobal]);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 페이지 이탈 시 오프라인 상태 전송
  useEffect(() => {
    const handleBeforeUnload = () => {
      sendUserStatus('OFFLINE');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendUserStatus('AWAY');
      } else {
        sendUserStatus('ONLINE');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sendUserStatus]);

  return {
    // 연결 상태
    isConnected,
    
    // 알림 관련
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    
    // 채팅방 구독 관리
    subscribeToChatRoom,
    unsubscribeFromChatRoom,
    
    // 유틸리티
    sendUserStatus,
    
    // 수동 연결/해제 (필요시)
    connectGlobal,
    disconnect
  };
}
import { useState, useCallback } from "react";
import { create } from "zustand";
import axios from 'axios';
import API_ENDPOINTS from '../../utils/constants';
import { getAccessToken, getRefreshToken, setTokens, isTokenExpired, removeTokens } from "../../utils/tokenUtils";
// import SockJS from "sockjs-client";
import {Client} from "@stomp/stompjs";

const WEBSOCKET_ENDPOINT_URL = `${API_ENDPOINTS.WS}`;

export const useStore = create((set) => ({
  stompClient: null,
  setStompClient: (stompClient) => set({ stompClient }),
  senderId: null,
  setSenderId: (senderId) => set({ senderId }),
  isConnected: false,
  setIsConnected: (isConnected) => set({ isConnected }),
}));

// 사용자 참여 채팅방 수 확인 및 제한 확장 가능
export const useChatSubscriptionStore = create((set, get) => ({
  subscriptions: {},

  addSubscription: (chatId, subscription) =>
    set(state => ({
      subscriptions: {
        ...state.subscriptions,
        [chatId]: subscription,
      },
    })),

  removeSubscription: (chatId) =>
    set(state => {
      const updated = { ...state.subscriptions };
      delete updated[chatId];
      return { subscriptions: updated };
    }),

  getSubscription: (chatId) => get().subscriptions[chatId],
}));

export function useStomp() {
    const { setStompClient, setIsConnected, isConnected } = useStore();

    const connect = useCallback(
      async ({ onConnect, onError, onDisconnect }) => {
        let token = getAccessToken();
        if (isTokenExpired(token)) {
          try {
            const refreshToken = getRefreshToken();
            const res = await axios.post(`${API_ENDPOINTS.AUTH}/refresh-token`, null, {
              headers: {
                Authorization: `Bearer ${refreshToken}`
              },
            });

            const { accessToken: newAccessToken } = res.data;
            setTokens(newAccessToken, refreshToken);
            token = newAccessToken;
            console.log("[useStomp] accessToken 재발급 성공");
          } catch (err) {
            console.error("[useStomp] refreshToken 만료 → 로그아웃");
            removeTokens();
            window.location.href = '/login';
            return;
          }
        }

        // const socket = new SockJS(WEBSOCKET_ENDPOINT_URL);
        // STOMP 클라이언트 생성
        const stompClient = new Client({
        // webSocketFactory: () => socket,
        webSocketFactory: () => new WebSocket(`${WEBSOCKET_ENDPOINT_URL}?token=${token}`), // SockJs 사용 안하면 위 socket 지우고 이 줄만 작성
        debug: (msg) => console.log("[STOMP]:", msg),
        connectHeaders: {
          // UTF-8 인코딩 헤더 명시
          'Accept-Version': '1.1,1.0',
          'content-type': 'application/json;charset=UTF-8'
        },
        onConnect : () => {
            setIsConnected(true); // 전역 상태 업데이트
            onConnect();
        },
        onStompError: (e) => {
          console.error("[STOMP] 연결 실패: ", e);
          setIsConnected(false);
          onError(e);
        },
        onWebSocketError: (e) => {
          console.error("[STOMP] WebSocket 연결 에러: ", e);
          console.error("[STOMP] 에러 상세:", {
            type: e.type,
            target: e.target?.url,
            readyState: e.target?.readyState
          });
        },
        onDisconnect: () => {
            console.log("[STOMP] 연결 해제");
            setIsConnected(false);
            onDisconnect();
        },
        reconnectDelay: 5000, // 연결 끊어졌을 때 5초 후 재연결 시도
        heartbeatIncoming: 30000,
        heartbeatOutgoing: 30000,
        connectionTimeout: 10000,
      });

      stompClient.activate();
      setStompClient(stompClient);
    }, [setStompClient]
  );

  const disconnect = useCallback(() => {
  const currentClient = useStore.getState().stompClient;
    if (currentClient && typeof currentClient.deactivate === "function" && currentClient.active) {
      currentClient.deactivate();
      console.log("[useStomp] STOMP 연결 해제 완료");
      setStompClient(null);
      setIsConnected(false);
    } else {
      console.warn("[useStomp] disconnect skipped: stompClient 없거나 연결 안 됨 또는 deactivate 함수 없음.");
    }
  }, [setStompClient]);

  // 메시지 전송
  const send = useCallback((destination, payload, headers = {}) => {
    const client = useStore.getState().stompClient;
    if (client && client.connected) {
      client.publish({
        destination,
        body: JSON.stringify(payload),
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          ...headers
        }
      });
    } else {
      console.warn("[useStomp] send 실패: STOMP 연결되지 않음. 연결 상태:", client?.connected);
    }
  }, []);

  // 구독
  const subscribe = useCallback((topic, callback) => {
    const client = useStore.getState().stompClient;
    if (client && client.connected) {
      const subscription = client.subscribe(topic, (message) => {
        const body = JSON.parse(message.body);
        callback(body);
      });
      return subscription;
    } else {
      console.warn("[useStomp] subscribe 실패: STOMP 연결되지 않음");
    }
  }, []);

  // 구독 해제
  const unsubscribe = useCallback((subscription) => {
    if (subscription && typeof subscription.unsubscribe === "function") {
      subscription.unsubscribe();
      console.log("[useStomp] 구독 해제 완료");
    }
  }, []);

    return {
        connect,
        isConnected,
        disconnect,
        send,
        subscribe,
        unsubscribe
    };
}
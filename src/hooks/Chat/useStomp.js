import { useState, useCallback } from "react";
import { create } from "zustand/react";
import API_ENDPOINTS from '../../utils/constants';
// import SockJS from "sockjs-client";
import {Client} from "@stomp/stompjs";

const WEBSOCKET_ENDPOINT_URL = `${API_ENDPOINTS.WS}`;

export const useStore = create((set) => ({
  accessToken: "AXmxOoAbZ+MzB31Diio24unhX3uPneVd0TJCeALqTfhDgHohZdzHG/DXf41DUXQIH+gR1QL7s5ONGcjCZeIg1g== ",
  setAccessToken: (accessToken) => set({ accessToken }),
  stompClient: null,
  setStompClient: (stompClient) => set({ stompClient }),
  senderId: null,
  setSenderId: (senderId) => set({ senderId }),
}));

export function useStomp() {
    // const [accessToken, setAccessToken] = useState(null);
    // const [stompClient, setStompClient] = useState(null);
    // const [memberId, setMemberId] = useState(null);
    const { setStompClient } = useStore();

    const connect = useCallback(
        /**
         * STOMP 클라이언트를 활성화하고 연결합니다.
         * @param {ConnectOptions} options - 연결 옵션 객체
         */
    ({
      accessToken,
      onConnect,
      onError,
      onDisconnect
    }) => {
        // const socket = new SockJS(WEBSOCKET_ENDPOINT_URL);

        // STOMP 클라이언트 생성
        const stompClient = new Client({
       // webSocketFactory: () => socket,
        webSocketFactory: () => new WebSocket(WEBSOCKET_ENDPOINT_URL),
        debug: (msg) => console.log("[STOMP]:", msg),
        connectHeaders: {
          // 필요시 인증 토큰 등을 보낼 수 있습니다. (예: 'Authorization': `Bearer ${yourAuthToken}`)
          Authorization: `Bearer ${accessToken}`,
        },
        onConnect : () => {
            console.log("[STOMP] 연결 성공");
            onConnect();
        },
        onStompError: (e) => {
          console.error("[STOMP] 연결 실패: ", e);
          onError(e);
        },
        onDisconnect: () => {
            console.log("[STOMP] 연결 해제");
            onDisconnect();
        },
        reconnectDelay: 5000, // 연결 끊어졌을 때 5초 후 재연결 시도
        heartbeatIncoming: 4000, // 서버가 4초 이내에 heartbeat를 보내지 않으면 연결 끊김으로 간주
        heartbeatOutgoing: 4000,
      });

      stompClient.activate();
      setStompClient(stompClient);
    }, [setStompClient]
);

    return {
        connect
    };
}
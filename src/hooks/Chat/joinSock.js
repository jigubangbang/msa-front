// src/hooks/Chat/joinSock.js
import { useState, useEffect, useCallback } from 'react';
import { useStomp, useStore } from "./useStomp";
import API_ENDPOINTS from '../../utils/constants';

const WEBSOCKET_ENDPOINT_URL = `${API_ENDPOINTS.WS}`; // 백엔드 서버 주소와 포트를 정확히 명시

export function joinSock(isOpen, onClose, chatId, senderId) {
  const { accessToken, stompClient, senderId: storeSenderId } = useStore();
  // const accessToken = localStorage.getItem("accessToken");
  // const accessToken = "AXmxOoAbZ+MzB31Diio24unhX3uPneVd0TJCeALqTfhDgHohZdzHG/DXf41DUXQIH+gR1QL7s5ONGcjCZeIg1g== ";
  const { connect } = useStomp();

  const effectiveSenderId = senderId || storeSenderId;

  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [chatGroup, setChatGroup] = useState(null); // 채팅 그룹 정보 (UI 표시용)
  const [messages, setMessages] = useState([]); // 실시간으로 수신되는 메시지 목록
  const [error, setError] = useState(null);

     // 과거 메세지 기록 불러오기
    /*
    useEffect(() => {
      if (!chatId || !isOpen) {
        setIsJoining(false);
        setMessages([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      const fetchChatHistory = async () => {
        setIsLoading(true);
        setError(null);
        setIsJoining(false);
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
          setIsJoining(false); // 에러 발생 시 로딩 중단
        }
      };

    fetchChatHistory();
    */

    // 
    const activateStompClient = useCallback(() => {
      const currentStompClient = useStore.getState().stompClient;
      if (currentStompClient && currentStompClient.connected) {
        console.log("[joinChat] STOMP client already connected, skipping activation.");
        return;
      }

      console.log(`[joinSock] Activating STOMP client for chat ${chatId} as ${effectiveSenderId}`);
      setIsLoading(true); // STOMP 활성화 시 로딩 시작
      setError(null);

      // useStomp 훅의 connect 함수 호출
      connect({
        accessToken: accessToken,
        onConnect: () => {
          console.log("[joinChat] STOMP 연결 성공 콜백");
          const clientAfterConnect = useStore.getState().stompClient;
          if (clientAfterConnect) {
            clientAfterConnect.publish({
              destination: `/app/chat.addUser/${chatId}`,
              body: JSON.stringify({senderId: effectiveSenderId, message: "joinded"}),
            });
            console.log(`[joinChat] Published join message for ${senderId} to /app/chat.addUser/${chatId}`);
          
            clientAfterConnect.subscribe(`/topic/chat/${chatId}`, (message) => {
                  console.log('[joinChat] 메시지 수신: ', message.body);
                  const receivedMessage = JSON.parse(message.body);
                  setMessages((prevMessages) => [...prevMessages, receivedMessage]);
              });
              console.log(`[joinChat] Subscribed to /topic/chat/${chatId}`);
          }
          setIsLoading(false); // 연결 성공 및 구독 후 로딩 해제
        },
        onError: (e) => {
          console.error("[joinChat] STOMP 연결 또는 구독 에러 : ", e );
          setError(new Error( "STOMP 연결/구독 실패: " + (e.headers?.message || e.body ||  "알 수 없는 에러")));
          setIsLoading(false);
        },
        onDisconnect: () => {
          console.log("[joinChat] STOMP 연결 해제 콜백");
        },
      });
    }, [accessToken, chatId, effectiveSenderId, connect]);

  useEffect(() => {
    console.log("[joinSock] useEffect triggered with:", { chatId, isOpen, senderId });
    if (!chatId || !isOpen || !effectiveSenderId ) {
      console.log("[joinSock] 초기화 건너뛰기: 정보 부족 또는 모달 닫힘", { chatId, isOpen, effectiveSenderId });
      setIsLoading(false);
      setIsJoining(false);
      setError(null); // 에러 상태 초기화
      return; // 훅 실행 중단
    }

    console.log(`[joinSock] 채팅방 초기화 시작: ${chatId} (${effectiveSenderId})`); // ✅ effectiveSenderId 사용
    setIsLoading(true); // 전체 로딩 시작
    setError(null);
    setIsJoining(true); // REST API 입장 로딩 시작


    // 과거 메세지 조회 여기 넣어야 함

    const initializeChatRoomLogic = async () => {
        // 현재는 과거 메시지 조회가 주석 처리되어 있으므로, REST API 입장만 포함
        let restApiJoinSuccess = false;
        try {
            // REST API 호출 (api 객체 사용, 주석 해제)
            const joinResponse = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/join`, { // ✅ fetch 사용, URL 수정
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': effectiveSenderId // ✅ effectiveSenderId 사용
                },
                body: JSON.stringify({}) // POST 요청 본문
            });

            if (joinResponse.ok) { // ✅ response.ok 확인
                const data = await joinResponse.json(); // ✅ 응답이 JSON 형식일 경우 파싱
                console.log("[joinSock] 채팅방 REST 입장 성공:", data);
                setIsJoining(false);
                restApiJoinSuccess = true;
            } else {
                const errorText = await joinResponse.text(); // ✅ 에러 응답 텍스트 파싱
                setError(new Error("채팅방 입장 실패: " + joinResponse.status + " " + errorText));
                setIsJoining(false);
            }
        } catch (err) {
            console.error("[joinSock] REST API 입장 실패:", err);
            setError(new Error("REST API 입장 실패: " + (err.message || "알 수 없는 에러")));
            setIsJoining(false);
        }

        if (restApiJoinSuccess) {
            activateStompClient(); // ✅ REST API 성공 시에만 STOMP 활성화
        } else {
            setIsLoading(false); // REST API 실패 시 로딩 해제
        }
    };

    initializeChatRoomLogic(); // ✅ 정의된 로직을 여기서 호출합니다.

    // ✅ 클린업 함수: 컴포넌트 언마운트 또는 의존성 변경 시
    return () => {
      console.log("[joinSock] 훅 클린업 실행.");
      setIsJoining(false);
      setMessages([]);
      setIsLoading(false);
      setError(null);
    };

  }, [chatId, isOpen, effectiveSenderId, activateStompClient]);

    // 메시지 전송
    const sendMessage = useCallback((messageContent) => {
      const currentStompClient = useStore.getState().stompClient;
      if (!messageContent.trim() || !currentStompClient || !currentStompClient.connected) {
        console.warn("[joinChat] 메시지 전송 불가: 내용 없거나 STOMP 연결 안됨.");
        return;
      }
      
      const messageDto = {
        chatId: chatId, // 백엔드 ChatMsgDto의 Long chatId 필드에 맞춤
        senderId: effectiveSenderId, // useStore에서 가져온 senderId 사용
        message: messageContent, 
      };

      currentStompClient.publish({
          destination: `/app/chat.send/${chatId}`, // 백엔드 @MessageMapping 경로
          body: JSON.stringify(messageDto),
        });
        console.log('Sent message:', messageDto);
      }, [chatId, effectiveSenderId]);

      return { messages, sendMessage, isLoading, error, isJoining, stompClient };
  }
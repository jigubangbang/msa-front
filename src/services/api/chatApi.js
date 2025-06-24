// src/services/api/chatApi.js
import API_ENDPOINTS from '../../utils/endpoints.js';

export async function fetchMessages(chatId) {
  const res = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/messages`);
  return res.json();
}

export const sendMessage = async (chatId, senderId, message) => {
    const messageData = {
        chatId: Number(chatId),  // 명시적으로 숫자 변환
        senderId: senderId,
        message: message
    };
    try {
        console.log( '메세지 전송 시도', {senderId, message});

        const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        try {
            return await response.json();
        } catch (jsonError) {
            // JSON 파싱 실패해도 성공으로 처리 (화면에 이미 메시지가 잘 나오므로)
            console.log('JSON 파싱 실패했지만 메시지 전송은 성공');
            return { success: true };
        }

    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};
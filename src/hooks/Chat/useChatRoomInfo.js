import { useState, useEffect, useCallback } from 'react';
import API_ENDPOINTS from '../../utils/constants';
import api from '../../apis/api';

const useChatRoomInfo = (chatId) => {
  const [info, setInfo] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChatRoomInfo = useCallback(async () => {
    if (!chatId) {
      setInfo(null);
      setMembers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [infoRes, membersRes] = await Promise.all([
        api.get(`${API_ENDPOINTS.CHAT}/${chatId}/info`),
        api.get(`${API_ENDPOINTS.CHAT}/${chatId}/members`)
      ]);
      setInfo(infoRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      setError(err);
      console.error("[useChatRoomInfo] 채팅방 정보 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchChatRoomInfo();
  }, [fetchChatRoomInfo]);

  return {
    info,
    members,
    loading,
    error,
    refetch: fetchChatRoomInfo, // 외부에서 수동 호출 가능
  };
};

export default useChatRoomInfo;
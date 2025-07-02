import { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../utils/constants';
import api from '../../apis/api';

const useChatRoomInfo = (chatId) => {
  const [info, setInfo] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatId) {
      setInfo([]);
      setMembers([]);
      return;
    }

    let isMounted = true;

    const fetchInfo = async () => {
      setLoading(true); 
      setError(null);
      try {
        const [responseInfo, responseMembers] = await Promise.all([
          api.get(`${API_ENDPOINTS.CHAT}/${chatId}/info`),
          api.get(`${API_ENDPOINTS.CHAT}/${chatId}/members`)
        ]);
        if (!isMounted) return;

        setInfo(responseInfo.data);
        setMembers(responseMembers.data);
        console.log(responseInfo, responseMembers.data.length);
      } catch (err) {
        setError(err);
        console.error("채팅방 멤버를 불러오는 중 에러 발생:", err);
      } finally {
        // 성공/실패 여부와 관계없이 로딩 종료
        if (isMounted) setLoading(false);
      }
    };

    fetchInfo();
    return () => {
      isMounted = false;
    };
  }, [chatId]);

  return { info, members, loading, error };
};

export default useChatRoomInfo;
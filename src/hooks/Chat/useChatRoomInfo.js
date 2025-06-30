import { useState, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../../utils/constants';


const useChatRoomInfo = (chatId) => {
  const [info, setInfo] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // chatId가 유효하지 않으면 API를 호출하지 않음
    if (!chatId) {
      setMembers([]);
      return;
    }

    // API를 호출하는 비동기 함수
    const fetchInfo = async () => {
      setLoading(true); 
      setError(null);
      try {
        const [responseInfo, responseMembers] = await Promise.all([
          axios.get(`${API_ENDPOINTS.CHAT}/${chatId}/info`),
          axios.get(`${API_ENDPOINTS.CHAT}/${chatId}/members`)
        ]);
        setInfo(responseInfo.data);
        setMembers(responseMembers.data);
        console.log(responseInfo, responseMembers.data.length);
      } catch (err) {
        setError(err);
        console.error("채팅방 멤버를 불러오는 중 에러 발생:", err);
      } finally {
        // 성공/실패 여부와 관계없이 로딩 종료
        setLoading(false);
      }
    };

    fetchInfo();

  }, [chatId]);

  return { info, members, loading, error };
};

export default useChatRoomInfo;
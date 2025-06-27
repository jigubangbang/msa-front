import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_ENDPOINTS from "../../utils/constants";

const SocialLoginHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;  
    hasRun.current = true; 

    const fetchSocialToken = async () => {
      const code = new URL(window.location.href).searchParams.get("code");
      const path = location.pathname;
      let provider = null;
      if (path.includes("kakao")) provider = "kakao";
      else if (path.includes("naver")) provider = "naver";
      else if (path.includes("google")) provider = "google";

      if (!provider || !code) {
        alert("잘못된 접근입니다.");
        navigate("/login");
        return;
      }

      try {
        console.log('요청할 코드:', code);
        console.log('요청 URL:', `${API_ENDPOINTS.AUTH}/${provider}`);
        
        // provider 추가
        const response = await axios.post(`${API_ENDPOINTS.AUTH}/${provider}`, { 
          code: code,
          provider: provider
        });

        const { accessToken, refreshToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        navigate("/", { replace: true });
      } catch (error) {
        console.error('상세 에러 정보:', error.response?.data);
        console.error('에러 상태:', error.response?.status);
        console.error('에러 헤더:', error.response?.headers);
        
        alert(`${provider} 로그인에 실패했습니다: ${error.response?.data?.message || error.message}`);
        navigate("/login");
      }
    };

    fetchSocialToken();
  }, []);

  return <div>로그인 처리 중...</div>;
};

export default SocialLoginHandler;
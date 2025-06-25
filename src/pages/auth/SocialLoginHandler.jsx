import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const SocialLoginHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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
        const response = await axios.post(`http://localhost:8081/auth/${provider}`, {
          code,
        });

        const { accessToken, refreshToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        navigate("/", { replace: true });
      } catch (error) {
        console.error(`${provider} 로그인 실패:`, error);
        alert(`${provider} 로그인에 실패했습니다.`);
        navigate("/login");
      }
    };

    fetchSocialToken();
  }, [navigate, location]);

  return <div>로그인 처리 중...</div>;
};

export default SocialLoginHandler;

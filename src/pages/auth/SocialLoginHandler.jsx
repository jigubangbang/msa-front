import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from '../../apis/api';
import API_ENDPOINTS from "../../utils/constants";
import { Circles } from "react-loader-spinner";
import styles from "./SocialLoginHandler.module.css";

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
        alert("잘못된 접근입니다. 다시 시도해 주세요.");
        navigate("/login");
        return;
      }

      try {
        console.log("요청할 코드:", code);
        console.log("요청 URL:", `${API_ENDPOINTS.AUTH}/${provider}`);

        // provider 추가
        const response = await api.post(`${API_ENDPOINTS.AUTH}/${provider}`, {
          code: code,
          provider: provider,
        });

        const { accessToken, refreshToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        navigate("/", { replace: true });
      } catch (error) {
        console.error("상세 에러 정보:", error.response?.data);
        console.error("에러 상태:", error.response?.status);
        console.error("에러 헤더:", error.response?.headers);

        navigate("/login", {
          state: {
            errorMessage:
              error.response?.data?.message ||
              "로그인에 실패했습니다. 다시 시도해 주세요.",
          },
          replace: true,
        });
      }
    };

    fetchSocialToken();
  }, []);

  return (
    <div className={styles.loadingContainer}>
      <Circles
        height="50"
        width="50"
        color="#000"
        ariaLabel="circles-loading"
      />
    </div>
  );
};

export default SocialLoginHandler;

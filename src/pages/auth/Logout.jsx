import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 우리 서비스 토큰 삭제
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // 메인 페이지로 이동
    navigate("/", { replace: true });
  }, []);

  return null; 
};

export default Logout;

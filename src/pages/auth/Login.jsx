import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./Login.module.css";
import IdIcon from "../../assets/auth/id.svg";
import PasswordIcon from "../../assets/auth/password.svg";
import VisibleIcon from "../../assets/auth/visible.svg";
import VisibleOffIcon from "../../assets/auth/visible_off.svg";
import KakaoIcon from "../../assets/auth/kakao.svg";
import NaverIcon from "../../assets/auth/naver.svg";
import GoogleIcon from "../../assets/auth/google.svg";
import { Circles } from 'react-loader-spinner';

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 에러 초기화
    setErrors({});
    setMessage("");
    setIsLoading(true);
    
    // 유효성 검사
    const newErrors = {}; 
    if (!userId.trim()) {
      newErrors.userId = "아이디를 입력해 주세요";
    }
    if (!password.trim()) {
      newErrors.password = "비밀번호를 입력해 주세요";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false); 
      return;
    }
    
    try {
      const response = await axios.post(`${API_ENDPOINTS.AUTH}/login`, {
        userId,
        password,
      });
      console.log("로그인 성공:", response.data);
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      navigate("/", { replace: true }); // 메인페이지 이동 (뒤로가기 방지)
      
    } catch (error) {
      console.error("로그인 실패:", error);
      setMessage("아이디 또는 비밀번호가 일치하지 않습니다");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 소셜 로그인
  const handleSocialLogin = (provider) => {
    console.log('소셜 로그인 시도:', provider);
    if (provider === 'kakao') {
      const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
      const REDIRECT_URI = 'http://localhost:5173/oauth/kakao/callback'; // 카카오에 등록한 Redirect URI
      const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
      window.location.href = kakaoAuthURL;
    } else if (provider === 'naver') {
      const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
      const REDIRECT_URI = 'http://localhost:5173/oauth/naver/callback';
      const STATE = crypto.randomUUID();
      const naverAuthURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}`;
      window.location.href = naverAuthURL;
    } else if (provider === 'google') {
      const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const REDIRECT_URI = 'http://localhost:5173/oauth/google/callback';
      const STATE = crypto.randomUUID();
      const SCOPE = 'openid email profile';
      const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(SCOPE)}&state=${STATE}&access_type=offline&prompt=consent`;
      window.location.href = googleAuthURL;
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <div className={styles.logo}>지구방방 로그인</div>
        </div>
        
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <img src={IdIcon} alt="id" className={styles.inputIcon} />
              <input 
                type="text" 
                id="userId" 
                className={`${styles.formInput} ${errors.userId ? styles.inputError : ''}`}
                placeholder="아이디를 입력해 주세요"
                value={userId}
                onKeyDown={(e) => {
                  if (e.key === ' ') {
                    e.preventDefault(); // 스페이스바 입력 차단
                  }
                }}
                onChange={(e) => {
                  setUserId(e.target.value);
                  if (errors.userId) {
                    setErrors(prev => ({ ...prev, userId: '' }));
                  }
                }}
              />
            </div>
            {errors.userId && (
              <div className={styles.errorText}>{errors.userId}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <img src={PasswordIcon} alt="password" className={styles.inputIcon} />
              <input 
                type={showPassword ? "text" : "password"}
                id="password" 
                className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
                placeholder="비밀번호를 입력해 주세요"
                value={password}
                onKeyDown={(e) => {
                  if (e.key === ' ') {
                    e.preventDefault(); // 스페이스바 입력 차단
                  }
                }}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
              />
              <img 
                src={showPassword ? VisibleIcon : VisibleOffIcon}
                alt="비밀번호 보기"
                className={styles.toggleIcon}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
            {errors.password && (
              <div className={styles.errorText}>{errors.password}</div>
            )}
          </div>
          
          {/* 로그인 실패 메시지 */}
          {message && messageType === "error" && (
            <div className={styles.loginErrorMessage}>
              <span className={styles.errorIcon}>!</span>
              {message}
            </div>
          )}
          
          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <Circles height="20" width="20" color="#fff" />
            ) : (
              "로그인"
            )}
          </button>
        </form>

        {/* 소셜 로그인 영역 */}
        <div className={styles.divider}>
          <span>또는 간편 로그인</span>
        </div>
        
        <div className={styles.socialLogin}>
          <button 
            type="button" 
            className={`${styles.socialButton} ${styles.google}`}
            onClick={() => handleSocialLogin('google')}
          >
            <img src={GoogleIcon} alt="구글 로그인" className={styles.socialIcon}/>
            <span className={styles.socialText}>구글 로그인</span>
          </button>
          
          <button 
            type="button" 
            className={`${styles.socialButton} ${styles.naver}`}
            onClick={() => handleSocialLogin('naver')}
          >
            <img src={NaverIcon} alt="네이버 로그인" className={styles.socialIcon}/>
            <span className={styles.socialText}>네이버 로그인</span>
          </button>
          
          <button 
            type="button" 
            className={`${styles.socialButton} ${styles.kakao}`}
            onClick={() => handleSocialLogin('kakao')}
          >
            <img src={KakaoIcon} alt="카카오 로그인" className={styles.socialIcon}/>
            <span className={styles.socialText}>카카오 로그인</span>
          </button>
        </div>
        
        <div className={styles.divider}>
          <span>계정 찾기 및 가입</span>
        </div>
        
        <div className={styles.findLinks}>
          <a href="/find-id" className={styles.findLink}>아이디 찾기</a>
          <a href="/find-password" className={styles.findLink}>비밀번호 찾기</a>
          <a href="/register" className={`${styles.findLink} ${styles.primary}`}>회원가입</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
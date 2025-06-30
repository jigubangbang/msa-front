import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./FindResult.module.css";

const FindResult = ({ 
  message, // 메시지 
  subMessage, // 서브 메시지 (선택적)
  onReset
}) => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className={styles.resultContainer}>
      {/* 성공 메시지 */}
      <div className={styles.successMessage}>
        <span className={styles.successIcon}>✓</span>
        <div className={styles.messageContent}>
          <div className={styles.mainMessage}>{message}</div>
          {subMessage && (
            <div className={styles.subMessage}>{subMessage}</div>
          )}
        </div>
      </div>

      {/* 로그인 버튼 */}
      <button 
        onClick={handleGoToLogin}
        className={styles.loginButton}
      >
        로그인 하기
      </button>

      {/* 구분선 */}
      <div className={styles.divider}>
        <span>계정 찾기</span>
      </div>

      {/* 링크 영역 */}
      <div className={styles.linkContainer}>
        <button onClick={onReset} className={styles.findLink}>
          아이디 찾기
        </button>
        <Link to="/find-password" className={styles.findLink}>
          비밀번호 찾기
        </Link>
      </div>
    </div>
  );
};

export default FindResult;
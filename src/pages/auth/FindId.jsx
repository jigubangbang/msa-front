import React, { useState } from "react";
import axios from "axios";
import API_ENDPOINTS from "../../utils/constants";
import FindContainer from "../../components/auth/FindContainer";
import FindResult from "../../components/auth/FindResult";
import styles from "./FindId.module.css";
import NameIcon from "../../assets/auth/name.svg"; 
import EmailIcon from "../../assets/auth/email.svg";
import { Circles } from "react-loader-spinner";

const FindId = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // 이름 유효성 검사 
  const validateName = (name) => {
    const namePattern = /^[가-힣]{2,6}$/;
    return namePattern.test(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 에러 및 메시지 초기화
    setErrors({});
    setMessage("");
    
    // 유효성 검사
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "이름을 입력해 주세요";
    } else if (!validateName(name.trim())) {
      newErrors.name = "이름은 2~6자의 한글만 입력 가능합니다";
    }
    
    if (!email.trim()) {
      newErrors.email = "이메일을 입력해 주세요";
    } else if (!validateEmail(email.trim())) {
      newErrors.email = "올바른 이메일 형식으로 입력해 주세요";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_ENDPOINTS.AUTH}/find-id`, {
        name: name.trim(),
        email: email.trim(),
      });

      console.log("아이디 찾기 성공:", response.data);

      // 소셜 로그인 계정
      if (response.data?.isSocial) {
        setMessage("소셜 로그인 가입 회원입니다");
        setMessageType("error");
        return; 
      }

      // 일반 회원 
      setShowResult(true);

    } catch (error) {
      console.error("아이디 찾기 실패:", error);

      if (error.response?.status === 404) {
        setMessage("입력하신 정보와 일치하는 계정이 없습니다");
        setMessageType("error");
      } else {
        setMessage("아이디 찾기에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setMessageType("error");
      }
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowResult(false);
    setName("");
    setEmail("");
    setErrors({});
    setMessage("");
    setMessageType("");
  };


  const renderForm = () => (
    <form className={styles.findForm} onSubmit={handleSubmit}>
      <div className={styles.description}>
        회원가입 시 입력한 이름과 이메일을 입력해주세요
      </div>

      <div className={styles.formGroup}>
        <div className={styles.inputWrapper}>
          <img src={NameIcon} alt="name" className={styles.inputIcon} />
          <input 
            type="text" 
            id="name" 
            className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
            placeholder="이름을 입력해 주세요"
            value={name}
            onKeyDown={(e) => {
              if (e.key === ' ') {
                e.preventDefault(); 
              }
            }}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: '' }));
              }
              if (message) {
                setMessage("");
              }
            }}
            disabled={isLoading}
          />
        </div>
        {errors.name && (
          <div className={styles.errorText}>{errors.name}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <div className={styles.inputWrapper}>
          <img src={EmailIcon} alt="email" className={styles.inputIcon} />
          <input 
            type="text"
            id="email" 
            className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
            placeholder="이메일을 입력해 주세요"
            value={email}
            onKeyDown={(e) => {
              if (e.key === ' ') {
                e.preventDefault(); 
              }
            }}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: '' }));
              }
              if (message) {
                setMessage("");
              }
            }}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <div className={styles.errorText}>{errors.email}</div>
        )}
      </div>

      {/* 에러 메시지 */}
      {message && messageType === "error" && (
        <div className={styles.findErrorMessage}>
          <span className={styles.errorIcon}>!</span>
          {message}
        </div>
      )}
      
      <button 
        type="submit" 
        className={styles.findButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <Circles height="20" width="20" color="#fff" />
        ) : (
          "아이디 찾기"
        )}
      </button>
    </form>
  );

  return (
    <FindContainer title="아이디 찾기">
      {showResult ? (
        <FindResult 
          message="이메일로 아이디를 발송했습니다. 메일함을 확인해주세요!"
          subMessage={
            <>
              이메일 수신까지 최대 몇 분 정도 소요될 수 있습니다.<br/>
              누락되었을 경우, 아이디 찾기를 다시 시도해 주시기 바랍니다.
            </>
          }
          onReset={handleReset}
        />
      ) : (
        renderForm()
      )}
    </FindContainer>
  );
};

export default FindId;
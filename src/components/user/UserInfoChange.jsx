import React, { useState, useEffect } from 'react';
import api from '../../apis/api';
import API_ENDPOINTS from "../../utils/constants";
import styles from './UserInfoChange.module.css';
import IdIcon from "../../assets/auth/id.svg";
import NameIcon from "../../assets/auth/name.svg";
import NicknameIcon from "../../assets/auth/nickname.svg";
import TelIcon from "../../assets/auth/tel.svg";
import EmailIcon from "../../assets/auth/email.svg";
import CheckIcon from "../../assets/auth/check.svg";
import CancelIcon from "../../assets/auth/cancel.svg";

export default function UserInfoChange({ userInfo, onUpdate }) {
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    tel: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    if (userInfo) {
      setForm({
        name: userInfo.name || '',
        nickname: userInfo.nickname || '',
        tel: userInfo.tel || '',
        email: userInfo.email || ''
      });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = value.replace(/\s/g, "");

    setForm(prev => ({ ...prev, [name]: cleanedValue }));
    setMessage("");

    // 유효성 검사
    if (name === "name") {
      if (cleanedValue === "") {
        setErrors(prev => ({ ...prev, name: "" }));
        return;
      }
      const namePattern = /^[가-힣]{2,6}$/;
      if (!namePattern.test(cleanedValue)) {
        setErrors(prev => ({
          ...prev,
          name: "이름은 2~6자의 한글만 입력 가능합니다",
        }));
      } else {
        setErrors(prev => ({ ...prev, name: "" }));
      }
    }

    if (name === "nickname") {
      if (cleanedValue === "") {
        setErrors(prev => ({ ...prev, nickname: "" }));
        return;
      }
      const nicknamePattern = /^[가-힣a-zA-Z0-9]{1,10}$/;
      if (!nicknamePattern.test(cleanedValue)) {
        setErrors(prev => ({
          ...prev,
          nickname: "닉네임은 1~10자의 한글, 영문, 숫자만 입력 가능합니다",
        }));
      } else {
        setErrors(prev => ({ ...prev, nickname: "" }));
      }
    }

    if (name === "tel") {
      if (cleanedValue === "") {
        setForm(prev => ({ ...prev, tel: "" }));
        setErrors(prev => ({ ...prev, tel: "" }));
        return;
      }
      
      const onlyDigits = value.replace(/\D/g, "");
      let formatted = onlyDigits;
      if (onlyDigits.length <= 3) {
        formatted = onlyDigits;
      } else if (onlyDigits.length <= 7) {
        formatted = `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3)}`;
      } else {
        formatted = `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3, 7)}-${onlyDigits.slice(7, 11)}`;
      }

      setForm(prev => ({ ...prev, [name]: formatted }));

      const telPattern = /^\d{3}-\d{3,4}-\d{4}$/;
      if (!telPattern.test(formatted)) {
        setErrors(prev => ({
          ...prev,
          tel: "올바른 전화번호 형식으로 입력해 주세요",
        }));
      } else {
        setErrors(prev => ({ ...prev, tel: "" }));
      }
    }
  };

  // 기본 정보 수정 (이름, 닉네임, 전화번호)
  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // 유효성 검사
    const hasError = Object.values(errors).some(err => err);
    if (hasError) {
      setMessage("조건에 맞게 입력해 주세요");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_ENDPOINTS.USER}/me`, {
        name: form.name,
        nickname: form.nickname,
        tel: form.tel
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("회원정보가 성공적으로 수정되었습니다");
      setMessageType("success");
      onUpdate(); 
    } catch (err) {
      setMessage(err.response?.data || "회원정보 수정에 실패했습니다");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 변경 요청
  const handleEmailChangeRequest = async () => {
    if (!newEmail) {
      setMessage("변경할 이메일을 입력해주세요");
      setMessageType("error");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      setMessage("올바른 이메일 형식으로 입력해 주세요");
      setMessageType("error");
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_ENDPOINTS.USER}/email/change-request`, null, {
        params: { email: newEmail },
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmailCodeSent(true);
      setMessage("인증 코드가 이메일로 전송되었습니다");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data || "인증 코드 전송에 실패했습니다");
      setMessageType("error");
    }
  };

  // 이메일 변경 확인
  const handleEmailChangeConfirm = async () => {
    if (!emailCode) {
      setMessage("인증 코드를 입력해주세요");
      setMessageType("error");
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await api.put(`${API_ENDPOINTS.USER}/email/change-confirm`, {
        email: newEmail,
        emailCode: emailCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("이메일이 성공적으로 변경되었습니다");
      setMessageType("success");
      setShowEmailModal(false);
      setEmailCodeSent(false);
      setEmailCode("");
      setNewEmail("");
      onUpdate(); 
    } catch (err) {
      setMessage(err.response?.data || "이메일 변경에 실패했습니다");
      setMessageType("error");
    }
  };

  // 닉네임 변경 가능일
  const getNicknameStatusMessage = () => {
    if (!userInfo?.nicknameUnlockAt) return null;
    
    const unlockDate = new Date(userInfo.nicknameUnlockAt);
    const now = new Date();
    
    if (now < unlockDate) {
      return `${unlockDate.toLocaleDateString()} ${unlockDate.toLocaleTimeString()}에 변경 가능합니다`;
    }
    return null;
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>기본 정보 수정</h2>
      
      <form onSubmit={handleBasicInfoSubmit} className={styles.form}>
        {/* 아이디 (읽기전용) */}
        <div className={styles.formGroup}>
          <label className={styles.label}>아이디</label>
          <div className={styles.inputWrapper}>
            <img src={IdIcon} alt="아이디" className={styles.inputIcon} />
            <input
              type="text"
              value={userInfo?.id || ''}
              disabled
              className={`${styles.formInput} ${styles.disabled}`}
            />
          </div>
          <div className={styles.helpText}>아이디는 변경할 수 없습니다</div>
        </div>

        {/* 이름 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>이름</label>
          <div className={styles.inputWrapper}>
            <img src={NameIcon} alt="이름" className={styles.inputIcon} />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onFocus={() => {
                setFocusedField("name");
                setMessage("");
              }}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              className={`${styles.formInput} ${
                form.name === ""
                  ? ""
                  : errors.name
                  ? styles.inputError
                  : styles.inputValid
              }`}
              placeholder="이름을 입력해 주세요"
            />
          </div>
          {focusedField === "name" && errors.name && form.name && (
            <div className={styles.errorText}>{errors.name}</div>
          )}
        </div>

        {/* 닉네임 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>닉네임</label>
          <div className={styles.inputWrapper}>
            <img src={NicknameIcon} alt="닉네임" className={styles.inputIcon} />
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              onFocus={() => {
                setFocusedField("nickname");
                setMessage("");
              }}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              className={`${styles.formInput} ${
                form.nickname === ""
                  ? ""
                  : errors.nickname
                  ? styles.inputError
                  : styles.inputValid
              }`}
              placeholder="닉네임을 입력해 주세요"
            />
          </div>
          {focusedField === "nickname" && errors.nickname && form.nickname && (
            <div className={styles.errorText}>{errors.nickname}</div>
          )}
          {getNicknameStatusMessage() && (
            <div className={styles.warningText}>{getNicknameStatusMessage()}</div>
          )}
        </div>

        {/* 전화번호 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>전화번호</label>
          <div className={styles.inputWrapper}>
            <img src={TelIcon} alt="전화번호" className={styles.inputIcon} />
            <input
              type="text"
              name="tel"
              value={form.tel}
              onChange={handleChange}
              onFocus={() => {
                setFocusedField("tel");
                setMessage("");
              }}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              className={`${styles.formInput} ${
                form.tel === ""
                  ? ""
                  : errors.tel
                  ? styles.inputError
                  : styles.inputValid
              }`}
              placeholder="전화번호를 입력해 주세요"
            />
          </div>
          {focusedField === "tel" && errors.tel && (
            <div className={styles.errorText}>{errors.tel}</div>
          )}
        </div>

        {/* 이메일 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>이메일</label>
          <div className={styles.inputWrapper}>
            <img src={EmailIcon} alt="이메일" className={styles.inputIcon} />
            <input
              type="text"
              value={userInfo?.email || ''}
              disabled
              className={`${styles.formInput} ${styles.disabled}`}
            />
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className={styles.changeEmailButton}
            >
              변경
            </button>
          </div>
          <div className={styles.helpText}>이메일 변경 시 인증이 필요합니다</div>
        </div>

        {/* 메시지 */}
        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            {messageType === "error" && <span className={styles.errorIcon}>!</span>}
            {message}
          </div>
        )}

        {/* 저장 버튼 */}
        <button 
          type="submit" 
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? "저장 중..." : "변경사항 저장"}
        </button>
      </form>

      {/* 이메일 변경 모달 */}
      {showEmailModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>이메일 변경</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>새 이메일</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={styles.formInput}
                placeholder="새 이메일을 입력해주세요"
              />
            </div>

            {emailCodeSent && (
              <div className={styles.formGroup}>
                <label className={styles.label}>인증 코드</label>
                <input
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  className={styles.formInput}
                  placeholder="인증 코드를 입력해주세요"
                />
              </div>
            )}

            <div className={styles.modalButtons}>
              <button
                type="button"
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailCodeSent(false);
                  setEmailCode("");
                  setNewEmail("");
                }}
                className={styles.cancelButton}
              >
                취소
              </button>
              
              {!emailCodeSent ? (
                <button
                  type="button"
                  onClick={handleEmailChangeRequest}
                  className={styles.submitButton}
                >
                  인증 코드 전송
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEmailChangeConfirm}
                  className={styles.submitButton}
                >
                  이메일 변경
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
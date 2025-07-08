import React, { useState } from "react";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./PasswordChange.module.css";
import PasswordIcon from "../../assets/auth/password.svg";
import VisibleIcon from "../../assets/auth/visible.svg";
import VisibleOffIcon from "../../assets/auth/visible_off.svg";
import { Circles } from "react-loader-spinner";
import Modal from "../../components/common/Modal/Modal";

export default function PasswordChange() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = value.replace(/\s/g, "");

    setForm((prev) => ({ ...prev, [name]: cleanedValue }));
    setMessage("");

    // 유효성 검사
    if (name === "currentPassword") {
      if (cleanedValue === "") {
        setErrors((prev) => ({ ...prev, currentPassword: "" }));
        return;
      }
    }

    if (name === "newPassword") {
      if (cleanedValue === "") {
        setErrors((prev) => ({ ...prev, newPassword: "" }));
        return;
      }

      const passwordPattern =
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*]).{8,20}$/;
      if (!passwordPattern.test(cleanedValue)) {
        setErrors((prev) => ({
          ...prev,
          newPassword:
            "비밀번호는 8~20자의 영문, 숫자, 특수문자(~!@#$%^&*)를 모두 포함해야 합니다.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, newPassword: "" }));
      }

      // 새 비밀번호 확인
      if (form.confirmNewPassword && form.confirmNewPassword !== cleanedValue) {
        setErrors((prev) => ({
          ...prev,
          confirmNewPassword: "비밀번호가 일치하지 않습니다",
        }));
      } else if (form.confirmNewPassword) {
        setErrors((prev) => ({ ...prev, confirmNewPassword: "" }));
      }
    }

    if (name === "confirmNewPassword") {
      if (cleanedValue === "") {
        setErrors((prev) => ({ ...prev, confirmNewPassword: "" }));
        return;
      }
      if (cleanedValue !== form.newPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmNewPassword: "비밀번호가 일치하지 않습니다",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmNewPassword: "" }));
      }
    }
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // 빈 필드 체크
    if (
      !form.currentPassword.trim() ||
      !form.newPassword.trim() ||
      !form.confirmNewPassword.trim()
    ) {
      setMessage("모든 항목을 입력해주세요");
      setMessageType("error");
      return;
    }

    // 새 비밀번호 유효성 검사
    if (errors.newPassword) {
      setMessage("조건에 맞게 입력해 주세요");
      setMessageType("error");
      return;
    }

    // 새 비밀번호 확인
    if (form.newPassword !== form.confirmNewPassword) {
      setMessage("새 비밀번호를 확인해 주세요");
      setMessageType("error");
      return;
    }

    // 새 비밀번호와 현재 비밀번호 동일 검사
    if (form.currentPassword === form.newPassword) {
      setMessage("새 비밀번호와 현재 비밀번호가 같습니다");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(
        `${API_ENDPOINTS.USER}/password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowSuccessModal(true);
    } catch (err) {
      // 현재 비밀번호 틀린 경우
      if (err.response?.status === 401 || err.response?.status === 400) {
        setMessage("비밀번호가 일치하지 않습니다");
      } else {
        setMessage("비밀번호 변경에 실패했습니다");
      }
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    
    // 폼 초기화
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setErrors({});
    setShowPasswords({
      currentPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    });
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>비밀번호 변경</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 현재 비밀번호 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>현재 비밀번호</label>
          <div className={styles.inputWrapper}>
            <img
              src={PasswordIcon}
              alt="현재 비밀번호"
              className={styles.inputIcon}
            />
            <input
              type={showPasswords.currentPassword ? "text" : "password"}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              onFocus={() => {
                setFocusedField("currentPassword");
                setMessage("");
              }}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              className={styles.formInput}
              placeholder="현재 비밀번호를 입력해 주세요"
            />
            <img
              src={showPasswords.currentPassword ? VisibleIcon : VisibleOffIcon}
              alt="비밀번호 보기"
              className={styles.toggleIcon}
              onClick={() => togglePasswordVisibility("currentPassword")}
            />
          </div>
          {focusedField === "currentPassword" &&
            errors.currentPassword &&
            form.currentPassword && (
              <div className={styles.errorText}>{errors.currentPassword}</div>
            )}
        </div>

        {/* 새 비밀번호 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>새 비밀번호</label>
          <div className={styles.inputWrapper}>
            <img
              src={PasswordIcon}
              alt="새 비밀번호"
              className={styles.inputIcon}
            />
            <input
              type={showPasswords.newPassword ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              onFocus={() => {
                setFocusedField("newPassword");
                setMessage("");
              }}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              className={`${styles.formInput} ${
                form.newPassword === ""
                  ? ""
                  : errors.newPassword
                  ? styles.inputError
                  : styles.inputValid
              }`}
              placeholder="새 비밀번호를 입력해 주세요"
            />
            <img
              src={showPasswords.newPassword ? VisibleIcon : VisibleOffIcon}
              alt="비밀번호 보기"
              className={styles.toggleIcon}
              onClick={() => togglePasswordVisibility("newPassword")}
            />
          </div>
          {focusedField === "newPassword" &&
            errors.newPassword &&
            form.newPassword && (
              <div className={styles.errorText}>{errors.newPassword}</div>
            )}
        </div>

        {/* 새 비밀번호 확인 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>새 비밀번호 확인</label>
          <div className={styles.inputWrapper}>
            <img
              src={PasswordIcon}
              alt="새 비밀번호 확인"
              className={styles.inputIcon}
            />
            <input
              type={showPasswords.confirmNewPassword ? "text" : "password"}
              name="confirmNewPassword"
              value={form.confirmNewPassword}
              onChange={handleChange}
              onFocus={() => {
                setFocusedField("confirmNewPassword");
                setMessage("");
              }}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              className={`${styles.formInput} ${
                form.confirmNewPassword === ""
                  ? ""
                  : errors.confirmNewPassword
                  ? styles.inputError
                  : styles.inputValid
              }`}
              placeholder="새 비밀번호를 다시 입력해 주세요"
            />
            <img
              src={
                showPasswords.confirmNewPassword ? VisibleIcon : VisibleOffIcon
              }
              alt="비밀번호 보기"
              className={styles.toggleIcon}
              onClick={() => togglePasswordVisibility("confirmNewPassword")}
            />
          </div>
          {focusedField === "confirmNewPassword" &&
            errors.confirmNewPassword &&
            form.confirmNewPassword && (
              <div className={styles.errorText}>
                {errors.confirmNewPassword}
              </div>
            )}
        </div>

        {/* 메시지 & 버튼 */}
        <div className={styles.buttonRow}>
          <div></div> 
          <div className={styles.rightSide}>
            {message && (
              <div className={`${styles.message} ${styles[messageType]}`}>
                {messageType === "error" && (
                  <span className={styles.errorIcon}>!</span>
                )}
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <Circles height="20" width="20" color="#fff" />
              ) : (
                "변경"
              )}
            </button>
          </div>
        </div>
      </form>
      {/* 비밀번호 변경 성공 모달 */}
      <Modal
        show={showSuccessModal}
        onClose={handleSuccessConfirm}
        onSubmit={handleSuccessConfirm}
        heading="변경 완료"
        firstLabel="확인"
        secondLabel={null}
      >
        비밀번호가 성공적으로 변경되었습니다!
      </Modal>
    </div>
  );
}

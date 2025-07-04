import React from "react";
import { useState } from "react";
import styles from "./PwdConfirmModal.module.css";
import VisibleIcon from "../../../assets/auth/visible.svg";
import VisibleOffIcon from "../../../assets/auth/visible_off.svg";

export default function PwdConfirmModal({
  show,
  onClose,
  onConfirm,
  password,
  setPassword,
  setModalErrorMessage,
  userId,
  description,
  errorMessage,
}) {
  const [showPassword, setShowPassword] = useState(false);

  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.heading}>비밀번호 재확인</h2>

        <div className={styles.formField}>
          <label className={styles.label}>아이디</label>
          <div className={styles.idDisplay}>{userId}</div>
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>비밀번호</label>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setModalErrorMessage("");
              }}
              className={styles.passwordInput}
            />
            <img
              src={showPassword ? VisibleIcon : VisibleOffIcon}
              alt="비밀번호 보기"
              className={styles.toggleIcon}
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
        </div>

        {description && <div className={styles.description}>{description}</div>}

        {errorMessage && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>!</span>
            {errorMessage}
          </div>
        )}

        <div className={styles.buttonContainer}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

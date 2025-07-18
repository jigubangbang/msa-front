// src/components/chat/ChatAlertModal.jsx
import React from "react";
import styles from "../../styles/chat/ChatAlertModal.module.css";

export default function ChatAlertModal({ show, onClose, title, message, onConfirm, onCancel, position = 'top' }) {
  if (!show) return null;

  const handleCancel = onCancel || onClose;

  console.log("ChatAlertModal position:", position);

  return (
    <div className={`${styles.overlay} ${position === 'bottom' ? styles.bottom : ''}`} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.heading}>{title || "알림"}</h2>
        <p className={styles.description}>{message}</p>
        <div className={styles.buttonContainer}>
          {onConfirm ? (
            <>
              <button className={styles.confirmButton} onClick={() => {
                onConfirm();
                onClose(); // 확인 후 모달 닫기
              }}>
                확인
              </button>
              <button className={styles.cancelButton} onClick={handleCancel}>
                취소
              </button>
            </>
          ) : (
            <button className={styles.confirmButton} onClick={onClose}>
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
import React from "react";
import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({ show, onClose, onConfirm, description }) {
  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.heading}>회원 탈퇴 재확인</h2>

        {description && <div className={styles.description}>{description}</div>}

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

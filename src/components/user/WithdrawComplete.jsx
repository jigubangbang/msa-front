import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./WithdrawComplete.module.css";

export default function WithdrawComplete() {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate("/", { replace: true })
  };

  return (
    <div className={styles.completedContainer}>
      <div className={styles.completedContent}>
        <div className={styles.completedIcon}>✓</div>
        <h2 className={styles.completedTitle}>회원탈퇴가 완료되었습니다.</h2>
        <p className={styles.completedMessage}>
          그동안 지구방방을 이용해주셔서 감사합니다.<br />
          더욱 즐겁고 다양한 서비스 제공을 위해 노력하겠습니다.
        </p>
        <button 
          className={styles.homeButton}
          onClick={handleConfirm}
        >
          확인
        </button>
      </div>
    </div>
  );
}
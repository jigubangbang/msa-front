import styles from "./Modal.module.css";

export default function SessionExpiredModal({ show, onConfirm }) {
  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={onConfirm}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>세션 만료</h2>
        <div className={styles.formGroup}>
          <p>
            세션이 만료되었습니다
            <br />
            서비스 이용을 위해 다시 로그인해 주세요
          </p>
        </div>
        <div className={styles.btnContainer}>
          <button
            className={`${styles.btn} ${styles.darkButton}`}
            onClick={onConfirm}
            type="button" 
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

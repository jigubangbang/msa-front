import React, { useState, useEffect } from "react";
import styles from "../../styles/chat/ChatReportModal.module.css";

const reasonOptions = [
  { label: "음란/선정적 내용", value: "SEX" },
  { label: "욕설/비방", value: "ABU" },
  { label: "스팸/광고", value: "SPM" },
  { label: "불법/개인정보 노출", value: "ILG" },
  { label: "기타", value: "ETC" },
];

export default function ReportModal({ show, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [etcText, setEtcText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (show) {
      setSelectedReason("");
      setEtcText("");
      setErrorMessage("");
    }
  }, [show]);

  if (!show) return null;

  const handleConfirm = () => {
    if (!selectedReason) {
      setErrorMessage("신고 사유를 선택해주세요.");
      return;
    }

    if (selectedReason === "ETC" && !etcText.trim()) {
      setErrorMessage("상세 사유를 입력해주세요.");
      return;
    }

    const payload = {
      reasonCode: selectedReason,
      reasonText: selectedReason === "ETC" ? etcText.trim() : null,
    };

    setErrorMessage(""); // 성공 시 에러 초기화
    onSubmit(payload);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.heading}>신고</h2>
        <p className={styles.description}>해당 컨텐츠를 신고하시겠습니까?</p>

        <div className={styles.formGroup}>
          <select
            id="reason"
            value={selectedReason}
            onChange={(e) => {
              setSelectedReason(e.target.value);
              if (errorMessage) setErrorMessage(""); // 에러 제거
            }}
            className={styles.select}
          >
            <option value="">-- 신고 사유를 선택하세요 --</option>
            {reasonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {selectedReason === "ETC" && (
          <div className={styles.formGroup}>
            <textarea
              id="etcText"
              className={styles.textarea}
              value={etcText}
              onChange={(e) => {
                setEtcText(e.target.value);
                if (errorMessage) setErrorMessage(""); // 에러 제거
              }}
              placeholder="상세 사유를 입력하세요"
            />
          </div>
        )}

        {errorMessage && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>!</span>
            {errorMessage}
          </div>
        )}

        <div className={styles.buttonContainer}>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            확인
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

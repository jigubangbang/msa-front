import React, { useState, useEffect } from "react";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./WithdrawForm.module.css";
import { Circles } from "react-loader-spinner";
import WithdrawComplete from "./WithdrawComplete";
import noticeText from "../../assets/text/withdraw-notice.txt?raw";
import warningText from "../../assets/text/withdraw-warning.txt?raw";
import PwdConfirmModal from "../../components/modal/WithdrawModal/PwdConfirmModal";
import ConfirmModal from "../../components/modal/WithdrawModal/ConfirmModal";

export default function WithdrawForm() {
  const [reasonCode, setReasonCode] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [isSocialUser, setIsSocialUser] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 탈퇴 사유 옵션
  const reasonOptions = [
    { value: "REJOIN", label: "아이디 변경 또는 재가입 목적" },
    { value: "BADUX", label: "사이트 이용이 불편하거나 복잡함" },
    { value: "CONTENT", label: "제공하는 서비스 불만족" },
    { value: "PRIVACY", label: "개인정보 노출이나 보안이 걱정됨" },
    { value: "NOUSE", label: "더 이상 서비스를 사용할 일이 없음" },
    { value: "ETC", label: "기타 (직접 입력)" },
  ];

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setReasonCode(value);
    setMessage("");

    // ETC가 아닌 경우 reasonText 초기화
    if (value !== "ETC") {
      setReasonText("");
    }
  };

  const handleReasonTextChange = (e) => {
    setReasonText(e.target.value);
    setMessage("");
  };

  const handleAgreementChange = (e) => {
    setIsAgreed(e.target.checked);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // 유효성 검사
    if (!reasonCode) {
      setMessage("탈퇴 사유를 선택해주세요");
      setMessageType("error");
      return;
    }

    if (reasonCode === "ETC" && !reasonText.trim()) {
      setMessage("상세 사유를 입력해주세요");
      setMessageType("error");
      return;
    }

    if (!isAgreed) {
      setMessage("탈퇴 안내사항에 동의해주세요");
      setMessageType("error");
      return;
    }

    if (isSocialUser) {
      setShowConfirmModal(true); // 소셜은 확인 모달
    } else {
      setShowPasswordModal(true); // 일반은 비번 모달
    }
  };

  const handleConfirmWithdraw = async () => {
    if (!password.trim()) {
      setModalErrorMessage("비밀번호를 입력해주세요");
      return;
    }

    setIsLoading(true);
    setModalErrorMessage("");

    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`${API_ENDPOINTS.USER}/me`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          reasonCode,
          reasonText: reasonCode === "ETC" ? reasonText : null,
          password: password,
        },
      });

      setIsCompleted(true);
      setShowPasswordModal(false);
      localStorage.removeItem("accessToken");
    } catch (err) {
      console.error("회원 탈퇴 실패:", err);
      setModalErrorMessage(
        err.response?.data?.message || "비밀번호가 일치하지 않습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawWithoutPassword = async () => {
    setIsLoading(true);
    try {
      await api.delete(`${API_ENDPOINTS.USER}/me`, {
        data: {
          reasonCode,
          reasonText: reasonCode === "ETC" ? reasonText : null,
        },
      });
      setIsCompleted(true);
      localStorage.removeItem("accessToken");
    } catch (err) {
      console.error("소셜 회원 탈퇴 실패:", err);
      setMessage("탈퇴 처리 중 오류가 발생했습니다.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.sub || "사용자");

        // 소셜 로그인 여부 판단
        api.get(`${API_ENDPOINTS.USER}/me`).then((res) => {
          setIsSocialUser(res.data.provider !== null);
        });
      } catch (error) {
        console.error("토큰 파싱 오류:", error);
        setUserId("사용자");
      }
    }
  }, []);

  useEffect(() => {
    if (isCompleted) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [isCompleted]);

  // 탈퇴 완료 화면
  if (isCompleted) {
    return <WithdrawComplete />;
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>회원 탈퇴</h2>

      {/* 안내사항 */}
      <div className={styles.noticeBox}>
        <div className={styles.noticeContent}>
          <div className={styles.noticeText}>
            <p className={styles.redText}>
              회원탈퇴 시 개인정보 및 [지구방방]에서 만들어진 모든 데이터는
              삭제됩니다.
            </p>
            <p className={styles.redText} style={{ marginBottom: "30px" }}>
              (단, 아래 항목은 표기된 법률에 따라 특정 기간 동안 보관됩니다.)
            </p>
            {noticeText.split("\n").map((line, index) => (
              <p key={index} className={styles.blackText}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 유의사항 */}
      <h3 className={styles.warningTitle}>• 유의사항</h3>
      <div className={styles.warningBox}>
        <div className={styles.warningContent}>
          <div className={styles.warningText}>
            {warningText
              .split("\n")
              .map((line, index) => line.trim() && <p key={index}>{line}</p>)}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 탈퇴사유 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>• 탈퇴사유</label>
          <select
            value={reasonCode}
            onChange={handleReasonChange}
            onBlur={(e) => e.target.blur()}
            className={styles.selectInput}
          >
            <option value="" disabled>
              탈퇴 사유를 선택해주세요
            </option>
            {reasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ETC 상세사유 입력 */}
        {reasonCode === "ETC" && (
          <div className={styles.formGroup}>
            <textarea
              value={reasonText}
              onChange={handleReasonTextChange}
              placeholder="상세 사유를 입력해주세요"
              className={styles.textareaInput}
              rows={4}
            />
          </div>
        )}

        {/* 동의 체크박스 */}
        <div className={styles.agreementSection}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={handleAgreementChange}
              className={styles.checkbox}
            />
            <span>해당 내용을 모두 확인했으며, 회원탈퇴에 동의합니다.</span>
          </label>
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
                "탈퇴하기"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 모달 */}
      <PwdConfirmModal
        show={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPassword("");
          setModalErrorMessage("");
        }}
        onConfirm={handleConfirmWithdraw}
        password={password}
        setPassword={setPassword}
        setModalErrorMessage={setModalErrorMessage}
        userId={userId || "사용자"}
        description={
          <>
            <p>본인확인을 위해 비밀번호를 다시 한번 확인합니다.</p>
            <p>
              본인확인 후 <span className={styles.redText}>최종</span> 회원
              탈퇴가 가능합니다.
            </p>
          </>
        }
        errorMessage={modalErrorMessage}
      />

      {/* 소셜 로그인 모달 */}
      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleWithdrawWithoutPassword}
        description={
          <>
            <p>정말 탈퇴하시겠습니까?</p>
            <p>
              확인 시 <span className={styles.redText}>즉시</span> 회원 탈퇴가
              진행됩니다.
            </p>
          </>
        }
      />
    </div>
  );
}

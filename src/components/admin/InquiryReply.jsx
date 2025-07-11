import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./InquiryReply.module.css";
import { Circles } from "react-loader-spinner";
import Modal from "../common/Modal/Modal";
import backIcon from "../../assets/admin/back.svg";
import { jwtDecode } from "jwt-decode";

export default function InquiryReply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 카테고리 한글 표시
  const getCategoryLabel = (category) => {
    const categoryMap = {
      ACC: "계정/로그인",
      PAY: "프리미엄/결제",
      SVC: "서비스 이용",
      REPORT: "신고",
      SUGGEST: "개선 제안",
      ETC: "기타",
    };
    return categoryMap[category] || category;
  };

  // 상태 한글 표시
  const getStatusLabel = (status) => {
    return status === "PENDING" ? "답변 대기" : "답변 완료";
  };

  // 날짜 포맷 (YYYY년 MM월 DD일 HH:mm)
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  };

  // 프로필 페이지로 이동
  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // 첨부파일 보기
  const handleAttachmentView = (attachmentUrl) => {
    window.open(attachmentUrl, "_blank");
  };

  // 문의 상세 정보 불러오기
  const fetchInquiryDetail = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(`${API_ENDPOINTS.ADMIN}/inquiries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInquiry(response.data);
    } catch (err) {
      console.error("문의 상세 조회 실패:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else if (err.response?.status === 404) {
        setMessage("존재하지 않는 문의입니다.");
        setMessageType("error");
      } else {
        setMessage("문의 정보를 불러오는데 실패했습니다.");
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 뒤로가기
  const handleBack = () => {
    navigate("/admin/inquiries");
  };

  // 답변 등록 시 확인 모달
  const handleReplyButtonClick = () => {
    if (!replyText.trim()) {
      setMessage("답변 내용을 입력해주세요.");
      setMessageType("error");
      return;
    }
    setMessage("");
    setShowConfirmModal(true);
  };

  // 실제 등록
  const handleReplySubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const decoded = jwtDecode(token);
      const adminId = decoded.sub;

      await api.post(
        `${API_ENDPOINTS.ADMIN}/inquiries/${id}/reply`,
        {
          reply: replyText.trim(),
          adminId: adminId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowSuccessModal(true);
    } catch (err) {
      console.error("답변 등록 실패:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else if (err.response?.status === 400) {
        setMessage("입력 정보를 확인해주세요.");
        setMessageType("error");
      } else if (err.response?.status === 404) {
        setMessage("존재하지 않는 문의입니다.");
        setMessageType("error");
      } else {
        setMessage("답변 등록에 실패했습니다. 다시 시도해주세요.");
        setMessageType("error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 답변 등록 성공 후 처리
  const handleSuccessConfirm = async () => {
    setShowSuccessModal(false);
    await fetchInquiryDetail();
    setReplyText("");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  useEffect(() => {
    if (id) {
      fetchInquiryDetail();
    }
  }, [id]);

  return (
    <div className={styles.section}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <img src={backIcon} alt="뒤로가기" className={styles.backIcon} />
        </button>
        <h2 className={styles.sectionTitle}>1:1 문의 답변</h2>
      </div>

      {/* 로딩 */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Circles
            height="50"
            width="50"
            color="#000"
            ariaLabel="circles-loading"
          />
        </div>
      ) : (
        <>
          {/* 오류 메시지 */}
          {message && (
            <div className={`${styles.message} ${styles[messageType]}`}>
              {messageType === "error" && (
                <span className={styles.errorIcon}>!</span>
              )}
              {message}
            </div>
          )}

          {/* 문의 상세 내용 */}
          {inquiry && (
            <div className={styles.inquiryContainer}>
              {/* 문의 정보 */}
              <div className={styles.inquiryHeader}>
                <div className={styles.inquiryMeta}>
                  <span className={styles.category}>
                    {getCategoryLabel(inquiry.category)}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${
                      inquiry.status === "REPLIED"
                        ? styles.statusReplied
                        : styles.statusPending
                    }`}
                  >
                    {getStatusLabel(inquiry.status)}
                  </span>
                </div>
                <h3 className={styles.inquiryTitle}>{inquiry.title}</h3>
                <div className={styles.inquiryDate}>
                  <span>{formatDateTime(inquiry.createdAt)}</span>
                  <span
                    className={styles.authorInfo}
                    onClick={() => handleProfileClick(inquiry.userId)}
                  >
                    {inquiry.nickname} ({inquiry.userId})
                  </span>
                </div>
              </div>

              {/* 문의 내용 */}
              <div className={styles.inquiryContent}>
                <div className={styles.contentText}>
                  {inquiry.content.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < inquiry.content.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 첨부파일 */}
              {inquiry.attachments && inquiry.attachments.length > 0 && (
                <div className={styles.attachmentsSection}>
                  <div className={styles.attachmentsList}>
                    {inquiry.attachments.map((attachment, index) => (
                      <div key={index} className={styles.attachmentItem}>
                        <span
                          className={styles.fileName}
                          onClick={() => handleAttachmentView(attachment.url)}
                          title="클릭하여 보기"
                        >
                          {attachment.originalName || `첨부파일_${index + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 답변 섹션 */}
              {inquiry.status === "PENDING" ? (
                // 답변 작성 폼 (PENDING 상태)
                <div className={styles.replySection}>
                  <h4 className={styles.contentTitle}>답변 작성</h4>
                  <div className={styles.replyForm}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="1:1 문의 답변을 입력해주세요"
                      className={styles.replyTextarea}
                      rows={6}
                      maxLength={1000}
                    />
                    <div className={styles.replyActions}>
                      <button
                        onClick={handleReplyButtonClick}
                        disabled={isSubmitting || !replyText.trim()}
                        className={styles.submitButton}
                      >
                        {isSubmitting ? (
                          <Circles height="20" width="20" color="#fff" />
                        ) : (
                          "답변 등록"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // 기존 답변 표시 (REPLIED 상태)
                <div className={styles.replySection}>
                  <div className={styles.replyHeader}>
                    <h4 className={styles.contentTitle}>1:1 문의 답변</h4>
                    <div className={styles.replyDate}>
                      {formatDateTime(inquiry.repliedAt)}
                    </div>
                  </div>
                  <div className={styles.replyContent}>
                    {inquiry.adminReply?.split("\n").map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < inquiry.adminReply.split("\n").length - 1 && (
                          <br />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 등록 확인 모달 */}
      <Modal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onSubmit={handleReplySubmit}
        heading="문의 답변 등록 확인"
        firstLabel="등록"
        secondLabel="취소"
      >
        정말 문의 답변을 등록하시겠습니까?
        <br />
        등록 후에는 수정이 불가합니다
      </Modal>

      {/* 답변 등록 성공 모달 */}
      <Modal
        show={showSuccessModal}
        onClose={handleSuccessConfirm}
        onSubmit={handleSuccessConfirm}
        heading="문의 답변 등록 완료"
        firstLabel="확인"
      >
        1:1 문의 답변이 성공적으로 등록되었습니다!
      </Modal>
    </div>
  );
}

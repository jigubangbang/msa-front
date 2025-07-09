import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./InquiryForm.module.css";
import { Circles } from "react-loader-spinner";
import backIcon from "../../assets/user/back.svg";
import Modal from "../common/Modal/Modal";

const trimFileName = (name, maxLength = 30) => {
  return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
};

export default function InquiryForm({ onBack, onSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const fileInputRef = useRef(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newInquiryId, setNewInquiryId] = useState(null);

  // 카테고리 옵션
  const categoryOptions = [
    { value: "ACC", label: "계정/로그인" },
    { value: "PAY", label: "프리미엄/결제" },
    { value: "SVC", label: "서비스 이용" },
    { value: "REPORT", label: "신고" },
    { value: "SUGGEST", label: "개선 제안" },
    { value: "ETC", label: "기타" },
  ];

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  // 파일 선택 처리
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    // 총 개수 제한: 5개
    if (selectedFiles.length + newFiles.length > 5) {
      setMessage("최대 5개의 파일만 첨부 가능합니다");
      setMessageType("error");
      return;
    }

    // 파일 크기 제한: 각 5MB 이하
    for (let file of newFiles) {
      if (file.size > 1 * 1024 * 1024) {
        const trimmedFileName = trimFileName(file.name, 30);
        setMessage(`${trimmedFileName}은(는) 5MB를 초과합니다`);
        setMessageType("error");
        return;
      }
    }

    // 파일 중복 선택 방지
    const uniqueNewFiles = newFiles.filter(
      (newFile) =>
        !selectedFiles.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        )
    );

    setSelectedFiles((prev) => [...prev, ...uniqueNewFiles]);
    setMessage("");
  };

  // 파일 제거
  const handleFileRemove = (indexToRemove) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // 폼 유효성 검사
  const validateForm = () => {
    if (!formData.category) {
      setMessage("카테고리를 선택해주세요");
      setMessageType("error");
      return false;
    }

    if (!formData.title.trim()) {
      setMessage("제목을 입력해주세요");
      setMessageType("error");
      return false;
    }

    if (!formData.content.trim()) {
      setMessage("내용을 입력해주세요");
      setMessageType("error");
      return false;
    }

    return true;
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setMessage("로그인이 필요합니다");
        setMessageType("error");
        return;
      }

      const formDataToSend = new FormData();
      const dtoBlob = new Blob([JSON.stringify(formData)], {
        type: "application/json",
      });
      formDataToSend.append("dto", dtoBlob);

      // 파일 데이터 추가
      selectedFiles.forEach((file) => {
        formDataToSend.append("files", file);
      });

      const response = await api.post(
        `${API_ENDPOINTS.USER}/inquiry`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setNewInquiryId(response.data.id);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("문의 등록 실패:", err);
      setMessage(err.response?.data?.message || "문의 등록에 실패했습니다");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/user/inquiry");
  };

  return (
    <div className={styles.section}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleCancel}>
          <img src={backIcon} alt="뒤로가기" className={styles.backIcon} />
        </button>
        <h2 className={styles.sectionTitle}>1:1 문의 작성</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 카테고리 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>• 카테고리</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={styles.selectInput}
          >
            <option value="" disabled>
              카테고리를 선택해주세요
            </option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 제목 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>• 제목</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="문의 제목을 입력해주세요"
            className={styles.textInput}
            maxLength={100}
          />
        </div>

        {/* 내용 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>• 내용</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="문의 내용을 입력해주세요"
            className={styles.textareaInput}
            rows={8}
            maxLength={1000}
          />
        </div>

        {/* 첨부파일 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>• 첨부 파일 (선택)</label>
          <div className={styles.fileUploadBox}>
            <label htmlFor="fileInput" className={styles.fileInputLabel}>
              파일 선택
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className={styles.hiddenFileInput}
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              ref={fileInputRef}
            />
            <span className={styles.fileStatus}>
              {selectedFiles.length === 0
                ? "선택된 파일 없음"
                : `${selectedFiles.length}개의 파일 선택됨`}
            </span>
          </div>

          {/* 선택된 파일 목록 */}
          {selectedFiles.length > 0 && (
            <div className={styles.fileList}>
              {selectedFiles.map((file, index) => (
                <div key={index} className={styles.fileItem}>
                  <span className={styles.fileName}>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleFileRemove(index)}
                    className={styles.fileRemoveButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 버튼 & 메시지 */}
        <div className={styles.buttonRow}>
          <div className={styles.centerButtons}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <Circles height="20" width="20" color="#fff" />
              ) : (
                "등록"
              )}
            </button>
          </div>
          {message && (
            <div className={`${styles.message} ${styles[messageType]}`}>
              {messageType === "error" && (
                <span className={styles.errorIcon}>!</span>
              )}
              {message}
            </div>
          )}
        </div>
      </form>

      {/* 등록 성공 모달 */}
      <Modal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate(`/user/inquiry/${newInquiryId}`);
        }}
        onSubmit={() => {
          setShowSuccessModal(false);
          navigate(`/user/inquiry/${newInquiryId}`);
        }}
        heading="문의 등록 완료"
        firstLabel="확인"
      >
        문의가 성공적으로 등록되었습니다!
      </Modal>
    </div>
  );
}

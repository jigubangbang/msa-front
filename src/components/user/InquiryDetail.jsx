import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./InquiryDetail.module.css";
import { Circles } from "react-loader-spinner";
import Modal from "../common/Modal/Modal";
import backIcon from "../../assets/user/back.svg";
import editIcon from "../../assets/user/edit.svg";
import deleteIcon from "../../assets/user/delete.svg";
import submitIcon from "../../assets/user/submit_green.svg";
import cancelIcon from "../../assets/user/cancel_red.svg";

export default function InquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const categoryOptions = [
    { value: "ACC", label: "계정/로그인" },
    { value: "PAY", label: "프리미엄/결제" },
    { value: "SVC", label: "서비스 이용" },
    { value: "REPORT", label: "신고" },
    { value: "SUGGEST", label: "개선 제안" },
    { value: "ETC", label: "기타" },
  ];

  const getCategoryLabel = (category) => {
    const map = {
      ACC: "계정/로그인",
      PAY: "프리미엄/결제",
      SVC: "서비스 이용",
      REPORT: "신고",
      SUGGEST: "개선 제안",
      ETC: "기타",
    };
    return map[category] || category;
  };

  const getStatusLabel = (status) =>
    status === "PENDING" ? "대기" : "답변 완료";

  // 날짜 포맷 (YYYY년 MM월 DD일 HH:mm)
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  };

  // 이미지 보기
  const handleImageView = (imageUrl) => {
    window.open(imageUrl, "_blank");
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

      const res = await api.get(`${API_ENDPOINTS.USER}/inquiry/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInquiry(res.data);
      setEditFormData({
        title: res.data.title,
        content: res.data.content,
        category: res.data.category,
      });
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
    navigate("/user/inquiry");
  };

  // 수정
  const handleEdit = () => {
    navigate(`/user/inquiry/${id}?edit=true`);
  };

  // 삭제
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditFormData({
      title: inquiry.title,
      content: inquiry.content,
      category: inquiry.category,
    });
    navigate(`/user/inquiry/${id}`);
  };

  // 수정 저장
  const handleSave = async () => {
    try {
      if (!editFormData.title.trim()) {
        setMessage("제목을 입력해 주세요");
        setMessageType("error");
        return;
      }

      if (!editFormData.content.trim()) {
        setMessage("내용을 입력해 주세요");
        setMessageType("error");
        return;
      }

      if (!editFormData.category) {
        setMessage("카테고리를 선택해 주세요");
        setMessageType("error");
        return;
      }

      setIsLoading(true);
      setMessage("");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const formData = new FormData();
      const dtoData = {
        title: editFormData.title.trim(),
        content: editFormData.content.trim(),
        category: editFormData.category,
        // 현재 남아있는 기존 파일들만 유지
        keepExistingFiles: inquiry.attachments || []
      };

      const dtoBlob = new Blob([JSON.stringify(dtoData)], {
        type: "application/json"
      });
      formData.append("dto", dtoBlob);

      selectedFiles.forEach(file => {
        formData.append("files", file);
      });

      const response = await api.put(
        `${API_ENDPOINTS.USER}/inquiry/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowSuccessModal(true);

    } catch (err) {
      console.error("문의 수정 실패:", err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else if (err.response?.status === 400) {
        setMessage("입력 정보를 확인해 주세요.");
        setMessageType("error");
      } else if (err.response?.status === 403) {
        setMessage("수정 권한이 없습니다.");
        setMessageType("error");
      } else if (err.response?.status === 404) {
        setMessage("존재하지 않는 문의입니다.");
        setMessageType("error");
      } else {
        setMessage("문의 수정에 실패했습니다. 다시 시도해주세요.");
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessConfirm = async () => {
    setShowSuccessModal(false);
    await fetchInquiryDetail(); 
    setIsEditMode(false);
    setSelectedFiles([]); 
    window.scrollTo({ top: 0, behavior: "auto" });
    navigate(`/user/inquiry/${id}`);
  };

  // 기존 파일 제거
  const handleExistingFileRemove = (indexToRemove) => {
    setInquiry(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, index) => index !== indexToRemove)
    }));
  };

  // 새 파일 선택 처리
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const totalFiles = (inquiry.attachments?.length || 0) + selectedFiles.length + newFiles.length;

    // 총 개수 제한: 5개
    if (totalFiles > 5) {
      setMessage("최대 5개의 파일만 첨부 가능합니다");
      setMessageType("error");
      return;
    }

    // 파일 크기 제한: 각 5MB 이하
    for (let file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage(`${file.name}은(는) 5MB를 초과합니다`);
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

  // 새 파일 제거
  const handleFileRemove = (indexToRemove) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // 삭제 확인
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`${API_ENDPOINTS.USER}/inquiry/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/user/inquiry");
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (id) {
      fetchInquiryDetail();
    }
    setIsEditMode(location.search.includes('edit=true'));
  }, [id, location.search]);

  return (
    <div className={styles.section}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <img src={backIcon} alt="뒤로가기" className={styles.backIcon} />
        </button>
        <h2 className={styles.sectionTitle}>
          {isEditMode ? "1:1 문의 수정" : "1:1 문의 상세"}
        </h2>
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
                  <div className={styles.categoryContainer}>
                    {isEditMode ? (
                      <select
                        name="category"
                        value={editFormData.category}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                        className={styles.selectInput}
                      >
                        <option value="" disabled>카테고리를 선택해 주세요</option>
                        {categoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.category}>
                        {getCategoryLabel(inquiry.category)}
                      </span>
                    )}
                  </div>
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
                {isEditMode ? (
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={styles.textInput}
                    placeholder="문의 제목을 입력해 주세요"
                    maxLength={100}
                  />
                ) : (
                  <h3 className={styles.inquiryTitle}>{inquiry.title}</h3>
                )}
                <div className={styles.inquiryDate}>
                  {formatDateTime(inquiry.createdAt)}
                  {!inquiry.adminReply && (
                    <div className={styles.actionButtons}>
                      {isEditMode ? (
                        <>
                          <button className={styles.saveButton} onClick={handleSave}>
                            <img src={submitIcon} alt="저장" className={styles.actionIcon2} />
                          </button>
                          <button className={styles.cancelEditButton} onClick={handleCancelEdit}>
                            <img src={cancelIcon} alt="취소" className={styles.actionIcon2} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className={styles.editButton} onClick={handleEdit}>
                            <img src={editIcon} alt="수정" className={styles.actionIcon} />
                          </button>
                          <button className={styles.deleteButton} onClick={handleDelete}>
                            <img src={deleteIcon} alt="삭제" className={styles.actionIcon} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 문의 내용 */}
              <div className={styles.inquiryContent}>
                <div className={styles.contentText}>
                  {isEditMode ? (
                    <textarea
                      name="content"
                      value={editFormData.content}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, content: e.target.value }))}
                      className={styles.textareaInput}
                      placeholder="문의 내용을 입력해 주세요"
                      rows={8}
                      maxLength={1000}
                    />
                  ) : (
                    <>
                      {inquiry.content.split("\n").map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < inquiry.content.split("\n").length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* 첨부파일 */}
              <div className={styles.attachmentsSection}>
                {isEditMode ? (
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

                    {/* 기존 첨부파일 */}
                    {inquiry.attachments && inquiry.attachments.length > 0 && (
                      <div className={styles.fileList}>
                        {inquiry.attachments.map((attachment, index) => (
                          <div key={`existing-${index}`} className={styles.fileItem}>
                            <span className={styles.fileName}>
                              {attachment.originalName || `첨부파일_${index + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleExistingFileRemove(index)}
                              className={styles.fileRemoveButton}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 새로 선택된 파일 */}
                    {selectedFiles.length > 0 && (
                      <div className={styles.fileList}>
                        {selectedFiles.map((file, index) => (
                          <div key={`new-${index}`} className={styles.fileItem}>
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
                ) : (
                  inquiry.attachments && inquiry.attachments.length > 0 && (
                    <div className={styles.attachmentsList}>
                      {inquiry.attachments.map((attachment, index) => (
                        <div key={index} className={styles.attachmentItem}>
                          <span
                            className={styles.fileName}
                            onClick={() => handleImageView(attachment.url)}
                            title="클릭하여 보기"
                          >
                            {attachment.originalName || `첨부파일_${index + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              {/* 답변 */}
              {inquiry.adminReply && (
                <div className={styles.replySection}>
                  <div className={styles.replyHeader}>
                    <h4 className={styles.contentTitle}>1:1 문의 답변</h4>
                    <div className={styles.replyDate}>
                      {formatDateTime(inquiry.repliedAt)}
                    </div>
                  </div>
                  <div className={styles.replyContent}>
                    {inquiry.adminReply.split("\n").map((line, index) => (
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
      {/* 삭제 확인 모달 */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSubmit={confirmDelete}
        heading="문의 삭제"
        firstLabel="삭제"
        secondLabel="취소"
      >
        정말 문의를 삭제하시겠습니까?
      </Modal>

      <Modal
        show={showSuccessModal}
        onClose={handleSuccessConfirm}
        onSubmit={handleSuccessConfirm}
        heading="수정 완료"
        firstLabel="확인"
        secondLabel={null} 
      >
        문의가 성공적으로 수정되었습니다!
      </Modal>
    </div>
  );
}

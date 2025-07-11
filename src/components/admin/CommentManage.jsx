import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./CommentManage.module.css";
import { Circles } from "react-loader-spinner";
import Dropdown from "../common/Dropdown";
import SearchBar from "../common/SearchBar";
import Modal from "../common/Modal/Modal";
import Pagination from "../common/Pagination/Pagination";
import refreshIcon from "../../assets/admin/refresh.svg";

export default function CommentManage() {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dropdownResetKey, setDropdownResetKey] = useState(0);

  const pageSize = 10;
  const navigate = useNavigate();

  // 프로필 페이지로 이동
  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // 원본 게시글 페이지로 이동
  const handleCommentClick = (originalPostId, contentType) => {
    if (contentType === "feed") {
      navigate(`/feed/${originalPostId}`);
    } else if (contentType === "community") {
      navigate(`/board/${originalPostId}`);
    } else if (contentType === "group") {
      navigate(`/traveler/mate/${originalPostId}`);
    }
  };

  // 필터 옵션
  const contentTypeOptions = [
    { label: "전체 유형", value: "all" },
    { label: "커뮤니티", value: "community" },
    { label: "여행 피드", value: "feed" },
    { label: "모임", value: "group" },
  ];

  const statusOptions = [
    { label: "전체 상태", value: "ALL" },
    { label: "공개", value: "VISIBLE" },
    { label: "블라인드", value: "BLINDED" },
  ];

  // 댓글 목록 조회
  const fetchComments = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(`${API_ENDPOINTS.ADMIN}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data);
      setFilteredComments(response.data);
    } catch (err) {
      console.error("댓글 목록 조회 실패:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        setMessage("댓글 목록을 불러오는데 실패했습니다");
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 댓글 상태 변경
  const handleStatusChange = async (commentId, contentType, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      const endpoint =
        newStatus === "BLINDED"
          ? `${API_ENDPOINTS.ADMIN}/comments/${commentId}/blind`
          : `${API_ENDPOINTS.ADMIN}/comments/${commentId}/unblind`;

      await api.put(
        `${endpoint}?contentType=${contentType}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchComments();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("상태 변경 실패:", err);
      setMessage("상태 변경에 실패했습니다");
      setMessageType("error");
    }
  };

  // 필터 리셋
  const resetFilters = () => {
    setSearchTerm("");
    setContentTypeFilter("all");
    setStatusFilter("ALL");
    setCurrentPage(1);
    setDropdownResetKey(prev => prev + 1);
    fetchComments();
  };

  // 검색 및 필터링
  const applyFilters = () => {
    let filtered = comments;

    // 댓글 내용, 작성자 검색
    if (searchTerm) {
      filtered = filtered.filter(
        (comment) =>
          comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comment.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comment.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 콘텐츠 타입 필터링
    if (contentTypeFilter !== "all") {
      filtered = filtered.filter(
        (comment) => comment.contentType === contentTypeFilter
      );
    }

    // 상태 필터링
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((comment) => comment.status === statusFilter);
    }

    setFilteredComments(filtered);
    setCurrentPage(1); // 첫 페이지로 이동
  };

  // 페이지네이션
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredComments.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredComments.length / pageSize);

  // 날짜 포맷 (YYYY.MM.DD)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 콘텐츠 타입 한글 표시
  const getContentTypeLabel = (contentType) => {
    if (contentType === "community") return "커뮤니티";
    if (contentType === "feed") return "여행 피드";
    if (contentType === "group") return "모임";
    return contentType;
  };

  // 댓글 내용 길이 제한
  const truncateContent = (content, maxLength = 30) => {
    return content && content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // 필터링 적용 (1페이지로 이동)
  useEffect(() => {
    applyFilters();
  }, [searchTerm, contentTypeFilter, statusFilter]);

  // 데이터 업데이트 시 필터링만 적용 (페이지 유지)
  useEffect(() => {
    if (comments.length > 0) {
      let filtered = comments;

      // 댓글 내용, 작성자 검색
      if (searchTerm) {
        filtered = filtered.filter(
          (comment) =>
            comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comment.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comment.userId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // 콘텐츠 타입 필터링
      if (contentTypeFilter !== "all") {
        filtered = filtered.filter(
          (comment) => comment.contentType === contentTypeFilter
        );
      }

      // 상태 필터링
      if (statusFilter !== "ALL") {
        filtered = filtered.filter((comment) => comment.status === statusFilter);
      }

      setFilteredComments(filtered);
      // setCurrentPage(1); // 현재 페이지 유지
    }
  }, [comments]);

  return (
    <div className={styles.section}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>댓글 관리</h2>
      </div>

      {/* 검색 및 필터 영역 */}
      <div className={styles.filterContainer}>
        <SearchBar
          placeholder="댓글 내용, 작성자로 검색"
          onSearchChange={setSearchTerm}
          value={searchTerm}
          barWidth="250px"
        />
        <div className={styles.dropdownContainer}>
          <Dropdown
            key={`contentType-${dropdownResetKey}`}
            defaultOption="전체 유형"
            options={contentTypeOptions}
            onSelect={(option) => setContentTypeFilter(option.value)}
          />
          <Dropdown
            key={`status-${dropdownResetKey}`}
            defaultOption="전체 상태"
            options={statusOptions}
            onSelect={(option) => setStatusFilter(option.value)}
          />
          <img 
            src={refreshIcon}
            alt="필터 초기화" 
            className={styles.resetIcon}
            onClick={resetFilters}
          />
        </div>
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
          {/* 메시지 */}
          {message && (
            <div className={`${styles.message} ${styles[messageType]}`}>
              {messageType === "error" && (
                <span className={styles.errorIcon}>!</span>
              )}
              {message}
            </div>
          )}

          {/* 댓글 목록 테이블 */}
          {filteredComments.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>댓글 ID</th>
                    <th>유형</th>
                    <th>작성자</th>
                    <th>내용</th>
                    <th>작성일</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageData().map((comment) => (
                    <tr
                      key={`${comment.contentType}-${comment.commentId}`}
                      className={styles.tableRow}
                    >
                      <td>{comment.commentId}</td>
                      <td>{getContentTypeLabel(comment.contentType)}</td>
                      <td 
                        className={`${styles.authorCell} ${styles.userIdLink}`}
                        onClick={() => handleProfileClick(comment.userId)}
                      >
                        {comment.nickname} ({comment.userId})
                      </td>
                      <td 
                        className={styles.contentCell} 
                        title={comment.content}
                        onClick={() => handleCommentClick(comment.originalPostId, comment.contentType)}
                      >
                        {truncateContent(comment.content)}
                      </td>
                      <td>{formatDate(comment.createdAt)}</td>
                      <td>
                        <div
                          className={
                            comment.status === "VISIBLE"
                              ? styles.statusVisible
                              : styles.statusBlinded
                          }
                        >
                          <Dropdown
                            defaultOption={
                              comment.status === "VISIBLE" ? "공개" : "블라인드"
                            }
                            options={[
                              { label: "공개", value: "VISIBLE" },
                              { label: "블라인드", value: "BLINDED" },
                            ]}
                            onSelect={(option) =>
                              handleStatusChange(
                                comment.commentId,
                                comment.contentType,
                                option.value
                              )
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>조건에 맞는 댓글이 없습니다</p>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              pageCount={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* 성공 모달 */}
      <Modal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onSubmit={() => setShowSuccessModal(false)}
        heading="상태 변경 완료"
        firstLabel="확인"
      >
        댓글 상태가 변경되었습니다!
      </Modal>
    </div>
  );
}
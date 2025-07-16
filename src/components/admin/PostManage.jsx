import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./PostManage.module.css";
import { Circles } from "react-loader-spinner";
import Dropdown from "../common/Dropdown";
import SearchBar from "../common/SearchBar";
import Modal from "../common/Modal/Modal";
import Pagination from "../common/Pagination/Pagination";
import refreshIcon from "../../assets/admin/refresh.svg";

export default function PostManage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
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

  // 게시글 상세 페이지로 이동
  const handlePostClick = (postId, contentType) => {
    if (contentType === "feed") {
      navigate(`/feed/${postId}`);
    } else if (contentType === "community") {
      navigate(`/board/${postId}`);
    }
  };

  // 필터 옵션
  const contentTypeOptions = [
    { label: "전체 유형", value: "all" },
    { label: "커뮤니티", value: "community" },
    { label: "여행 피드", value: "feed" },
  ];

  const statusOptions = [
    { label: "전체 상태", value: "ALL" },
    { label: "공개", value: "VISIBLE" },
    { label: "블라인드", value: "BLINDED" },
  ];

  // 게시글 목록 조회
  const fetchPosts = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(`${API_ENDPOINTS.ADMIN}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
      setFilteredPosts(response.data);
    } catch (err) {
      console.error("게시글 목록 조회 실패:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        setMessage("게시글 목록을 불러오는데 실패했습니다");
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 게시글 상태 변경
  const handleStatusChange = async (postId, contentType, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      const endpoint =
        newStatus === "BLINDED"
          ? `${API_ENDPOINTS.ADMIN}/posts/${postId}/blind`
          : `${API_ENDPOINTS.ADMIN}/posts/${postId}/unblind`;

      await api.put(
        `${endpoint}?contentType=${contentType}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchPosts();
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
    fetchPosts();
  };

  // 검색 및 필터링
  const applyFilters = () => {
    let filtered = posts;

    // 제목, 작성자 검색
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 콘텐츠 타입 필터링
    if (contentTypeFilter !== "all") {
      filtered = filtered.filter(
        (post) => post.contentType === contentTypeFilter
      );
    }

    // 상태 필터링
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((post) => post.status === statusFilter);
    }

    setFilteredPosts(filtered);
    setCurrentPage(1); // 첫 페이지로 이동
  };

  // 페이지네이션
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPosts.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredPosts.length / pageSize);

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
    return contentType === "community" ? "커뮤니티" : "여행 피드";
  };

  // 제목 길이 제한
  const truncateTitle = (title, maxLength = 30) => {
    return title && title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 필터링 적용 (1페이지로 이동)
  useEffect(() => {
    applyFilters();
  }, [searchTerm, contentTypeFilter, statusFilter]);

  // 데이터 업데이트 시 필터링만 적용 (페이지 유지)
  useEffect(() => {
    if (posts.length > 0) {
      let filtered = posts;

      // 제목, 작성자 검색
      if (searchTerm) {
        filtered = filtered.filter(
          (post) =>
            post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.userId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // 콘텐츠 타입 필터링
      if (contentTypeFilter !== "all") {
        filtered = filtered.filter(
          (post) => post.contentType === contentTypeFilter
        );
      }

      // 상태 필터링
      if (statusFilter !== "ALL") {
        filtered = filtered.filter((post) => post.status === statusFilter);
      }

      setFilteredPosts(filtered);
      // setCurrentPage(1); // 현재 페이지 유지
    }
  }, [posts]);

  return (
    <div className={styles.section}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>게시글 관리</h2>
      </div>

      {/* 검색 및 필터 영역 */}
      <div className={styles.filterContainer}>
        <SearchBar
          placeholder="게시글 제목, 작성자로 검색"
          onSearchChange={setSearchTerm}
          value={searchTerm}
          barWidth="260px"
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

          {/* 게시글 목록 테이블 */}
          {filteredPosts.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>게시글 ID</th>
                    <th>유형</th>
                    <th>작성자</th>
                    <th>제목</th>
                    <th>작성일</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageData().map((post) => (
                    <tr
                      key={`${post.contentType}-${post.postId}`}
                      className={styles.tableRow}
                    >
                      <td>{post.postId}</td>
                      <td>{getContentTypeLabel(post.contentType)}</td>
                      <td 
                        className={`${styles.authorCell} ${styles.userIdLink}`}
                        onClick={() => handleProfileClick(post.userId)}
                      >
                        {post.nickname} ({post.userId})
                      </td>
                      <td 
                        className={styles.titleCell} 
                        title={post.title}
                        onClick={() => handlePostClick(post.postId, post.contentType)}
                      >
                        {truncateTitle(post.title)}
                      </td>
                      <td>{formatDate(post.createdAt)}</td>
                      <td>
                        <div
                          className={
                            post.status === "VISIBLE"
                              ? styles.statusVisible
                              : styles.statusBlinded
                          }
                        >
                          <Dropdown
                            defaultOption={
                              post.status === "VISIBLE" ? "공개" : "블라인드"
                            }
                            options={[
                              { label: "공개", value: "VISIBLE" },
                              { label: "블라인드", value: "BLINDED" },
                            ]}
                            onSelect={(option) =>
                              handleStatusChange(
                                post.postId,
                                post.contentType,
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
              <p className={styles.emptyText}>조건에 맞는 게시글이 없습니다</p>
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
        게시글 상태가 변경되었습니다!
      </Modal>
    </div>
  );
}

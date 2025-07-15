import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./InquiryManage.module.css";
import { Circles } from "react-loader-spinner";
import Dropdown from "../common/Dropdown";
import SearchBar from "../common/SearchBar";
import Pagination from "../common/Pagination/Pagination";
import refreshIcon from "../../assets/admin/refresh.svg";

export default function InquiryManage() {
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dropdownResetKey, setDropdownResetKey] = useState(0);

  const pageSize = 10;
  const navigate = useNavigate();

  // 프로필 페이지로 이동
  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // 문의 상세 페이지로 이동
  const handleInquiryClick = (inquiryId) => {
    navigate(`/admin/inquiries/${inquiryId}`);
  };

  // 필터 옵션
  const categoryOptions = [
    { label: "전체 카테고리", value: "all" },
    { label: "계정/로그인", value: "ACC" },
    { label: "프리미엄/결제", value: "PAY" },
    { label: "서비스 이용", value: "SVC" },
    { label: "신고", value: "REPORT" },
    { label: "개선 제안", value: "SUGGEST" },
    { label: "기타", value: "ETC" },
  ];

  const statusOptions = [
    { label: "전체 상태", value: "ALL" },
    { label: "대기", value: "PENDING" },
    { label: "답변 완료", value: "REPLIED" },
  ];

  // 문의 목록 조회
  const fetchInquiries = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(`${API_ENDPOINTS.ADMIN}/inquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInquiries(response.data);
      setFilteredInquiries(response.data);
    } catch (err) {
      console.error("문의 목록 조회 실패:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        setMessage("문의 목록을 불러오는데 실패했습니다");
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 필터 리셋
  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("ALL");
    setCurrentPage(1);
    setDropdownResetKey((prev) => prev + 1);
    fetchInquiries();
  };

  // 검색 및 필터링
  const applyFilters = () => {
    let filtered = inquiries;

    // 문의 제목, 작성자 검색
    if (searchTerm) {
      filtered = filtered.filter(
        (inquiry) =>
          inquiry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 카테고리 필터링
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (inquiry) => inquiry.category === categoryFilter
      );
    }

    // 상태 필터링
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((inquiry) => inquiry.status === statusFilter);
    }

    setFilteredInquiries(filtered);
    setCurrentPage(1); // 첫 페이지로 이동
  };

  // 페이지네이션
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredInquiries.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredInquiries.length / pageSize);

  // 날짜 포맷 (YYYY.MM.DD)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

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
    return status === "PENDING" ? "대기" : "답변 완료";
  };

  // 문의 제목 길이 제한
  const truncateTitle = (title, maxLength = 30) => {
    return title && title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // 필터링 적용 (1페이지로 이동)
  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, statusFilter]);

  // 데이터 업데이트 시 필터링만 적용 (페이지 유지)
  useEffect(() => {
    if (inquiries.length > 0) {
      let filtered = inquiries;

      // 문의 제목, 작성자 검색
      if (searchTerm) {
        filtered = filtered.filter(
          (inquiry) =>
            inquiry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.nickname
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            inquiry.userId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // 카테고리 필터링
      if (categoryFilter !== "all") {
        filtered = filtered.filter(
          (inquiry) => inquiry.category === categoryFilter
        );
      }

      // 상태 필터링
      if (statusFilter !== "ALL") {
        filtered = filtered.filter(
          (inquiry) => inquiry.status === statusFilter
        );
      }

      setFilteredInquiries(filtered);
    }
  }, [inquiries]);

  return (
    <div className={styles.section}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>1:1 문의 내역</h2>
      </div>

      {/* 검색 및 필터 영역 */}
      <div className={styles.filterContainer}>
        <SearchBar
          placeholder="문의 제목, 작성자로 검색"
          onSearchChange={setSearchTerm}
          value={searchTerm}
          barWidth="250px"
        />
        <div className={styles.dropdownContainer}>
          <Dropdown
            key={`category-${dropdownResetKey}`}
            defaultOption="전체 카테고리"
            options={categoryOptions}
            onSelect={(option) => setCategoryFilter(option.value)}
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

          {/* 문의 목록 테이블 */}
          {filteredInquiries.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>문의 ID</th>
                    <th>카테고리</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageData().map((inquiry) => (
                    <tr key={inquiry.id} className={styles.tableRow}>
                      <td>{inquiry.id}</td>
                      <td>{getCategoryLabel(inquiry.category)}</td>
                      <td
                        className={styles.titleCell} 
                        title={inquiry.title}
                        onClick={() => handleInquiryClick(inquiry.id)}
                      >
                        {truncateTitle(inquiry.title)}
                      </td>
                      <td
                        className={`${styles.authorCell} ${styles.userIdLink}`}
                        onClick={() => handleProfileClick(inquiry.userId)}
                      >
                        {inquiry.nickname} ({inquiry.userId})
                      </td>
                      <td>{formatDate(inquiry.createdAt)}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            inquiry.status === "REPLIED"
                              ? styles.statusReplied
                              : styles.statusPending
                          }`}
                        >
                          {getStatusLabel(inquiry.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>조건에 맞는 문의가 없습니다</p>
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
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./GroupManage.module.css";
import { Circles } from "react-loader-spinner";
import Dropdown from "../common/Dropdown";
import SearchBar from "../common/SearchBar";
import Modal from "../common/Modal/Modal";
import Pagination from "../common/Pagination/Pagination";
import refreshIcon from "../../assets/admin/refresh.svg";

export default function GroupManage() {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
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

  // 그룹 상세 페이지로 이동
  const handleGroupClick = (groupId, contentType) => {
    if (contentType === "mate") {
      navigate(`/traveler/mate/${groupId}`);
    } else if (contentType === "info") {
      navigate(`/traveler/info/${groupId}`);
    }
  };

  // 필터 옵션
  const contentTypeOptions = [
    { label: "전체 유형", value: "all" },
    { label: "모임", value: "mate" },
    { label: "정보공유방", value: "info" },
  ];

  const statusOptions = [
    { label: "전체 상태", value: "ALL" },
    { label: "공개", value: "VISIBLE" },
    { label: "블라인드", value: "BLINDED" },
  ];

  // 그룹 목록 조회
  const fetchGroups = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(`${API_ENDPOINTS.ADMIN}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(response.data);
      setFilteredGroups(response.data);
    } catch (err) {
      console.error("그룹 목록 조회 실패:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        setMessage("그룹 목록을 불러오는데 실패했습니다");
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 그룹 상태 변경
  const handleStatusChange = async (groupId, contentType, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      const endpoint =
        newStatus === "BLINDED"
          ? `${API_ENDPOINTS.ADMIN}/groups/${groupId}/blind`
          : `${API_ENDPOINTS.ADMIN}/groups/${groupId}/unblind`;

      await api.put(
        `${endpoint}?contentType=${contentType}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchGroups();
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
    fetchGroups();
  };

  // 검색 및 필터링
  const applyFilters = () => {
    let filtered = groups;

    // 그룹명, 요약 소개글, 생성자 검색
    if (searchTerm) {
      filtered = filtered.filter(
        (group) =>
          group.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.simpleDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 콘텐츠 타입 필터링
    if (contentTypeFilter !== "all") {
      filtered = filtered.filter(
        (group) => group.contentType === contentTypeFilter
      );
    }

    // 상태 필터링
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((group) => group.status === statusFilter);
    }

    setFilteredGroups(filtered);
    setCurrentPage(1); // 첫 페이지로 이동
  };

  // 페이지네이션
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredGroups.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredGroups.length / pageSize);

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
    if (contentType === "mate") return "모임";
    if (contentType === "info") return "정보공유방";
    return contentType;
  };

  // 그룹명 길이 제한
  const truncateTitle = (title, maxLength = 25) => {
    return title && title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  // 소개글 길이 제한
  const truncateDescription = (description, maxLength = 25) => {
    return description && description.length > maxLength
      ? description.substring(0, maxLength) + "..."
      : description;
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // 필터링 적용 (1페이지로 이동)
  useEffect(() => {
    applyFilters();
  }, [searchTerm, contentTypeFilter, statusFilter]);

  // 데이터 업데이트 시 필터링만 적용 (페이지 유지)
  useEffect(() => {
    if (groups.length > 0) {
      let filtered = groups;

      // 그룹명, 소개글, 생성자 검색
      if (searchTerm) {
        filtered = filtered.filter(
          (group) =>
            group.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.simpleDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.userId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // 콘텐츠 타입 필터링
      if (contentTypeFilter !== "all") {
        filtered = filtered.filter(
          (group) => group.contentType === contentTypeFilter
        );
      }

      // 상태 필터링
      if (statusFilter !== "ALL") {
        filtered = filtered.filter((group) => group.status === statusFilter);
      }

      setFilteredGroups(filtered);
      // setCurrentPage(1); // 현재 페이지 유지
    }
  }, [groups]);

  return (
    <div className={styles.section}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>그룹 관리</h2>
      </div>

      {/* 검색 및 필터 영역 */}
      <div className={styles.filterContainer}>
        <SearchBar
          placeholder="그룹명, 소개글, 생성자로 검색"
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

          {/* 그룹 목록 테이블 */}
          {filteredGroups.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>그룹 ID</th>
                    <th>유형</th>
                    <th>생성자</th>
                    <th>그룹명</th>
                    <th>소개글</th>
                    <th>생성일</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageData().map((group) => (
                    <tr
                      key={`${group.contentType}-${group.groupId}`}
                      className={styles.tableRow}
                    >
                      <td>{group.groupId}</td>
                      <td>{getContentTypeLabel(group.contentType)}</td>
                      <td 
                        className={`${styles.authorCell} ${styles.userIdLink}`}
                        onClick={() => handleProfileClick(group.userId)}
                      >
                        {group.nickname} ({group.userId})
                      </td>
                      <td 
                        className={styles.titleCell} 
                        title={group.title}
                        onClick={() => handleGroupClick(group.groupId, group.contentType)}
                      >
                        {truncateTitle(group.title)}
                      </td>
                      <td 
                        className={styles.descriptionCell}
                        title={group.simpleDescription}
                      >
                        {truncateDescription(group.simpleDescription)}
                      </td>
                      <td>{formatDate(group.createdAt)}</td>
                      <td>
                        <div
                          className={
                            group.status === "VISIBLE"
                              ? styles.statusVisible
                              : styles.statusBlinded
                          }
                        >
                          <Dropdown
                            defaultOption={
                              group.status === "VISIBLE" ? "공개" : "블라인드"
                            }
                            options={[
                              { label: "공개", value: "VISIBLE" },
                              { label: "블라인드", value: "BLINDED" },
                            ]}
                            onSelect={(option) => {
                              if (option.value !== group.status) {
                                handleStatusChange(
                                  group.groupId,
                                  group.contentType,
                                  option.value
                                );
                              }
                            }}
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
              <p className={styles.emptyText}>조건에 맞는 그룹이 없습니다</p>
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
        그룹 상태가 변경되었습니다!
      </Modal>
    </div>
  );
}
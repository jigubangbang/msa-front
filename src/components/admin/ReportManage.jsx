import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./ReportManage.module.css";
import { Circles } from "react-loader-spinner";
import Dropdown from "../common/Dropdown";
import SearchBar from "../common/SearchBar";
import Modal from "../common/Modal/Modal";
import Pagination from "../common/Pagination/Pagination";
import refreshIcon from "../../assets/admin/refresh.svg";

export default function ReportManage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [contentSubtypeFilter, setContentSubtypeFilter] = useState("ALL");
  const [reasonFilter, setReasonFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEtcReasonModal, setShowEtcReasonModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dropdownResetKey, setDropdownResetKey] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  const pageSize = 10;
  const navigate = useNavigate();

  // 타입 변경 시 세부 타입 초기화
  const handleContentTypeChange = (option) => {
    setContentTypeFilter(option.value);
    setContentSubtypeFilter("ALL"); // 세부 타입 초기화
  };

  // 필터 옵션
  const contentTypeOptions = [
    { label: "전체 콘텐츠", value: "all" },
    { label: "게시글", value: "POST" },
    { label: "댓글", value: "COMMENT" },
    { label: "그룹", value: "GROUP" },
  ];

  // 타입에 따른 세부 타입 옵션
  const getSubtypeOptions = (contentType) => {
    const baseOption = [{ label: "전체 분류", value: "ALL" }];

    if (contentType === "POST") {
      return [
        ...baseOption,
        { label: "커뮤니티", value: "COMMUNITY" },
        { label: "여행 피드", value: "TRAVELFEED" },
      ];
    } else if (contentType === "COMMENT") {
      return [
        ...baseOption,
        { label: "커뮤니티", value: "COMMUNITY" },
        { label: "여행 피드", value: "TRAVELFEED" },
        { label: "모임", value: "TRAVELMATE" },
      ];
    } else if (contentType === "GROUP") {
      return [
        ...baseOption,
        { label: "모임", value: "TRAVELMATE" },
        { label: "정보공유방", value: "TRAVELINFO" },
      ];
    }

    return baseOption;
  };

  const reasonOptions = [
    { label: "전체 사유", value: "ALL" },
    { label: "음란/선정적 내용", value: "SEX" },
    { label: "욕설/비방", value: "ABU" },
    { label: "스팸/광고", value: "SPM" },
    { label: "불법/개인정보 노출", value: "ILG" },
    { label: "기타", value: "ETC" },
  ];

  const statusOptions = [
    { label: "전체 상태", value: "ALL" },
    { label: "대기중", value: "PENDING" },
    { label: "기각", value: "KEPT" },
    { label: "승인", value: "BLINDED" },
    { label: "철회", value: "RESCIND" },
  ];

  // 신고 목록 조회
  const fetchReports = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(`${API_ENDPOINTS.ADMIN}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data);
      setFilteredReports(response.data);
    } catch (err) {
      console.error("신고 목록 조회 실패:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        setMessage("신고 목록을 불러오는데 실패했습니다");
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 프로필 페이지로 이동
  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };
  const handleStatusChange = async (reportId, newStatus, currentStatus) => {
    if (currentStatus === "BLINDED" && newStatus === "RESCIND") {
      setPendingStatusChange({ reportId, newStatus, currentStatus });
      setShowWarningModal(true);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      let endpoint;

      if (newStatus === "KEPT") {
        endpoint = `${API_ENDPOINTS.ADMIN}/reports/${reportId}/keep`;
      } else if (newStatus === "BLINDED") {
        endpoint = `${API_ENDPOINTS.ADMIN}/reports/${reportId}/blind`;
      } else if (newStatus === "RESCIND") {
        endpoint = `${API_ENDPOINTS.ADMIN}/reports/${reportId}/unblind`;
      }

      await api.put(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchReports();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("신고 처리 실패:", err);
      setMessage("신고 처리에 실패했습니다");
      setMessageType("error");
    }
  };

  const handleConfirmStatusChange = async () => {
    if (pendingStatusChange) {
      const { reportId, newStatus, currentStatus } = pendingStatusChange;

      try {
        const token = localStorage.getItem("accessToken");
        const endpoint = `${API_ENDPOINTS.ADMIN}/reports/${reportId}/unblind`;

        await api.put(
          endpoint,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        fetchReports();
        setShowSuccessModal(true);
      } catch (err) {
        console.error("신고 처리 실패:", err);
        setMessage("신고 처리에 실패했습니다");
        setMessageType("error");
      }
    }

    setShowWarningModal(false);
    setPendingStatusChange(null);
  };

  // 컨텐츠 페이지로 이동
  const handleContentClick = (report) => {
    const { contentType, contentSubtype, contentId } = report;

    if (contentType === "POST") {
      if (contentSubtype === "COMMUNITY") {
        navigate(`/board/${contentId}`);
      } else if (contentSubtype === "TRAVELFEED") {
        navigate(`/feed/${contentId}`);
      }
    } else if (contentType === "COMMENT") {
      if (contentSubtype === "COMMUNITY") {
        navigate(`/board/${contentId}`);
      } else if (contentSubtype === "TRAVELFEED") {
        navigate(`/feed/${contentId}`);
      } else if (contentSubtype === "TRAVELMATE") {
        navigate(`/traveler/mate/${contentId}`);
      }
    } else if (contentType === "GROUP") {
      if (contentSubtype === "TRAVELMATE") {
        navigate(`/traveler/mate/${contentId}`);
      } else if (contentSubtype === "TRAVELINFO") {
        navigate(`/traveler/info/${contentId}`);
      }
    }
  };

  // 상태별 드롭다운 옵션 제한
  const getStatusOptions = (currentStatus) => {
    if (currentStatus === "PENDING") {
      return [
        { label: "대기중", value: "PENDING" },
        { label: "기각", value: "KEPT" },
        { label: "승인", value: "BLINDED" },
      ];
    } else if (currentStatus === "KEPT") {
      return [
        { label: "기각", value: "KEPT" },
        { label: "승인", value: "BLINDED" },
      ];
    } else if (currentStatus === "BLINDED") {
      return [
        { label: "승인", value: "BLINDED" },
        { label: "철회", value: "RESCIND" },
      ];
    } else if (currentStatus === "RESCIND") {
      return [{ label: "철회", value: "RESCIND" }];
    }
  };

  // 기타 사유 모달 열기
  const handleEtcReasonClick = (report) => {
    setSelectedReport(report);
    setShowEtcReasonModal(true);
  };

  // 필터 리셋
  const resetFilters = () => {
    setSearchTerm("");
    setContentTypeFilter("all");
    setContentSubtypeFilter("ALL");
    setReasonFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
    setDropdownResetKey((prev) => prev + 1);
    fetchReports();
  };

  // 검색 및 필터링
  const applyFilters = () => {
    let filtered = reports;

    // 신고자, 신고 대상 검색
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.reporterNickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reporterId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.targetNickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.targetUserId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 타입 필터링
    if (contentTypeFilter !== "all") {
      filtered = filtered.filter(
        (report) => report.contentType === contentTypeFilter
      );
    }

    // 콘텐츠 세부 타입 필터링
    if (contentSubtypeFilter !== "ALL") {
      filtered = filtered.filter(
        (report) => report.contentSubtype === contentSubtypeFilter
      );
    }

    // 신고 사유 필터링
    if (reasonFilter !== "ALL") {
      filtered = filtered.filter(
        (report) => report.reasonCode === reasonFilter
      );
    }

    // 상태 필터링
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (report) => report.reportStatus === statusFilter
      );
    }

    setFilteredReports(filtered);
    setCurrentPage(1); // 첫 페이지로 이동
  };

  // 페이지네이션
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredReports.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredReports.length / pageSize);

  // 날짜 포맷 (YYYY.MM.DD)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 타입 한글 표시
  const getContentTypeLabel = (contentType) => {
    const typeMap = {
      POST: "게시글",
      COMMENT: "댓글",
      GROUP: "그룹",
    };
    return typeMap[contentType] || contentType;
  };

  // 콘텐츠 세부 타입 한글 표시
  const getContentSubtypeLabel = (contentSubtype) => {
    const subtypeMap = {
      COMMUNITY: "커뮤니티",
      TRAVELFEED: "여행 피드",
      TRAVELMATE: "모임",
      TRAVELINFO: "정보공유방",
    };
    return subtypeMap[contentSubtype] || contentSubtype;
  };

  // 신고 사유 한글 표시
  const getReasonLabel = (reasonCode) => {
    const reasonMap = {
      SEX: "음란/선정적 내용",
      ABU: "욕설/비방",
      SPM: "스팸/광고",
      ILG: "불법/개인정보 노출",
      ETC: "기타",
    };
    return reasonMap[reasonCode] || reasonCode;
  };

  // 상태 한글 표시
  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING: "대기중",
      KEPT: "기각",
      BLINDED: "승인",
      RESCIND: "철회",
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 필터링 적용 (1페이지로 이동)
  useEffect(() => {
    applyFilters();
  }, [
    searchTerm,
    contentTypeFilter,
    contentSubtypeFilter,
    reasonFilter,
    statusFilter,
  ]);

  // 데이터 업데이트 시 필터링만 적용 (페이지 유지)
  useEffect(() => {
    if (reports.length > 0) {
      let filtered = reports;

      // 신고자, 신고 대상 검색
      if (searchTerm) {
        filtered = filtered.filter(
          (report) =>
            report.reporterNickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reporterId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.targetNickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.targetUserId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // 타입 필터링
      if (contentTypeFilter !== "all") {
        filtered = filtered.filter(
          (report) => report.contentType === contentTypeFilter
        );
      }

      // 콘텐츠 세부 타입 필터링
      if (contentSubtypeFilter !== "ALL") {
        filtered = filtered.filter(
          (report) => report.contentSubtype === contentSubtypeFilter
        );
      }

      // 신고 사유 필터링
      if (reasonFilter !== "ALL") {
        filtered = filtered.filter(
          (report) => report.reasonCode === reasonFilter
        );
      }

      // 상태 필터링
      if (statusFilter !== "ALL") {
        filtered = filtered.filter(
          (report) => report.reportStatus === statusFilter
        );
      }

      setFilteredReports(filtered);
    }
  }, [reports]);

  return (
    <div className={styles.section}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>신고 내역</h2>
      </div>

      {/* 검색 및 필터 영역 */}
      <div className={styles.filterContainer}>
        <SearchBar
          placeholder="신고자, 신고 대상으로 검색"
          onSearchChange={setSearchTerm}
          value={searchTerm}
          barWidth="260px"
        />
        <div className={styles.dropdownContainer}>
          <Dropdown
            key={`contentType-${dropdownResetKey}`}
            defaultOption="전체 콘텐츠"
            options={contentTypeOptions}
            onSelect={handleContentTypeChange}
          />
          <Dropdown
            key={`contentSubtype-${dropdownResetKey}-${contentTypeFilter}`}
            defaultOption="전체 분류"
            options={getSubtypeOptions(contentTypeFilter)}
            onSelect={(option) => setContentSubtypeFilter(option.value)}
          />
          <Dropdown
            key={`reason-${dropdownResetKey}`}
            defaultOption="전체 사유"
            options={reasonOptions}
            onSelect={(option) => setReasonFilter(option.value)}
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

          {/* 신고 목록 테이블 */}
          {filteredReports.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>신고 ID</th>
                    <th>신고자</th>
                    <th>신고 대상</th>
                    <th>콘텐츠</th>
                    <th>분류</th>
                    <th>신고 사유</th>
                    <th>신고일</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageData().map((report) => (
                    <tr key={report.id} className={styles.tableRow}>
                      <td
                        className={styles.contentIdLink}
                        onClick={() => handleContentClick(report)}
                      >
                        {report.id}
                      </td>
                      <td
                        className={styles.userIdLink}
                        onClick={() => handleProfileClick(report.reporterId)}
                      >
                        {report.reporterNickname} ({report.reporterId})
                      </td>
                      <td
                        className={styles.userIdLink}
                        onClick={() => handleProfileClick(report.targetUserId)}
                      >
                        {report.targetNickname} ({report.targetUserId})
                      </td>
                      <td>{getContentTypeLabel(report.contentType)}</td>
                      <td>{getContentSubtypeLabel(report.contentSubtype)}</td>
                      <td>
                        {report.reasonCode === "ETC" ? (
                          <span>
                            기타
                            <button
                              className={styles.etcReasonButton}
                              onClick={() => handleEtcReasonClick(report)}
                            >
                              상세 사유
                            </button>
                          </span>
                        ) : (
                          getReasonLabel(report.reasonCode)
                        )}
                      </td>
                      <td>{formatDate(report.reportedAt)}</td>
                      <td>
                        <div
                          className={
                            report.reportStatus === "PENDING"
                              ? styles.statusPending
                              : report.reportStatus === "KEPT"
                              ? styles.statusKept
                              : report.reportStatus === "BLINDED"
                              ? styles.statusBlinded
                              : report.reportStatus === "RESCIND"
                              ? styles.statusRescind
                              : ""
                          }
                          style={{
                            pointerEvents:
                              report.reportStatus === "RESCIND"
                                ? "none"
                                : "auto",
                          }}
                        >
                          <Dropdown
                            defaultOption={getStatusLabel(report.reportStatus)}
                            options={getStatusOptions(report.reportStatus)}
                            onSelect={(option) => {
                              if (
                                option.value !== report.reportStatus &&
                                option.value !== "PENDING"
                              ) {
                                handleStatusChange(
                                  report.id,
                                  option.value,
                                  report.reportStatus
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
              <p className={styles.emptyText}>조건에 맞는 신고가 없습니다</p>
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

      {/* 기타 사유 모달 */}
      <Modal
        show={showEtcReasonModal}
        onClose={() => setShowEtcReasonModal(false)}
        onSubmit={() => setShowEtcReasonModal(false)}
        heading="기타 신고 사유"
        firstLabel="확인"
      >
        {selectedReport && (
          <div className={styles.etcReasonContent}>
            <p className={styles.reasonText}>
              {selectedReport.reasonText || "상세 사유가 입력되지 않았습니다"}
            </p>
          </div>
        )}
      </Modal>

      {/* 성공 모달 */}
      <Modal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onSubmit={() => setShowSuccessModal(false)}
        heading="신고 처리 완료"
        firstLabel="확인"
      >
        신고가 성공적으로 처리되었습니다!
      </Modal>

      {/* 철회 경고 모달 */}
      <Modal
        show={showWarningModal}
        onClose={() => {
          setShowWarningModal(false);
          setPendingStatusChange(null);
        }}
        onSubmit={handleConfirmStatusChange}
        heading="신고 철회 확인"
        firstLabel="확인"
        secondLabel="취소"
      >
        신고 승인을 철회하시겠습니까?
        <br/>
        철회 후에는 더 이상 상태를 변경할 수 없습니다
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./UserManage.module.css";
import { Circles } from "react-loader-spinner";
import Dropdown from "../common/Dropdown";
import SearchBar from "../common/SearchBar";
import Modal from "../common/Modal/Modal";
import Pagination from "../common/Pagination/Pagination";
import premiumIcon from "../../assets/admin/premium_black.svg";
import kakaoIcon from "../../assets/admin/kakao.svg";
import naverIcon from "../../assets/admin/naver.svg";
import googleIcon from "../../assets/admin/google.svg";
import refreshIcon from "../../assets/admin/refresh.svg";

export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dropdownResetKey, setDropdownResetKey] = useState(0);

  const pageSize = 10;
  const navigate = useNavigate();

  // 필터 옵션
  const statusOptions = [
    { label: "전체 상태", value: "ALL" },
    { label: "활성", value: "ACTIVE" },
    { label: "정지", value: "BANNED" },
    { label: "탈퇴", value: "WITHDRAWN" },
  ];

  const roleOptions = [
    { label: "전체 권한", value: "ALL" },
    { label: "일반 회원", value: "ROLE_USER" },
    { label: "관리자", value: "ROLE_ADMIN" },
  ];

  // 회원 목록 조회
  const fetchUsers = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(`${API_ENDPOINTS.ADMIN}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      console.error("회원 목록 조회 실패:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        setMessage("회원 목록을 불러오는데 실패했습니다");
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 회원 상태 변경
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      await api.put(
        `${API_ENDPOINTS.ADMIN}/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      setShowSuccessModal(true);
    } catch (err) {
      console.error("상태 변경 실패:", err);
      setMessage("상태 변경에 실패했습니다");
      setMessageType("error");
    }
  };

  // 탈퇴 사유 조회
  const handleWithdrawalClick = async (userId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.get(
        `${API_ENDPOINTS.ADMIN}/users/${userId}/withdrawal-reason`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedWithdrawal(response.data);
      setShowWithdrawalModal(true);
    } catch (err) {
      console.error("탈퇴 사유 조회 실패:", err);
      setMessage("탈퇴 사유 조회에 실패했습니다");
      setMessageType("error");
    }
  };

  // 필터 리셋
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setRoleFilter("ALL");
    setCurrentPage(1);
    setDropdownResetKey(prev => prev + 1); // 🔄 force re-render
    fetchUsers();
  };

  // 검색 및 필터링
  const applyFilters = () => {
    let filtered = users;

    // 사용자 ID, 이름, 닉네임
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터링
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // 권한 필터링
    if (roleFilter !== "ALL") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // 첫 페이지로 이동
  };

  // 검색어나 필터 변경 시 필터링 적용 (1페이지로 이동)
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, roleFilter]);

  // 데이터 업데이트 시 필터링만 적용 (페이지 유지)
  useEffect(() => {
    if (users.length > 0) {
      let filtered = users;

      // 사용자 ID, 이름, 닉네임
      if (searchTerm) {
        filtered = filtered.filter(
          (user) =>
            user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // 상태 필터링
      if (statusFilter !== "ALL") {
        filtered = filtered.filter((user) => user.status === statusFilter);
      }

      // 권한 필터링
      if (roleFilter !== "ALL") {
        filtered = filtered.filter((user) => user.role === roleFilter);
      }

      setFilteredUsers(filtered);
      // setCurrentPage(1) 없음 - 현재 페이지 유지
    }
  }, [users]);

  // 페이지네이션
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // 소셜 아이콘
  const getSocialIcon = (provider) => {
    switch (provider) {
      case "kakao":
        return (
          <img
            src={kakaoIcon}
            alt="카카오"
            className={`${styles.socialIcon} ${styles.kakao}`}
          />
        );
      case "naver":
        return (
          <img src={naverIcon} alt="네이버" className={styles.socialIcon} />
        );
      case "google":
        return (
          <img src={googleIcon} alt="구글" className={styles.socialIcon} />
        );
      default:
        return null;
    }
  };

  // 날짜 포맷 (YYYY.MM.DD)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `~ ${year}.${month}.${day}`;
  };

  const formatDateForTooltip = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 탈퇴 사유 코드
  const getWithdrawalReasonLabel = (reasonCode) => {
    const map = {
      REJOIN: "REJOIN",
      BADUX: "BAD UI/UX",
      CONTENT: "CONTENT",
      PRIVACY: "PRIVACY",
      NOUSE: "NO USE",
      ETC: "ETC",
    };
    return map[reasonCode] || reasonCode;
  };

  // 탈퇴 사유 코드 설명
  const getWithdrawalReasonDetail = (reasonCode) => {
    const details = {
      REJOIN: "아이디 변경 또는 재가입 목적",
      BADUX: "사이트 이용이 불편하거나 복잡해서",
      CONTENT: "콘텐츠나 커뮤니티가 기대에 못 미쳐서",
      PRIVACY: "개인정보 노출이나 보안이 우려되어서",
      NOUSE: "더 이상 사용할 일이 없어서",
      ADMIN: "관리자에 의한 탈퇴",
    };
    return details[reasonCode] || null;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className={styles.section}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>회원 관리</h2>
      </div>
      {/* 검색 및 필터 영역 */}
      <div className={styles.filterContainer}>
        <SearchBar
          placeholder="아이디, 이름, 닉네임으로 검색"
          onSearchChange={setSearchTerm}
          value={searchTerm}
          barWidth="250px"
        />
        <div className={styles.dropdownContainer}>
          <Dropdown
            key={`status-${dropdownResetKey}`}
            defaultOption="전체 상태"
            options={statusOptions}
            onSelect={(option) => setStatusFilter(option.value)}
          />
          <Dropdown
            key={`role-${dropdownResetKey}`}
            defaultOption="전체 권한"
            options={roleOptions}
            onSelect={(option) => setRoleFilter(option.value)}
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

          {/* 회원 목록 테이블 */}
          {filteredUsers.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>사용자 ID</th>
                    <th>이름</th>
                    <th>닉네임</th>
                    <th>연락처</th>
                    <th>권한</th>
                    <th>상태</th>
                    <th>블라인드</th>
                    <th>정지 기간</th>
                    <th>탈퇴 사유</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageData().map((user) => (
                    <tr key={user.userId} className={styles.tableRow}>
                      <td>
                        <span
                          className={styles.userIdLink}
                          onClick={() => navigate(`/profile/${user.userId}`)}
                          title={`${formatDateForTooltip(user.createdAt)} 가입`}
                        >
                          {user.userId}
                        </span>
                        {getSocialIcon(user.provider)}
                      </td>
                      <td>
                        {user.name}{" "}
                        {user.premium && (
                          <img
                            src={premiumIcon}
                            alt="프리미엄"
                            className={styles.premiumIcon}
                          />
                        )}
                      </td>
                      <td>{user.nickname}</td>
                      <td className={styles.contactCell}>
                        <div>{user.tel || "-"}</div>
                        <div>{user.email || "-"}</div>
                      </td>
                      <td>
                        {user.role === "ROLE_ADMIN" ? "관리자" : "일반 회원"}
                      </td>
                      <td>
                        <div
                          className={
                            user.status === "ACTIVE"
                              ? styles.statusActive
                              : user.status === "BANNED"
                              ? styles.statusBanned
                              : styles.statusWithdrawn
                          }
                        >
                          <Dropdown
                            defaultOption={
                              user.status === "ACTIVE"
                                ? "활성"
                                : user.status === "BANNED"
                                ? "정지"
                                : "탈퇴"
                            }
                            options={[
                              { label: "활성", value: "ACTIVE" },
                              { label: "정지", value: "BANNED" },
                              { label: "탈퇴", value: "WITHDRAWN" },
                            ]}
                            onSelect={(option) =>
                              handleStatusChange(user.userId, option.value)
                            }
                          />
                        </div>
                      </td>
                      <td
                        className={
                          user.blindCount >= 3 ? styles.highBlindCount : ""
                        }
                      >
                        {user.blindCount}
                      </td>
                      <td>
                        {user.status === "BANNED"
                          ? formatDate(user.bannedUntil)
                          : "-"}
                      </td>
                      <td>
                        {user.status === "WITHDRAWN" ? (
                          <button
                            className={styles.withdrawalButton}
                            onClick={() => handleWithdrawalClick(user.userId)}
                          >
                            보기
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>조건에 맞는 회원이 없습니다</p>
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
      {/* 탈퇴 사유 모달 */}
      <Modal
        show={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onSubmit={() => setShowWithdrawalModal(false)}
        heading="탈퇴 사유"
        firstLabel="확인"
      >
        {selectedWithdrawal && (
          <div className={styles.withdrawalInfo}>
            {selectedWithdrawal.reasonCode === "ETC" ? (
              <>
                <p>
                  <strong>ETC</strong>
                </p>
                <p className={styles.reasonText}>
                  {selectedWithdrawal.reasonText || "상세 사유가 없습니다"}
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>
                    {getWithdrawalReasonLabel(selectedWithdrawal.reasonCode)}
                  </strong>
                </p>
                <p className={styles.reasonText}>
                  {getWithdrawalReasonDetail(selectedWithdrawal.reasonCode)}
                </p>
              </>
            )}

            <p>
              <strong>탈퇴 일시</strong>{" "}
              {new Date(selectedWithdrawal.withdrawnAt).toLocaleString()}
            </p>
          </div>
        )}
      </Modal>
      <Modal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onSubmit={() => setShowSuccessModal(false)}
        heading="상태 변경 완료"
        firstLabel="확인"
      >
        회원 상태가 변경되었습니다!
      </Modal>
    </div>
  );
}

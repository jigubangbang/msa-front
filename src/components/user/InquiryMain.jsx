import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./InquiryMain.module.css";
import { Circles } from "react-loader-spinner";
import writeIcon from "../../assets/user/write.svg";
import Pagination from "../../components/common/Pagination/Pagination";

export default function InquiryMain() {
  const [inquiryList, setInquiryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const navigate = useNavigate();

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return inquiryList.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(inquiryList.length / pageSize);

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

  const getStatusLabel = (status) => (status === "PENDING" ? "대기" : "답변 완료");

  // 날짜 포맷 (YYYY.MM.DD)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 문의 목록 불러오기
  const fetchInquiryList = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await api.get(`${API_ENDPOINTS.USER}/inquiry`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInquiryList(res.data);
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

  // 작성 버튼 클릭 시: /user/inquiry/form 으로 이동
  const handleCreateClick = () => {
    navigate("/user/inquiry/form");
  };

  // 상세 항목 클릭 시: /user/inquiry/:id 로 이동
  const handleInquiryClick = (id) => {
    navigate(`/user/inquiry/${id}`);
  };

  useEffect(() => {
    fetchInquiryList();
  }, []);

  return (
    <div className={styles.section}>
      {/* 상단 제목 + 작성 버튼 */}
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>1:1 문의</h2>
        <button className={styles.createButton} onClick={handleCreateClick} title="문의 작성">
          <img src={writeIcon} alt="문의 작성" className={styles.writeIcon} />
        </button>
      </div>

      {/* 로딩 */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Circles height="50" width="50" color="#000" ariaLabel="circles-loading" />
        </div>
      ) : (
        <>
          {/* 오류 메시지 */}
          {message && (
            <div className={`${styles.message} ${styles[messageType]}`}>
              {messageType === "error" && <span className={styles.errorIcon}>!</span>}
              {message}
            </div>
          )}

          {/* 문의 목록 */}
          {inquiryList.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>카테고리</th>
                    <th>제목</th>
                    <th>문의 날짜</th>
                    <th>처리 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageData().map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      onClick={() => handleInquiryClick(inquiry.id)}
                      className={styles.tableRow}
                    >
                      <td>{getCategoryLabel(inquiry.category)}</td>
                      <td className={styles.titleCell} title={inquiry.title}>
                        {inquiry.title}
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
              <p className={styles.emptyText}>아직 문의 내역이 없습니다</p>
              <p className={styles.emptySubText}>궁금한 사항이 있으시면 문의글을 작성해주세요</p>
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

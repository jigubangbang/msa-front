// BadgeAdminList.jsx
import React, { useState, useEffect } from "react";

import styles from "./BadgeAdminList.module.css";
import API_ENDPOINTS from "../../utils/constants";
import api from "../../apis/api";
import SearchBar from "../common/SearchBar";
import Pagination from "../common/Pagination/Pagination";
import CirclesSpinner from "../common/Spinner/CirclesSpinner";

const BadgeAdminList = ({ onBadgeClick, onBadgeModify }) => {
  const [allBadges, setAllBadges] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [badges, setBadges] = useState([]);   
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredBadges.length / itemsPerPage);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    } catch (error) {
      return dateString;
    }
  };

  const handleBadgeRowClick = (badge) => {
    if (onBadgeClick) {
      onBadgeClick(badge.badge_id);
    }
  };

  // 전체 뱃지 처음 한 번만 불러오기
  useEffect(() => {
    fetchBadges();
  }, []);

  useEffect(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const currentPageBadges = filteredBadges.slice(startIdx, startIdx + itemsPerPage);
    setBadges(currentPageBadges);
  }, [currentPage, filteredBadges]);

  const fetchBadges = async () => {
    console.log(searchTerm);
    setLoading(true);
    try {
      const response = await api.get(`${API_ENDPOINTS.QUEST.ADMIN}/badges`);
      const all = response.data.badges || [];
      setAllBadges(all);
      setFilteredBadges(all); 

      // 현재 페이지 기준으로 자르기
      const startIdx = (currentPage - 1) * itemsPerPage;
      const currentPageBadges = all.slice(startIdx, startIdx + itemsPerPage);
      setBadges(currentPageBadges);
    } catch (err) {
      console.error("Failed to fetch admin badges", err);
      setBadges([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    const filtered = allBadges.filter((badge) =>
      badge.kor_title.includes(value) || badge.eng_title.includes(value)
    );
    setFilteredBadges(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  if (loading) {
    return <CirclesSpinner/>;
  }

  return (
    <div className={styles.badgeAdminList}>
      <div className={styles.header}>
        <p className={styles.totalCount}>전체 {filteredBadges.length}개 뱃지</p>
        <h2 className={styles.sectionTitle}>뱃지 관리</h2>
      </div>

      <div className={styles.filterContainer}>
        <SearchBar
          placeholder="뱃지명으로 검색"
          value={searchTerm}
          onSearchChange={handleSearchChange}
          barWidth="260px"
        />
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>뱃지 ID</th>
              <th>뱃지</th>
              <th>뱃지명 (국문)</th>
              <th>뱃지명 (영문)</th>
              <th>난이도</th>
              <th>연결 퀘스트</th>
              <th>생성일</th>
              <th>수정</th>
            </tr>
          </thead>
          <tbody>
            {badges.map((badge, index) => {
              const uniqueKey = badge.badge_id
                ? `badge-${badge.badge_id}`
                : `badge-${index}`;

              return (
                <tr
                  key={uniqueKey}
                  className={styles.tableRow}
                  onClick={() => handleBadgeRowClick(badge)}
                >
                  <td>{badge.badge_id}</td>
                  <td>
                    <img
                      src={badge.icon}
                      alt={badge.kor_title}
                      className={styles.badgeIcon}
                    />
                  </td>
                  <td className={styles.titleCell} title={badge.kor_title}>
                    {badge.kor_title}
                  </td>
                  <td className={styles.titleCell} title={badge.eng_title}>
                    {badge.eng_title}
                  </td>
                  <td>
                    <span
                      className={`${styles.difficultyTag} ${
                        styles[`difficulty${badge.difficulty}`]
                      }`}
                    >
                      Level {badge.difficulty}
                    </span>
                  </td>
                  <td>
                    <div className={styles.questList}>
                      {badge.quest && badge.quest.length > 0 ? (
                        <>
                          <span className={styles.questCount}>
                            {badge.quest.length}개 퀘스트
                          </span>
                          <div className={styles.questTooltip}>
                            {badge.quest.map((quest, idx) => (
                              <div key={idx} className={styles.questItem}>
                                {quest}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <span className={styles.noQuests}>퀘스트 없음</span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(badge.created_at)}</td>
                  <td>
                    <button
                      className={styles.modifyButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onBadgeModify) {
                          onBadgeModify(badge);
                        }
                      }}
                    >
                      수정
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          pageBlock={5}
          pageCount={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default React.memo(BadgeAdminList);

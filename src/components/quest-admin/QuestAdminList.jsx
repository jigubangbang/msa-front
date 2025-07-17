// QuestAdminList.jsx
import React, { useState, useEffect } from "react";

import styles from "./QuestAdminList.module.css";
import API_ENDPOINTS from "../../utils/constants";
import SearchBar from "../common/SearchBar";
import Dropdown from "../common/Dropdown";
import Pagination from "../common/Pagination/Pagination";
import api from "../../apis/api";
import refreshIcon from "../../assets/admin/refresh.svg";
import CirclesSpinner from "../common/Spinner/CirclesSpinner";

const QuestAdminList = ({ onQuestClick }) => {
  const [quests, setQuests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    sortOption: "created_at",
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const statusOptions = [
    { value: "all", label: "전체 상태" },
    { value: "ACTIVE", label: "활성" },
    { value: "INACTIVE", label: "비활성" },
  ];

  const sortOptions = [
    { value: "created_at", label: "생성일 (오래된순)" },
    { value: "created_at_desc", label: "생성일 (최신순)" },
    { value: "title", label: "제목 (가나다순)" },
    { value: "title_desc", label: "제목 (가나다 역순)" },
    { value: "xp", label: "XP (낮은순)" },
    { value: "xp_desc", label: "XP (높은순)" },
  ];

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

  const formatDateRange = (startDate, endDate) => {
    try {
      if (!startDate || !endDate) return "-";
      const start = new Date(startDate);
      const end = new Date(endDate);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}.${month}.${day}`;
      };

      return (
        <div className={styles.dateRange}>
          <div>
            {formatDate(start)} ~ {formatDate(end)}
          </div>
        </div>
      );
    } catch (error) {
      return "-";
    }
  };

  const handleSortChange = (option) => {
    handleFilterChange("sortOption", option.value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handlePageChange = (pageNum) => {
    window.scroll(0,0);
    setCurrentPage(pageNum);
  };

  const handleQuestRowClick = (quest) => {
    if (onQuestClick) {
      onQuestClick(quest.quest_id);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, [currentPage, filters, searchTerm]);

  const fetchQuests = async () => {
    setLoading(true);
    try {
      const params = {
        pageNum: currentPage,
        search: searchTerm,
        sortOption: filters.sortOption,
        limit: itemsPerPage,
        status: filters.status,
      };

      const response = await api.get(`${API_ENDPOINTS.QUEST.ADMIN}/list`, {
        params,
      });

      setQuests(response.data.questList || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch admin quests", err);
      setQuests([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getSortDisplayText = () => {
    const selected = sortOptions.find(
      (opt) => opt.value === filters.sortOption
    );
    return selected ? selected.label : "Sort by";
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      status: "all",
      sortOption: "created_at"
    });
    setCurrentPage(1);
  };

  if (loading) {
    return <CirclesSpinner />;
  }

  return (
    <div className={styles.questAdminList}>
      <div className={styles.header}>
        <p className={styles.totalCount}>전체 {totalCount}개 퀘스트</p>
        <h2 className={styles.questListTitle}>퀘스트 관리</h2>
      </div>

      {/* 검색 및 필터 영역 */}
      <div className={styles.filterContainer}>
        <SearchBar
          placeholder="카테고리, 퀘스트명으로 검색"
          value={searchTerm}
          onSearchChange={handleSearchChange}
          barWidth="260px"
        />
        <div className={styles.dropdownContainer}>
          <Dropdown
            defaultOption={statusOptions.find(opt => opt.value === filters.status)?.label || "전체 상태"}
            options={statusOptions}
            onSelect={(option) => handleFilterChange("status", option.value)}
          />
          <Dropdown
            defaultOption={getSortDisplayText()}
            options={sortOptions}
            onSelect={handleSortChange}
          />
          <img
            src={refreshIcon}
            alt="필터 초기화"
            className={styles.resetIcon}
            onClick={resetFilters}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>퀘스트 ID</th>
              <th>카테고리</th>
              <th>퀘스트명</th>
              <th>난이도</th>
              <th>XP</th>
              <th>시즌 퀘스트</th>
              <th>기간</th>
              <th>상태</th>
              <th>생성일</th>
            </tr>
          </thead>
          <tbody>
            {quests.map((quest, index) => {
              const uniqueKey = quest.quest_id
                ? `quest-${quest.quest_id}`
                : `quest-${currentPage}-${index}`;

              return (
                <tr
                  key={uniqueKey}
                  className={`${styles.tableRow} ${
                    quest.status === "INACTIVE" ? styles.inactive : ""
                  }`}
                  onClick={() => handleQuestRowClick(quest)}
                >
                  <td>{quest.quest_id}</td>
                  <td>{quest.category}</td>
                  <td className={styles.titleCell} title={quest.title}>
                    {quest.title}
                  </td>
                  <td>
                    <span
                      className={`${styles.difficultyTag} ${
                        styles[quest.difficulty?.toLowerCase()]
                      }`}
                    >
                      {quest.difficulty}
                    </span>
                  </td>
                  <td>
                    <span className={styles.xpValue}>{quest.xp}</span>
                  </td>
                  <td>{quest.is_seasonal ? "O" : "-"}</td>
                  <td>
                    {quest.is_seasonal
                      ? formatDateRange(quest.season_start, quest.season_end)
                      : "-"}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusTag} ${
                        styles[quest.status?.toLowerCase()]
                      }`}
                    >
                      {quest.status === "ACTIVE" ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td>{formatDate(quest.created_at)}</td>
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

export default React.memo(QuestAdminList);

// QuestAdminList.jsx - 프론트 페이징 버전
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
  const [allQuests, setAllQuests] = useState([]); // 전체 퀘스트 데이터
  const [filteredQuests, setFilteredQuests] = useState([]); // 필터링된 퀘스트 데이터
  const [quests, setQuests] = useState([]); // 현재 페이지에 표시할 퀘스트
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    sortOption: "created_at",
  });
  const [dropdownKey, setDropdownKey] = useState(0); // 드롭다운 리셋용 key

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredQuests.length / itemsPerPage);

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

  const handleQuestRowClick = (quest) => {
    if (onQuestClick) {
      onQuestClick(quest.quest_id);
    }
  };

  // 전체 퀘스트 데이터를 처음 한 번만 불러오기
  useEffect(() => {
    fetchAllQuests();
  }, []);

  // 필터링된 데이터가 변경될 때마다 현재 페이지 데이터 업데이트
  useEffect(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const currentPageQuests = filteredQuests.slice(startIdx, startIdx + itemsPerPage);
    setQuests(currentPageQuests);
  }, [currentPage, filteredQuests]);

  // 검색어나 필터가 변경될 때마다 필터링 적용
  useEffect(() => {
    applyFiltersAndSort();
  }, [searchTerm, filters, allQuests]);

  const fetchAllQuests = async () => {
    setLoading(true);
    try {
      // 전체 데이터를 가져오는 API 호출 (페이징 파라미터 제거)
      const response = await api.get(`${API_ENDPOINTS.QUEST.ADMIN}/list`, {
        params: {
          // 전체 데이터를 가져오기 위한 파라미터 설정
          // limit을 매우 큰 값으로 설정하거나 백엔드에서 전체 데이터 반환하도록 수정
          limit: 9999 // 또는 백엔드에서 limit 없이 전체 데이터 반환
        }
      });

      const allQuestsData = response.data.questList || [];
      setAllQuests(allQuestsData);
      setFilteredQuests(allQuestsData);

      // 현재 페이지 기준으로 자르기
      const startIdx = (currentPage - 1) * itemsPerPage;
      const currentPageQuests = allQuestsData.slice(startIdx, startIdx + itemsPerPage);
      setQuests(currentPageQuests);
    } catch (err) {
      console.error("Failed to fetch admin quests", err);
      setQuests([]);
      setAllQuests([]);
      setFilteredQuests([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allQuests];

    // 검색 필터 적용
    if (searchTerm) {
      filtered = filtered.filter(
        (quest) =>
          quest.category?.includes(searchTerm) ||
          quest.title?.includes(searchTerm)
      );
    }

    // 상태 필터 적용
    if (filters.status !== "all") {
      filtered = filtered.filter((quest) => quest.status === filters.status);
    }

    // 정렬 적용
    filtered.sort((a, b) => {
      switch (filters.sortOption) {
        case "created_at":
          return new Date(a.created_at) - new Date(b.created_at);
        case "created_at_desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "title":
          return a.title?.localeCompare(b.title, "ko") || 0;
        case "title_desc":
          return b.title?.localeCompare(a.title, "ko") || 0;
        case "xp":
          return (a.xp || 0) - (b.xp || 0);
        case "xp_desc":
          return (b.xp || 0) - (a.xp || 0);
        default:
          return 0;
      }
    });

    setFilteredQuests(filtered);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  const handleSortChange = (option) => {
    handleFilterChange("sortOption", option.value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handlePageChange = (pageNum) => {
    window.scroll(0, 0);
    setCurrentPage(pageNum);
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
    
    // 드롭다운 강제 리셋을 위한 key 변경
    setDropdownKey(prev => prev + 1);
  };

  if (loading) {
    return <CirclesSpinner />;
  }

  return (
    <div className={styles.questAdminList}>
      <div className={styles.header}>
        <p className={styles.totalCount}>전체 {filteredQuests.length}개 퀘스트</p>
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
            key={`status-${dropdownKey}`}
            defaultOption={statusOptions.find(opt => opt.value === filters.status)?.label || "전체 상태"}
            options={statusOptions}
            onSelect={(option) => handleFilterChange("status", option.value)}
          />
          <Dropdown
            key={`sort-${dropdownKey}`}
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
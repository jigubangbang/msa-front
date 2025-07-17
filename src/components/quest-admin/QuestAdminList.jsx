// QuestAdminList.jsx
import React, { useState, useEffect } from 'react';

import styles from './QuestAdminList.module.css';
import API_ENDPOINTS from '../../utils/constants';
import SearchBar from '../common/SearchBar';
import Dropdown from '../common/Dropdown';
import Pagination from '../common/Pagination/Pagination';
import api from '../../apis/api';


const QuestAdminList = ({ onQuestClick}) => {
  const [quests, setQuests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    sortOption: 'created_at'
  });
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Created Date (Oldest)' },
    { value: 'created_at_desc', label: 'Created Date (Newest)' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'title_desc', label: 'Title (Z-A)' },
    { value: 'xp', label: 'XP (Low to High)' },
    { value: 'xp_desc', label: 'XP (High to Low)' }
  ];

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateString;
    }
  };

  const formatDateRange = (startDate, endDate) => {
    try {
      if (!startDate || !endDate) return '-';
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const formatDate = (date) => {
        const year = String(date.getFullYear()).slice(-2); 
        const month = date.getMonth() + 1; 
        const day = date.getDate();
        return `${year}년 ${month}월 ${day}일`;
      };
      
      return (
        <div className={styles.dateRange}>
          <div>{formatDate(start)}</div>
          <div>~{formatDate(end)}</div>
        </div>
      );
    } catch (error) {
      return '-';
    }
  };

  const handleSortChange = (option) => {
    handleFilterChange('sortOption', option.value);
  };
  
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); 
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
        status: filters.status
      };

      const response = await api.get(`${API_ENDPOINTS.QUEST.ADMIN}/list`, { params });
      
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
  const selected = sortOptions.find(opt => opt.value === filters.sortOption);
  return selected ? selected.label : "Sort by";
};


  if (loading) {
    return (
      <div className={styles.questAdminList}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.questAdminList}>
      <div className={styles.header}>
        <h2 className={styles.questListTitle}>Quest Management</h2>
      </div>

      {/* Search Section */}
      <div className={styles.searchSection}>
        <p className={styles.totalCount}>
          Total {totalCount} quests
        </p>
        <SearchBar
          placeholder="Search quests..."
          value={searchTerm}
          onSearchChange={handleSearchChange}
          barWidth="300px"
          debounceMs={500}
        />
      </div>

      {/* Status Filter */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Status:</label>
          <div className={styles.filterButtons}>
            {statusOptions.map((status) => (
              <button
                key={status.value}
                className={`${styles.filterButton} ${
                  filters.status === status.value ? styles.active : ''
                }`}
                onClick={() => handleFilterChange('status', status.value)}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className={styles.dropdown}>
        <Dropdown
          defaultOption={getSortDisplayText()}
          options={sortOptions}
          onSelect={handleSortChange}
        />
      </div>

      {/* Table Header */}
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>ID</div>
        <div className={styles.headerCell}>Category</div>
        <div className={styles.headerCell}>Title</div>
        <div className={styles.headerCell}>Difficulty</div>
        <div className={styles.headerCell}>XP</div>
        <div className={styles.headerCell}>Seasonal</div>
        <div className={styles.headerCell}>Period</div>
        <div className={styles.headerCell}>Status</div>
        <div className={styles.headerCell}>Created</div>
      </div>

      {/* Table Body */}
      <div className={styles.tableBody}>
        {quests.map((quest, index) => {
          const uniqueKey = quest.quest_id ? `quest-${quest.quest_id}` : `quest-${currentPage}-${index}`;
          
          return (
            <div 
              key={uniqueKey} 
              className={`${styles.tableRow} ${quest.status === 'INACTIVE' ? styles.inactive : ''}`}
              onClick={() => handleQuestRowClick(quest)}
            >
              <div className={styles.cell}>{quest.quest_id}</div>
              <div className={styles.cell}>{quest.category}</div>
              <div className={styles.cell} title={quest.title}>
                <div className={styles.titleCell}>{quest.title}</div>
              </div>
              <div className={styles.cell}>
                <span className={`${styles.difficultyTag} ${styles[quest.difficulty?.toLowerCase()]}`}>
                  {quest.difficulty}
                </span>
              </div>
              <div className={styles.cell}>
                <span className={styles.xpValue}>{quest.xp}</span>
              </div>
              <div className={styles.cell}>
                <span className={`${styles.seasonalTag} ${quest.is_seasonal ? styles.seasonal : styles.permanent}`}>
                  {quest.is_seasonal ? 'Yes' : 'No'}
                </span>
              </div>
              <div className={styles.cell}>
                {quest.is_seasonal 
                  ? formatDateRange(quest.season_start, quest.season_end)
                  : '-'
                }
              </div>
              <div className={styles.cell}>
                <span className={`${styles.statusTag} ${styles[quest.status?.toLowerCase()]}`}>
                  {quest.status}
                </span>
              </div>
              <div className={styles.cell}>{formatDate(quest.created_at)}</div>
            </div>
          );
        })}
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
import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './RankQuestList.module.css';
import SearchBar from '../../common/SearchBar';
import Pagination from '../../common/Pagination/Pagination';
import Dropdown from '../../common/Dropdown';
import api from '../../../apis/api';

const RankQuestList = ({  
  onOpenModal,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  filters,
  setFilters }) => {
  const [quests, setQuests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

    const categories = [
    { value: 0, label: '전체' },
    { value: 1, label: '첫 발걸음' },
    { value: 2, label: '글쓰기/기록' },
    { value: 3, label: '음식/맛집' },
    { value: 4, label: '문화 체험' },
    { value: 5, label: '자연 체험' },
    { value: 6, label: '여행 생활' },
    { value: 7, label: '소통/공유' },
    { value: 8, label: '고난이도 도전' },
    { value: 9, label: '특수 조건' },
    { value: 10, label: '기간 제한' }
  ];

  const difficulties = [
    { value: '', label: '전체' },
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Normal' },
    { value: 'HARD', label: 'Hard' }
  ];

  const sortOptions = [
    { value: 'default', label: 'As Listed'},
    { value: 'latest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'xp_high', label: 'XP High to Low' },
    { value: 'xp_low', label: 'XP Low to High' }
  ];


  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const formatDateRange = (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const formatDate = (date) => {
        const year = String(date.getFullYear()).slice(-2); 
        const month = date.getMonth() + 1; 
        const day = date.getDate();
        return `${year}년 ${month}월 ${day}일`;
      };
      
      return (
        <div>
          <div>{formatDate(start)}</div>
          <div>~{formatDate(end)}</div>
        </div>
      );
    } catch (error) {
      return `${startDate}-${endDate}`; 
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

  useEffect(() => {
    fetchQuests();
  }, [currentPage, filters, searchTerm]);

  const fetchQuests = async () => {
    setLoading(true);
    try {
      const params = {
        pageNum: currentPage, 
        category: filters.category,
        ...(filters.sortOption && { sortOption: filters.sortOption }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        search: searchTerm
      };

      const response = await api.get(`${API_ENDPOINTS.QUEST.PUBLIC}/list`, {params});
      
      setQuests(response.data.quests || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch rankings", err);
      setQuests([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
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
    if (onOpenModal && quest.id) {
        onOpenModal(quest.id);
      }
  }

  const getSortDisplayText = () => {
  const selected = sortOptions.find(opt => opt.value === filters.sortOption);
  return selected ? selected.label : "Sort by";
};


  if (loading) {
    return (
      <div className={styles.questList}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.questList}>
        <h2 className={styles.questListTitle}>Quests</h2>
      {/* Search */}
      <div className={styles.searchSection}>
        <p className={styles.totalCount}>
          현재 {totalCount}개의 퀘스트에 도전할 수 있습니다.
        </p>
        <SearchBar
          placeholder="Quest"
          value={searchTerm}
          onSearchChange={handleSearchChange}
          barWidth="200px"
          debounceMs={500}
        />
      </div>

      {/* 필터 토글 */}
      <div className={styles.filters}>
        {/* 카테고리 필터 */}
        <div className={styles.filterGroup}>
          <div className={styles.filterButtons}>
            {categories.map((category) => (
              <button
                key={category.value}
                className={`${styles.filterButton} ${
                  filters.category === category.value ? styles.active : ''
                }`}
                onClick={() => handleFilterChange('category', category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 난이도 필터 */}
        <div className={styles.filterGroup}>
          <div className={styles.filterButtons}>
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.value}
                className={`${styles.filterButton} ${
                  filters.difficulty === difficulty.value ? styles.active : ''
                }`}
                onClick={() => handleFilterChange('difficulty', difficulty.value)}
              >
                {difficulty.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.dropdown}>
          <Dropdown
            defaultOption={getSortDisplayText()}
            options={sortOptions}
            onSelect={handleSortChange}
          />
        </div>

      {/* header */}
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>#</div>
        <div className={styles.headerCell}>Category</div>
        <div className={styles.headerCell}>Title</div>
        <div className={styles.headerCell}>Difficulty/XP</div>
        <div className={styles.headerCell}>Peroid</div>
        <div className={styles.headerCell}>Badge</div>
        <div className={styles.headerCell}>In Progress</div>
        <div className={styles.headerCell}>Completed</div>
      </div>

      {/* table */}
      <div className={styles.tableBody}>
        {quests.map((quest, index) => {
          //const rank = (currentPage - 1) * itemsPerPage + index + 1;
          //const isMyUser = user.user_id === myUserId;
          const isMyUser = false;
          const uniqueKey = quest.id ? `quest-${quest.id}` : `quest-${currentPage}-${index}`;

          
          return (
            <div 
              key={uniqueKey} 
              className={`${styles.tableRow} ${isMyUser ? styles.highlighted : ''}`}
              onClick={() => handleQuestRowClick(quest)}
            >
              <div className={styles.cell}>{quest.id}</div>
              <div className={styles.cell}>{getCategoryLabel(quest.category)}</div>
              <div className={styles.cell}>{quest.title}</div>
              <div className={styles.cell}>
                <div className={styles.questInfo}>
                  <div className={styles.difficulty}>{quest.difficulty}</div>
                  <div className={styles.difficulty}>/</div>
                  <div className={styles.xp}>{quest.xp}</div>
                </div>
              </div>
              <div className={styles.cell}>
                {quest.category == 10 
                  ? formatDateRange(quest.season_start, quest.season_end)
                  : 'constant'
                }
              </div>
              
              <div className={styles.cell}>
                <div className={styles.badgeImage}>
                  <img src={quest.icon ? quest.icon : '/icons/common/unknwon_badge.png'} alt="profile" />
                </div>
              </div>

              <div className={styles.cell}>{quest.count_in_progress}</div>
              <div className={styles.cell}>{quest.count_completed}</div>
            </div>
          );
        })}
      </div>

      {/* pagination */}
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

export default React.memo(RankQuestList);
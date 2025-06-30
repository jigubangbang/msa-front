import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './RankQuestList.module.css';
import SearchBar from '../../common/SearchBar';
import Pagination from '../../common/Pagination/Pagination';

const RankQuestList = ({ myUserId }) => {
  const [quests, setQuests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentSortOption, setCurrentSortOption] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    fetchQuests();
  }, [currentPage, searchTerm]);

  const fetchQuests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.PUBLIC}/list`, {
        params: {
          page: currentPage,
          category: currentCategory,
          sortOption: currentSortOption,
          difficulty: currentDifficulty,
          search: searchTerm
        }
      });
      
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
      setCurrentPage(pageNum);
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
        <h2 className={styles.questListTitle}>Rank(Level)</h2>
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
          const rank = (currentPage - 1) * itemsPerPage + index + 1;
          //const isMyUser = user.user_id === myUserId;
          const isMyUser = false;
          
          return (
            <div 
              key={quest.id || index} 
              className={`${styles.tableRow} ${isMyUser ? styles.highlighted : ''}`}
            >
              <div className={styles.cell}>{rank}</div>
              <div className={styles.cell}>{quest.category}</div>
              <div className={styles.cell}>{quest.title}</div>
              <div className={styles.cell}>
                <div className={styles.questInfo}>
                  <div className={styles.difficulty}>{quest.difficulty}</div>
                  <div className={styles.xp}>{quest.xp}</div>
                </div>
              </div>
              <div className={styles.cell}>
                {quest.is_seasonal === true ? `${quest.season_start}-${quest.season_end}` : `constant`}
              </div>
              
              <div className={styles.cell}>
                <div className={styles.badgeImage}>
                  <img src={quest.icon} alt="profile" />
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

export default RankQuestList;
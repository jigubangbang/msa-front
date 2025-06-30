import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './RankList.module.css';
import SearchBar from '../../common/SearchBar';

const RankingList = ({ myUserId }) => {
  const [rankings, setRankings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    fetchRankings();
  }, [currentPage, searchTerm]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.PUBLIC}/rankings`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        }
      });
      
      setRankings(response.data.rankings || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch rankings", err);
      setRankings([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className={styles.rankingList}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.rankingList}>
        <h2 className={styles.rankingListTitle}>Rank(Level)</h2>
      {/* Search */}
      <div className={styles.searchSection}>
        <p className={styles.totalCount}>
          현재 {totalCount}명의 방방이들의 퀘스트 챌린지가 진행 중 입니다.
        </p>
        <SearchBar
          placeholder="USER ID"
          value={searchTerm}
          onSearchChange={handleSearchChange}
          barWidth="200px"
        />
      </div>

      {/* header */}
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>#</div>
        <div className={styles.headerCell}>Profile</div>
        <div className={styles.headerCell}>ID / Nickname</div>
        <div className={styles.headerCell}>Level</div>
        <div className={styles.headerCell}>Quests Completed</div>
        <div className={styles.headerCell}>XP</div>
        <div className={styles.headerCell}>Performance</div>
      </div>

      {/* table */}
      <div className={styles.tableBody}>
        {rankings.map((user, index) => {
          const rank = (currentPage - 1) * itemsPerPage + index + 1;
          const isMyUser = user.user_id === myUserId;
          
          return (
            <div 
              key={user.user_id || index} 
              className={`${styles.tableRow} ${isMyUser ? styles.highlighted : ''}`}
            >
              <div className={styles.cell}>{rank}</div>
              <div className={styles.cell}>
                <div className={styles.profileImage}>
                  <img src={user.icon || user.profile_image || '/icons/common/user_profile.svg'} alt="profile" />
                </div>
              </div>
              <div className={styles.cell}>
                <div className={styles.userInfo}>
                  <div className={styles.userId}>{user.user_id || user.nickname}</div>
                  <div className={styles.nickname}>{user.nickname}</div>
                </div>
              </div>
              <div className={styles.cell}>{user.level || 0}</div>
              <div className={styles.cell}>{user.completed_quest || 0}</div>
              <div className={styles.cell}>{user.xp || 0}</div>
              <div className={styles.cell}>
                {user.completed_quest && user.in_progress_quest 
                  ? `${user.completed_quest}/${user.in_progress_quest + user.completed_quest}`
                  : '-'
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageButton}
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={`${styles.pageButton} ${
                page === currentPage ? styles.active : ''
              } ${page === '...' ? styles.ellipsis : ''}`}
              onClick={() => typeof page === 'number' && goToPage(page)}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}

          <button 
            className={styles.pageButton}
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RankingList;
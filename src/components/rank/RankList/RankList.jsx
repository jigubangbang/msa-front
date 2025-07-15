import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './RankList.module.css';
import SearchBar from '../../common/SearchBar';
import Pagination from '../../common/Pagination/Pagination';
import api from '../../../apis/api';

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
      const response = await api.get(`${API_ENDPOINTS.QUEST.PUBLIC}/rankings`, {
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

    const handlePageChange = (pageNum) => {
        setCurrentPage(pageNum);
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

export default RankingList;
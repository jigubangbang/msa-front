import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './RankBadgeList.module.css';
import SearchBar from '../../common/SearchBar';
import Pagination from '../../common/Pagination/Pagination';
import ReactDOM from 'react-dom';



const RankBadgeList = ({ 
  onOpenBadgeModal,
  searchTerm = '',
  setSearchTerm,
  currentPage = 1,
  setCurrentPage
}) => {
    const [badges, setBadges] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // const [currentPage, setCurrentPage] = useState(1);
    // const [searchTerm, setSearchTerm] = useState('');

    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    useEffect(() => {
        fetchBadges();
    }, [currentPage, searchTerm]);

    const fetchBadges = async () => {
        setLoading(true);

        const params = {
            pageNum: currentPage, 
            search: searchTerm,
            limit: 10
            };

        try {
            const response = await axios.get(`${API_ENDPOINTS.QUEST.PUBLIC}/badges`, {params});
            
            setBadges(response.data.badges || []);
            setTotalCount(response.data.totalCount || 0);
        } catch (err) {
            console.error("Failed to fetch badges", err);
            setBadges([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyText = (difficulty) => {
        switch(difficulty) {
            case 1: return 'Easy';
            case 2: return 'Normal';
            case 3: return 'Hard';
            case 4: return 'Season';
            default: return difficulty;
        }
    };

  
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  const handlePageChange = (pageNum) => {
      setCurrentPage(pageNum);
  };

  const handleBadgeRowClick = (badge) => {
    if (onOpenBadgeModal && badge.id) {
        onOpenBadgeModal(badge.id);
      }
  }


  if (loading) {
    return (
      <div className={styles.badgeList}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.badgeList}>
        <h2 className={styles.badgeListTitle}>Badges</h2>
      {/* Search */}
            <div className={styles.searchSection}>
              <p className={styles.totalCount}>
                현재 {totalCount}개의 뱃지에 도전할 수 있습니다.
              </p>
              <SearchBar
                placeholder="Badge"
                value={searchTerm}
                onSearchChange={handleSearchChange}
                barWidth="200px"
                debounceMs={500}
              />
            </div>

      {/* header */}
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>Icon</div>
        <div className={styles.headerCell}>#</div>
        <div className={styles.headerCell}>Title</div>
        <div className={styles.headerCell}>Quests</div>
        <div className={styles.headerCell}>Difficulty</div>
        <div className={styles.headerCell}>Acquired</div>
      </div>

      {/* table */}
      <div className={styles.tableBody}>
        {badges.map((badge, index) => {
          //const rank = (currentPage - 1) * itemsPerPage + index + 1;
          //const isMyUser = user.user_id === myUserId;
          const isMyUser = false;
          const uniqueKey = badge.id ? `badge-${badge.id}` : `badge-${currentPage}-${index}`;

          return (
            <div key={uniqueKey} className={styles.badgeRowContainer}
              onClick={() => handleBadgeRowClick(badge)}>
              {/* 첫 번째 행 */}
              <div className={`${styles.tableRow} ${styles.firstRow} ${isMyUser ? styles.highlighted : ''}`}>
                <div className={`${styles.cell} ${styles.iconCell}`} rowSpan="2">
                  <div className={styles.badgeImage}>
                    <img src={badge.icon} alt="badge icon" />
                  </div>
                </div>
                
                <div className={styles.cell}>{badge.id}</div>

                <div className={styles.cell}>
                  <div className={styles.badgeTitle}>
                    <div className={styles.badgeKorTitle}>{badge.kor_title}</div>
                    <div className={styles.badgeEngTitle}>{badge.eng_title}</div>
                  </div>
                </div>
                
                <div className={styles.cell}>
                  <div className={styles.badgeQuests}>
                    {badge.quest && badge.quest.map((quest, questIndex) => (
                      <div key={questIndex} className={styles.questItem}>
                        {quest}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.cell}>
                    {getDifficultyText(badge.difficulty)}
                </div>
                
                <div className={styles.cell}>
                  <span className={styles.acquiredCount}>
                    {badge.acquired_count}명
                  </span>
                </div>
              </div>

              {/* 행2 */}
              <div className={`${styles.tableRow} ${styles.secondRow} ${isMyUser ? styles.highlighted : ''}`}>
                <div className={styles.cell}></div> 
                <div className={`${styles.cell} ${styles.descriptionCell}`}>
                  <div className={styles.badgeDescription}>
                    {badge.description}
                  </div>
                </div>
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

export default React.memo(RankBadgeList);

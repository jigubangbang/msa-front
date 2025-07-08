// BadgeAdminList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import styles from './BadgeAdminList.module.css';
import API_ENDPOINTS from '../../utils/constants';

const BadgeAdminList = ({ onBadgeClick, onBadgeModify }) => {
  const [badges, setBadges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const handleBadgeRowClick = (badge) => {
    if (onBadgeClick) {
      onBadgeClick(badge.badge_id);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.ADMIN}/badges`);
      
      setBadges(response.data.badges || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch admin badges", err);
      setBadges([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.badgeAdminList}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.badgeAdminList}>
      <div className={styles.header}>
        <h2 className={styles.badgeListTitle}>Badge Management</h2>
      </div>

      {/* Count Section */}
      <div className={styles.countSection}>
        <p className={styles.totalCount}>
          Total {totalCount} badges
        </p>
      </div>

      {/* Table Header */}
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>ID</div>
        <div className={styles.headerCell}>Icon</div>
        <div className={styles.headerCell}>Korean Title</div>
        <div className={styles.headerCell}>English Title</div>
        <div className={styles.headerCell}>Difficulty</div>
        <div className={styles.headerCell}>Quests</div>
        <div className={styles.headerCell}>Created</div>
        <div className={styles.headerCell}>Actions</div>
      </div>

      {/* Table Body */}
      <div className={styles.tableBody}>
        {badges.map((badge, index) => {
          const uniqueKey = badge.badge_id ? `badge-${badge.badge_id}` : `badge-${index}`;
          
          return (
            <div 
              key={uniqueKey} 
              className={styles.tableRow}
              onClick={() => handleBadgeRowClick(badge)}
            >
              <div className={styles.cell}>{badge.badge_id}</div>
              <div className={styles.cell}>
                <img 
                  src={badge.icon} 
                  alt={badge.kor_title}
                  className={styles.badgeIcon}
                />
              </div>
              <div className={styles.cell} title={badge.kor_title}>
                <div className={styles.titleCell}>{badge.kor_title}</div>
              </div>
              <div className={styles.cell} title={badge.eng_title}>
                <div className={styles.titleCell}>{badge.eng_title}</div>
              </div>
              <div className={styles.cell}>
                <span className={`${styles.difficultyTag} ${styles[`difficulty${badge.difficulty}`]}`}>
                  Level {badge.difficulty}
                </span>
              </div>
              <div className={styles.cell}>
                <div className={styles.questList}>
                  {badge.quest && badge.quest.length > 0 ? (
                    <>
                      <span className={styles.questCount}>{badge.quest.length} quests</span>
                      <div className={styles.questTooltip}>
                        {badge.quest.map((quest, idx) => (
                          <div key={idx} className={styles.questItem}>
                            {quest}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className={styles.noQuests}>No quests</span>
                  )}
                </div>
              </div>
              <div className={styles.cell}>{formatDate(badge.created_at)}</div>
              <div className={styles.cell}>
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
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(BadgeAdminList);
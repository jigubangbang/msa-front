// BadgeAdminDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import styles from './BadgeAdminDetail.module.css';
import API_ENDPOINTS from '../../utils/constants';

const BadgeAdminDetail = ({ badgeId }) => {
  const [badgeDetail, setBadgeDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };

  const handleEdit = () => {
    console.log('Edit badge:', badgeId);
    // 수정 모드 진입 또는 수정 페이지로 이동하는 로직
  };

  const fetchBadgeDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUEST.ADMIN}/badges/${badgeId}`);
      setBadgeDetail(response.data);
    } catch (err) {
      console.error("Failed to fetch badge detail", err);
      setBadgeDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (badgeId) {
      fetchBadgeDetail();
    }
  }, [badgeId]);

  const onClose = () => {
    window.scrollTo(0, 0);
    navigate('/quest-admin/badge');
  };

  const handleQuestDetail = (quest) => {
    window.scrollTo(0, 0);
    navigate(`/quest-admin/quest/${quest.id}`);
  }

  const handleUserClick = (user) => {
    window.scrollTo(0, 0);
    console.log(user.user_id);
    //#NeedToChange 
    //navigate(`/quest-admin/quest/${user.user_id}`);
  }

  if (loading) {
    return (
      <div className={styles.badgeAdminDetail}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (!badgeDetail) {
    return (
      <div className={styles.badgeAdminDetail}>
        <div className={styles.error}>뱃지 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.badgeAdminDetail}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.detailTitle}>Badge Detail</h2>
        <button className={styles.closeButton} onClick={onClose}>
          목록으로 돌아가기
        </button>
      </div>

      {/* Badge Info Section */}
      <div className={styles.badgeInfo}>
        <div className={styles.infoGrid}>
          {/* Basic Info */}
          <div className={styles.basicInfo}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>ID</label>
              <span className={styles.infoValue}>{badgeDetail.id}</span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Korean Title</label>
              <span className={styles.infoValue}>{badgeDetail.kor_title}</span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>English Title</label>
              <span className={styles.infoValue}>{badgeDetail.eng_title}</span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Difficulty</label>
              <span className={`${styles.difficultyTag} ${styles[`difficulty${badgeDetail.difficulty}`]}`}>
                Level {badgeDetail.difficulty}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Awarded Users</label>
              <span className={styles.awardedValue}>{badgeDetail.count_awarded}</span>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Created</label>
              <span className={styles.infoValue}>{formatDate(badgeDetail.created_at)}</span>
            </div>
          </div>

          {/* Description & Icon Section */}
          <div className={styles.descriptionSection}>
            <div className={styles.badgeIconSection}>
              <label className={styles.infoLabel}>Badge Icon</label>
              <img 
                src={badgeDetail.icon} 
                alt={badgeDetail.kor_title}
                className={styles.badgeIconLarge}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            
            <div className={styles.descriptionContent}>
              <label className={styles.infoLabel}>Description</label>
              <div className={styles.descriptionText}>
                {badgeDetail.description || '-'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button className={styles.editButton} onClick={handleEdit}>
                ✏️ 수정하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Required Quests Section */}
      <div className={styles.questsSection}>
        <h3 className={styles.sectionTitle}>Required Quests</h3>
        <div className={styles.questsGrid}>
          {badgeDetail.quest_list && badgeDetail.quest_list.length > 0 ? (
            badgeDetail.quest_list.map((quest) => (
              <div key={quest.id} className={styles.questCard} onClick={() => {handleQuestDetail(quest)}}>
                <div className={styles.questId}>#{quest.id}</div>
                <div className={styles.questTitle}>{quest.title}</div>
                <div className={styles.questStats}>
                  <span className={styles.statItem}>
                    <span className={styles.statLabel}>In Progress:</span>
                    <span className={styles.statValue}>{quest.count_in_progress}</span>
                  </span>
                  <span className={styles.statItem}>
                    <span className={styles.statLabel}>Completed:</span>
                    <span className={styles.statValue}>{quest.count_completed}</span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noQuests}>연결된 퀘스트가 없습니다</div>
          )}
        </div>
      </div>

      {/* Awarded Users Section */}
      <div className={styles.usersSection}>
        <div className={styles.usersHeader}>
          <h3 className={styles.sectionTitle}>Awarded Users</h3>
          <span className={styles.usersCount}>Total {badgeDetail.count_awarded} users</span>
        </div>

        <div className={styles.usersGrid}>
          {badgeDetail.awarded_user && badgeDetail.awarded_user.length > 0 ? (
            badgeDetail.awarded_user.map((user, index) => (
              <div key={`${user.user_id}-${index}`} className={styles.userCard} 
                onClick={(user)=>{handleUserClick(user)}}>
                <div className={styles.userProfile}>
                  <img 
                    src={user.profile_image || '/icons/common/user_profile.svg'} 
                    alt={user.nickname}
                    className={styles.userAvatar}
                  />
                  <div className={styles.userInfo}>
                    <div className={styles.userNickname}>{user.nickname}</div>
                    <div className={styles.userId}>{user.user_id}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noUsers}>아직 이 뱃지를 획득한 사용자가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(BadgeAdminDetail);
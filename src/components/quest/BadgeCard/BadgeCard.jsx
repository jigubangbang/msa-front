import React, { useState } from 'react';
import styles from './BadgeCard.module.css';
import { useNavigate } from 'react-router-dom';



const BadgeCard = ({userBadge, isLogin=false}) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    window.scrollTo(0, 0);
    navigate(`/quest/badge`);
  };

  const badges=userBadge?.badges || [];
  const displayBadges = badges.slice(0, 5);

  return (
    <div className={styles.badgeCard}>
       <div className={styles.content}>
        {(displayBadges.length > 0 && isLogin) ? (
            displayBadges.map((badges, index) => (
                <div key={badges.badge_id || index} className={styles.badgeItem}>
                    <img
                        src={badges.icon}
                        alt={badges.kor_title || badges.eng_title || 'Badge'}
                        className={styles.badgeIcon}/>
                </div>
            ))
        ) : (
            // 뱃지가 없거나 로그아웃 상태일 때 unknown_badge 5개 표시
            Array.from({ length: 5 }, (_, index) => (
                <div key={`unknown-${index}`} className={styles.badgeItem}>
                    <img
                        src="/icons/common/unknwon_badge.png"
                        alt="Unknown Badge"
                        className={styles.badgeIcon}/>
                </div>
            ))
        )}
      </div>

      <button className={`${styles.btn}`}
          onClick={handleButtonClick}>View All Badges →</button>
    </div>
  );
};

export default BadgeCard;
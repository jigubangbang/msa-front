import React, { useState } from 'react';
import styles from './BadgeCard.module.css';


const BadgeCard = ({userBadge}) => {

  const handleButtonClick = () => {
    // #NeedToChange
    console.log(`Navigating to "View all Badges" Page`);
  };

  const badges=userBadge?.badges || [];
  const displayBadges = badges.slice(0, 5);

  return (
    <div className={styles.badgeCard}>

      <div className={styles.content}>
        {displayBadges.length > 0 ? (
            displayBadges.map((badges, index) => (
                <div key={badges.badge_id || index} className={styles.badgeItem}>
                    <img
                        src={badges.icon}
                        alt={badges.kor_title || badges.eng_title || 'Badge'}
                        className={styles.badgeIcon}/>
                </div>
            ))
        ):(
            <div className={styles.title}>
                <h2>획득한 뱃지가 아직 없습니다.</h2>
            </div>
        )}
      </div>

        <button className={`${styles.btn}`}
          onClick={handleButtonClick}>View All Badges →</button>
    </div>
  );
};

export default BadgeCard;
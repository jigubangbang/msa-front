import React, { useState } from 'react';
import styles from './RankCard.module.css';


const RankCard = ({ 
  title, 
  count, 
  totalCount
}) => {

  const handleButtonClick = () => {
    // #NeedToChange
    console.log(`Navigating to rank Page`);
  };

  return (
    <div className={styles.rankCard}>

      <div className={styles.content}>
        <h2 className={styles.title}>
          {title}
        </h2>
      </div>
        <p className={styles.count}>
          : {count}th Out of {totalCount}
        </p>
        <button className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleButtonClick}>View Full Rankings →</button>
    </div>
  );
};

export default RankCard;
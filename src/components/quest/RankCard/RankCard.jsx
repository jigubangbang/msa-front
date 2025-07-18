import React, { useState } from 'react';
import styles from './RankCard.module.css';
import { useNavigate } from "react-router-dom";

const RankCard = ({ 
  title, 
  count, 
  totalCount,
  isLogin=false
}) => {

  const navigate = useNavigate();

  const handleButtonClick = () => {
    window.scrollTo(0, 0);
    navigate(`/rank/list`);
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) {
      return num + "st";
    }
    if (j === 2 && k !== 12) {
      return num + "nd";
    }
    if (j === 3 && k !== 13) {
      return num + "rd";
    }
    return num + "th";
  };

  return (
    <div className={styles.rankCard}>

      <div className={styles.content}>
        <h2 className={styles.title}>
          {title}
        </h2>
      </div>
      <div className={styles.count}>
        <span className={styles.currentRank}>{isLogin ? count : "?"}위</span>
        <span className={styles.totalCount}> / {isLogin ? totalCount : "??"}</span>
      </div>
        <button className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleButtonClick}>전체 순위 보기→</button>
    </div>
  );
};

export default RankCard;
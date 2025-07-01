import React, { useState } from 'react';
import styles from './RankCard.module.css';
import { useNavigate } from "react-router-dom";

const RankCard = ({ 
  title, 
  count, 
  totalCount,
  isLogin=true
}) => {

  const navigate = useNavigate();

  const handleButtonClick = () => {
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
      <p className={styles.count}>
      : {isLogin ? getOrdinalSuffix(count) : "?"} Out of {isLogin ? totalCount : "??"}
      </p>
        <button className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleButtonClick}>View Full Rankings →</button>
    </div>
  );
};

export default RankCard;
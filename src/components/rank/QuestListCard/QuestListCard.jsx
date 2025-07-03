import React, { useState } from 'react';
import styles from './QuestListCard.module.css';

const QuestListCard = ({ 
  title, 
  quest=[],
  isLogin=false
}) => {

  const handleButtonClick = () => {
    // #NeedToChange
    console.log(`Navigating to My Quest Page`);
  };

  const handleLoginClick = () => {
    window.scrollTo(0, 0);
    navigate('/login');
  }

  const displayQuests = quest.slice(0, 10);

  return (
    <div className={styles.QuestCard}>

      <div className={styles.content}>
        <h2 className={styles.title}>
          {title}
        </h2>

        <div className={styles.questList}>
          {displayQuests.length > 0 ? (
            displayQuests.map((questItem, index) => (
              <div key={questItem.id || index} className={styles.questItem}>
                <span className={styles.questTitle}>{questItem.title}</span>
              </div>
            ))
          ) : (
            <div className={styles.noQuests}>
              진행 중인 퀘스트가 <br/>없습니다.
            </div>
          )}
        </div>

      </div>
      
      {isLogin ? (
        <button className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleButtonClick}>View My Quests →</button>
      ) : (<button className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleLoginClick}>로그인 하러 가기 →</button>)}
    </div>
  );
};

export default QuestListCard;
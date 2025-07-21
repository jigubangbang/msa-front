import React from 'react';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ data }) => {
  // 전체 진행률 계산
  const totalProgress = Math.round((data.quest.count_completed / data.quest.count_total_quest) * 100);
  
  // 뱃지 진행률 계산
  const badgeProgress = Math.round((data.badge.count_awarded_badge / data.badge.count_total_badge) * 100);

  const ProgressBarItem = ({ title, completed, total, progress, type }) => (
    <div className={styles.progressItem}>
      <div className={styles.progressHeader}>
        <span className={styles.progressLabel}>{title}</span>
        <span className={styles.progressPercentage}>
          {progress}%
        </span>
      </div>
      <div className={styles.progressTrack}>
        <div 
          className={`${styles.progressFill} ${styles[type]}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className={styles.progressDescription}>
        전체 {total}개의 {title.toLowerCase()} 중 {completed}개의 {title.toLowerCase()}를 {title === 'Quest' ? '완료' : '획득'}했습니다
      </p>
    </div>
  );

  return (
    <div className={styles.container}>

      <ProgressBarItem
        title="퀘스트"
        completed={data.quest.count_completed}
        total={data.quest.count_total_quest}
        progress={totalProgress}
        type="quest"
      />
      
      <ProgressBarItem
        title="뱃지"
        completed={data.badge.count_awarded_badge}
        total={data.badge.count_total_badge}
        progress={badgeProgress}
        type="badge"
      />
    </div>
  );
};

export default ProgressBar;
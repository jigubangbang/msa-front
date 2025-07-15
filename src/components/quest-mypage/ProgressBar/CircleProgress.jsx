// CircleProgress.jsx
import React from 'react';
import { CircularProgressBar } from "@tomickigrzegorz/react-circular-progress-bar";
import styles from './CircleProgress.module.css';

const CircleProgressItem = ({ title, subtitle, completed, total }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  //colorSlice: 색 지금 기본 색으로 되어 있음
  return (
    <div className={styles.circleItem}>
      <div className={styles.circleContainer}>
        <CircularProgressBar
    percent={percentage}
    size={100}
    borderWidth={6}
    colorCircle="#ededed"
    borderBgColor="#e5e7eb"
    borderColor="#1f2937"
    fontColor="#1f2937"
    fontSize="20px"
    fontWeight={700}
    round
    transition
  />
      </div>
      
      <div className={styles.categoryInfo}>
        <div className={styles.categoryTitle}>{title}</div>
        <div className={styles.categorySubtitle}>{subtitle}</div>
        <div className={styles.categoryStats}>
          {completed}/{total} 완료
        </div>
      </div>
    </div>
  );
};

const CircleProgress = ({ questData }) => {
  return (
    <div className={styles.container}>
      
      <div className={styles.scrollContainer}>
        <div className={styles.circleList}>
          {questData.total_quests.map((category) => (
            <CircleProgressItem
              key={category.id}
              title={category.title}
              subtitle={category.subtitle}
              completed={category.count_completed}
              total={category.count_total}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CircleProgress;
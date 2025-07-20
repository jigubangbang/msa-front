import React, { useState } from 'react';
import styles from './QuestSlider.module.css';

const QuestSliderCard = ({ quest, onClick }) => {
  const getDifficultyText = (difficulty) => {
    switch(difficulty) {
      case 'EASY': return '하';
      case 'MEDIUM': return '중';
      case 'HARD': return '상';
      default: return difficulty;
    }
  };

    const calculateCompletionRate = () => {
        const total = quest.count_in_progress + quest.count_completed;
        if (total === 0) return 0;
        return Math.round((quest.count_completed / total) * 100);
    };

    const getStarCount = (difficulty) => {
        switch(difficulty) {
            case 'EASY': return 1;
            case 'MEDIUM': return 3;
            case 'HARD': return 5;
            default: return 1;
        }
    };

  return (
    <div className={styles.questSliderCard} onClick={() => onClick(quest)}>
      <div className={styles.starDecoration}>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={styles.star}>
            {index < getStarCount(quest.difficulty) ? '★' : '☆'}
          </span>
        ))}
      </div>
      
      <div className={styles.questTitle}>{quest.title}</div>
      
      <div className={styles.questInfo}>
        <span className={styles.label}>난이도</span>
        <span className={styles.value}>{getDifficultyText(quest.difficulty)}</span>
        <span className={styles.label2}>XP</span>
        <span className={styles.value}>{quest.xp}</span>
      </div>
      
      <div className={styles.questBottom}>
        <div className={styles.questIcon}>
          <img src={quest.icon || "/icons/common/unknwon_badge.png"} alt="quest icon" />
        </div>
        <div className={styles.questStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>현재 도전 중</span>
            <span className={styles.statValue}>{quest.count_in_progress}명</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>완료율</span>
            <span className={styles.statValue}>{calculateCompletionRate()}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestSlider = ({ quests = [], title = "Seasonal Events", onOpenModal }) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const questsPerPage = 5;
  const totalPages = Math.ceil((quests || []).length / questsPerPage);
  
  const startIndex = currentPage * questsPerPage;
  const endIndex = startIndex + questsPerPage;
  const currentQuests = quests.slice(startIndex, endIndex);

  const handleQuestClick = (quest) => {
    if (onOpenModal && quest.id) {
      onOpenModal(quest.id);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageIndicatorClick = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  if (!quests || quests.length === 0) {
    return (
      <div className={styles.questSlider}>
        <div className={styles.sliderHeader}>
            <h2 className={styles.sliderTitle}>{title}</h2>
        </div>
        <div className={styles.emptyState}>
          <p>진행 중인 시즌 이벤트가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.questSlider}>
      <div className={styles.sliderHeader}>
        <h2 className={styles.sliderTitle}>{title}</h2>
      </div>
      
      <div className={styles.questContainer}>
        <div className={styles.questGrid}>
          {currentQuests
            .filter(quest => quest.status === "ACTIVE")
            .map((quest) => (
              <QuestSliderCard
                key={quest.id}
                quest={quest}
                onClick={handleQuestClick}
              />
            ))}
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className={styles.carouselControls}>
          <button 
            className={styles.navBtn} 
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            ←
          </button>
          
          <div className={styles.pageIndicators}>
            {Array.from({ length: totalPages }, (_, i) => (
              <div
                key={i}
                className={`${styles.indicator} ${i === currentPage ? styles.active : ''}`}
                onClick={() => handlePageIndicatorClick(i)}
              />
            ))}
          </div>
          
          <button 
            className={styles.navBtn} 
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestSlider;
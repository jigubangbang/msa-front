import React, { useState, useRef } from 'react';
import styles from './QuestCarousel.module.css';

const QuestCard = ({ quest, isSelected, onClick, isLarge }) => (
  <div
    className={`${styles.questCard} ${isSelected ? styles.selected : ''} ${isLarge ? styles.large : ''}`}
    onClick={onClick}
  >
    <div className={styles.questContent}>
    <div className={styles.questHeader}>
      <div className={styles.questLevel}>
        Lv.{quest.level} ({quest.xp}XP)
      </div>
      <div className={styles.questTitle}>{quest.title}</div>
    </div>
    
    <div className={styles.questBadge}>
        <img src={quest.icon} alt="badge icon"/>
      </div>
    
    </div>
    
    {isLarge && (
      <>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${quest.progress}%` }}
            ></div>
          </div>
          <div className={styles.progressText}>
            {quest.badge} 뱃지 획득까지 {quest.progress}% 진행되었습니다.
          </div>
        </div>
        
        <div className={styles.questActions}>
          <button className={styles.btnSecondary}>인증하기</button>
          <button className={styles.btnSecondary}>포기하기</button>
        </div>
      </>
    )}
  </div>
);

const QuestCarousel = ({ quests = [], title= "" }) => {
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef(null);

  const questsPerPage = 4;
  const totalPages = Math.ceil((quests || []).length / questsPerPage);
  
  const startIndex = currentPage * questsPerPage;
  const endIndex = startIndex + questsPerPage;
  const currentQuests = quests.slice(startIndex, endIndex);

  const currentSelectedId = selectedQuestId && currentQuests.find(q => q.id === selectedQuestId) 
    ? selectedQuestId 
    : currentQuests[0]?.id || null;

  const arrangedQuests = [...currentQuests];
  if (currentSelectedId) {
    const selectedIndex = arrangedQuests.findIndex(q => q.id === currentSelectedId);
    if (selectedIndex > 0) {
      const selected = arrangedQuests.splice(selectedIndex, 1)[0];
      arrangedQuests.unshift(selected);
    }
  }

  const handleQuestClick = (questId) => {
    setSelectedQuestId(questId);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 100;
    const distance = containerRef.current.scrollLeft - scrollLeft;
    
    if (distance > threshold && currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      setSelectedQuestId(null); 
    } else if (distance < -threshold && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setSelectedQuestId(null); 
    }
    
    containerRef.current.scrollLeft = 0;
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      setSelectedQuestId(null); 
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setSelectedQuestId(null); 
    }
  };

  const handlePageIndicatorClick = (pageIndex) => {
    setCurrentPage(pageIndex);
    setSelectedQuestId(null);
  };

  if (!quests || quests.length === 0) {
    return (
      <div className={styles.questCarousel}>
        <div className={styles.emptyState}>
          <p>진행 중인 퀘스트가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.questCarousel}>
      <div 
        className={styles.questContainer}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.questGrid}>
          <h2 className={styles.carouselTitle}>{title}</h2>
          
          {/* 선택된 퀘스트 */}
          <div className={styles.selectedQuestArea}>
            {arrangedQuests[0] && (
              <QuestCard
                key={arrangedQuests[0].id}
                quest={arrangedQuests[0]}
                isSelected={true}
                isLarge={true}
                onClick={() => handleQuestClick(arrangedQuests[0].id)}
              />
            )}
          </div>
          
          {/* 나머지 퀘스트들 */}
          <div className={styles.otherQuestsArea}>
            {arrangedQuests.slice(1).map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                isSelected={false}
                isLarge={false}
                onClick={() => handleQuestClick(quest.id)}
              />
            ))}
          </div>
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

export default QuestCarousel;
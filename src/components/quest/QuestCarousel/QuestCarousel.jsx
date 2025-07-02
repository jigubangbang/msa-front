import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuestCarousel.module.css';

const QuestCard = ({ quest, isSelected, onClick, isLarge, onOpenModal}) => {
  //#NeedToChange
  const handleCertify = (e) => {
    e.stopPropagation();
    console.log(`click certify ${quest.id}`)
  }

  const handleGiveUp = (e) => {
    e.stopPropagation();
    console.log(`click giveup ${quest.id}`);
  }

  const handleCardClick = () => {
    if (isLarge){
      onOpenModal(quest.quest_id);
    }
    else{
      onClick();
    }
  }

    const getDifficultyText = (difficulty) => {
    switch(difficulty) {
      case 'EASY': return '초급';
      case 'MEDIUM': return '중급';
      case 'HARD': return '고급';
      default: return difficulty;
    }
  };

  return(
    <div
      className={`${styles.questCard} ${isSelected ? styles.selected : ''} ${isLarge ? styles.large : ''}`}
      onClick={handleCardClick}
    >
      <div className={styles.questContent}>
      <div className={styles.questHeader}>
        <div className={styles.questLevel}>
          {getDifficultyText(quest.difficulty)} ({quest.xp}XP)
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
            <button className={styles.btnSecondary} onClick={handleCertify}>
              인증하기
              </button>
            <button className={styles.btnSecondary} onClick={handleGiveUp}>
              포기하기
              </button>
          </div>
        </>
      )}
    </div>
  );
};

const QuestCarousel = ({ quests = [], title= "", onOpenModal, isLogin = false }) => {
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const navigate = useNavigate();

  const questsPerPage = 4;
  const totalPages = Math.ceil((quests || []).length / questsPerPage);
  
  const startIndex = currentPage * questsPerPage;
  const endIndex = startIndex + questsPerPage;
  const currentQuests = quests ? quests.slice(startIndex, endIndex) : [];
  
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

  const handleLoginClick = () => {
    window.scrollTo(0, 0);
   navigate('/login');
  };

const handleSignupClick = () => {
  window.scrollTo(0, 0);
    navigate('/register');
  };

  if (!isLogin) {
    return (
      <div className={styles.questCarousel}>
        <div className={styles.questContainer}>
          <div className={styles.questGrid}>
            <h2 className={styles.carouselTitle}>{title}</h2>
            
            {/* 로그인 퀘스트 카드 */}
            <div className={styles.selectedQuestArea}>
              <div className={`${styles.questCard} ${styles.selected} ${styles.large}`}>
                <div className={styles.questContent}>
                  <div className={styles.questHeader}>
                    <div className={styles.questLevel}>
                      왕초급 (?XP)
                    </div>
                    <div className={styles.questTitle}>지구방방의 퀘스트를 즐겨보세요</div>
                  </div>
                  
                  <div className={styles.questBadge}>
                    <img src="/icons/common/unknwon_badge.png" alt="quest icon"/>
                  </div>
                </div>
                
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `100%` }}
                    ></div>
                  </div>
                  <div className={styles.progressText}>
                    방방이가 되기까지 0% 남았습니다.
                  </div>
                </div>
                
                <div className={styles.questActions}>
                  <button className={styles.btnSecondary} onClick={handleLoginClick}>
                    로그인하기
                  </button>
                  <button className={styles.btnSecondary} onClick={handleSignupClick}>
                    회원가입하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        className={styles.questContainer}>
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
                onOpenModal={onOpenModal}
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
                onOpenModal={onOpenModal}
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